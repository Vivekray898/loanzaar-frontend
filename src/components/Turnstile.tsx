'use client';

import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Turnstile as MarsTurnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

// --- Types ---

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined | null;
}

export interface TurnstileProps extends React.HTMLAttributes<HTMLDivElement> {
  sitekey?: string;
  onVerify?: (token: string) => void;
  onExpired?: () => void;
  onLoad?: () => void;
  onError?: (error?: any) => void;
  onBeforeInteractive?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  options?: any; // To pass extra options if needed
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>((props, ref) => {
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

  // Standardize sitekey with env variable fallbacks
  const finalSiteKey = sitekey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || '';
  
  // Internal ref to the library instance
  const marsRef = useRef<TurnstileInstance>(null);
  const [failed, setFailed] = useState(false);

  // Expose reset/getResponse to parent via ref
  useImperativeHandle(ref, () => ({
    reset() {
      marsRef.current?.reset();
    },
    getResponse() {
      return marsRef.current?.getResponse();
    }
  }));

  if (!finalSiteKey) {
    console.warn('Turnstile: Missing sitekey');
    return null;
  }

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

  return (
    <div {...rest}>
      <MarsTurnstile
        ref={marsRef}
        siteKey={finalSiteKey}
        options={{
          theme: theme,
          action: props.options?.action,
          cData: props.options?.cData,
        }}
        onSuccess={(token) => {
          onVerify?.(token);
        }}
        onExpire={() => {
          onExpired?.();
        }}
        onError={(err) => {
          setFailed(true);
          onError?.(err);
        }}
        onBeforeInteractive={onBeforeInteractive}
      />
    </div>
  );
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;