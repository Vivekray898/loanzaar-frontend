import React, { useContext } from 'react';
import { PageTransitionContext } from '../context/PageTransitionContext';

export default function PageTransitionOverlay() {
  const { isTransitioning } = useContext(PageTransitionContext);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 bg-black opacity-50 z-50 pointer-events-none transition-opacity duration-700" />
  );
}
