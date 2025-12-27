'use client'

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MetaProps {
  title?: string;
  description?: string;
}

export default function Meta({ 
  title = 'Loanzaar', 
  description = 'Loanzaar - Loans & Insurance simplified' 
}: MetaProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Force update of document title on route change
    document.title = title;
    
    // Force update of meta description tag
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
    
    // Also update Open Graph tags for social sharing
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;
    
    let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
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