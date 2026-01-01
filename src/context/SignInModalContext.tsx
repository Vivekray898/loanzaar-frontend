'use client'

import React, { createContext, useContext, useState } from 'react';
import SignInModal from '@/components/SignInModal';

type SignInModalContextValue = {
  open: (next?: string) => void;
  close: () => void;
};

const SignInModalContext = createContext<SignInModalContextValue | undefined>(undefined);

export const useSignInModal = () => {
  const ctx = useContext(SignInModalContext);
  if (!ctx) throw new Error('useSignInModal must be used within SignInModalProvider');
  return ctx;
};

export const SignInModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openState, setOpenState] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | undefined>();

  const open = (next?: string) => {
    setNextRoute(next);
    setOpenState(true);
  };
  const close = () => {
    setOpenState(false);
    setNextRoute(undefined);
  };

  // On mount, check URL params to auto-open modal if requested
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'login') {
      open(params.get('next') || undefined);
      // remove modal param from URL to avoid re-opening
      params.delete('modal');
      params.delete('next');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SignInModalContext.Provider value={{ open, close }}>
      {children}
      <SignInModal open={openState} onClose={close} next={nextRoute} />
    </SignInModalContext.Provider>
  );
};
