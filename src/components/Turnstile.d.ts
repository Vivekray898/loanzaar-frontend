import React from 'react';

declare module '@/components/Turnstile' {
  type TurnstileProps = {
    sitekey?: string;
    onVerify?: (token: string) => void;
    onExpired?: () => void;
    onError?: (err: any) => void;
    onLoad?: () => void;
    onBeforeInteractive?: () => void;
    theme?: 'light' | 'dark';
    className?: string;
  };

  const Turnstile: React.ForwardRefExoticComponent<TurnstileProps & React.RefAttributes<any>>;
  export default Turnstile;
}
