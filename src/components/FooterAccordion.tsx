'use client'

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FooterAccordionProps {
  title: string;
  children: React.ReactNode;
}

export default function FooterAccordion({ title, children }: FooterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 md:border-none last:border-none">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full py-4 flex items-center justify-between text-left md:py-0 md:mb-6 md:cursor-default group"
      >
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
          {title}
        </h4>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 md:hidden ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
        />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:pb-0'}`}>
        {children}
      </div>
    </div>
  );
}
