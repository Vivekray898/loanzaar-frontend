'use client'

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Meta({ title = 'Loanzaar', description = 'Loanzaar - Loans & Insurance simplified' }) {
  const pathname = usePathname();

  useEffect(() => {
    // Force update of document title on route change
    document.title = title;
    
    // Force update of meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    // Also update Open Graph tags for social sharing
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;
  }, [title, description, pathname]);

  // No JSX needed, meta tags are set via useEffect
  return null;
}
