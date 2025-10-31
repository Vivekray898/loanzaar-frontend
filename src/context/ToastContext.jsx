'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

function Toast({ id, message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200'
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-amber-800'
  }[type];

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-amber-600'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  }[type];

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 mb-3 flex items-start gap-3 shadow-md animate-slide-in`}
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`${textColor} font-medium text-sm`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
    warning: (message) => addToast(message, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
