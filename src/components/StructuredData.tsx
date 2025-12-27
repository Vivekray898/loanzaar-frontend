'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  /** Schema.org object(s) to inject */
  schema: Record<string, any> | Record<string, any>[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * @param {Object|Array} schema - Schema.org object(s) to inject
 */
export default function StructuredData({ schema }: StructuredDataProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    
    // Handle both single schema and array of schemas
    const schemaData = Array.isArray(schema) ? schema : [schema]
    script.text = JSON.stringify(schemaData)
    
    // Append to head
    document.head.appendChild(script)
    
    // Cleanup on unmount
    return () => {
      // Ensure the script is still in the head before removing
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [schema])

  return null
}