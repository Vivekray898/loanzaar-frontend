'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const SCRIPT_ID = 'cf-turnstile-script';

/**
 * Global script loader to ensure the script is injected only once.
 */
function injectScript(onLoad, onError) {
  if (typeof window === 'undefined') return;

  // 1. If turnstile is already ready, callback immediately
  if (window.turnstile) {
    onLoad();
    return;
  }

  // 2. If script is already in DOM, listen for the load event
  let script = document.getElementById(SCRIPT_ID);
  
  if (script) {
    // If script exists but isn't loaded yet, we need to poll or wait.
    // Cloudflare api.js doesn't expose a standard promise, so polling is safer here
    // if we missed the onload event.
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        onLoad();
      }
    }, 100);
    return;
  }

  // 3. Create and append script
  script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    // Sometimes window.turnstile isn't immediately available after onload
    if (window.turnstile) {
      onLoad();
    } else {
      // Fallback polling just in case
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          onLoad();
        }
      }, 50);
    }
  };
  
  script.onerror = (err) => onError(err);
  document.head.appendChild(script);
}

const Turnstile = forwardRef((props, ref) => {
  const { 
    sitekey, 
    onVerify, 
    onExpired, 
    onLoad, 
    onError, 
    onBeforeInteractive,
    theme = 'light', 
    ...rest 
  } = props;

  // Support both env variants for backwards compatibility and standardize on NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const finalSiteKey = sitekey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '';

  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [failed, setFailed] = useState(false);
  
  // Keep refs to callbacks to avoid resetting widget when functions are recreated
  const callbacksRef = useRef({ onVerify, onExpired, onError, onLoad, onBeforeInteractive });

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpired, onError, onLoad, onBeforeInteractive };
  }, [onVerify, onExpired, onError, onLoad, onBeforeInteractive]);

  useEffect(() => {
    if (!finalSiteKey) return;

    let mounted = true;

    const renderWidget = () => {
      if (!mounted || !containerRef.current || !window.turnstile) return;

      // Clean up existing widget if it exists (React Strict Mode handling)
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: finalSiteKey,
          theme,
          callback: (token) => callbacksRef.current.onVerify?.(token),
          'expired-callback': () => callbacksRef.current.onExpired?.(),
          'error-callback': (err) => {
            setFailed(true);
            callbacksRef.current.onError?.(err);
          },
          'before-interactive-callback': () => callbacksRef.current.onBeforeInteractive?.(),
        });

        widgetIdRef.current = id;
        setFailed(false);
        callbacksRef.current.onLoad?.();
      } catch (err) {
        console.error('Turnstile render error:', err);
        setFailed(true);
        callbacksRef.current.onError?.(err);
      }
    };

    injectScript(
      () => {
        if (mounted) renderWidget();
      },
      (err) => {
        if (mounted) {
          setFailed(true);
          callbacksRef.current.onError?.(err);
        }
      }
    );

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [sitekey, theme]); // Only re-run if sitekey or theme changes

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
    getResponse() {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current);
      }
      return null;
    }
  }));

  if (failed) {
    return (
      <div className="w-full text-center p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-800">
          Security check failed. 
          <button 
            type="button"
            className="ml-1 underline font-medium hover:text-red-900" 
            onClick={() => setFailed(false)}
          >
            Retry
          </button>
        </p>
      </div>
    );
  }

  return <div ref={containerRef} {...rest} />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;