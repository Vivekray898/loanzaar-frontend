// Schema.org structured data generator for SEO
// Based on FinancialService and Organization types

const COMPANY_INFO = {
  name: "LoanZaar",
  alternateName: "LoanZaar Loan Distribution",
  url: "https://www.loanzaar.com/",
  logo: "https://www.loanzaar.com/logo.png",
  image: "https://www.loanzaar.com/logo.png",
  telephone: "+91 90290 59005",
  tollFreeNumber: "1800-266-7576",
  priceRange: "INR",
  address: {
    streetAddress: "Your Street Address",
    addressLocality: "Your City",
    postalCode: "400 069",
    addressCountry: "IN"
  },
  geo: {
    latitude: 19.117753,
    longitude: 72.8737017
  },
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "19:00"
  },
  socialMedia: {
    facebook: "https://www.facebook.com/loanzaar",
    linkedin: "https://www.linkedin.com/company/loanzaar"
  }
}

/**
 * Generate FinancialService schema
 */
export function generateFinancialServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": COMPANY_INFO.name,
    "image": COMPANY_INFO.image,
    "@id": "",
    "url": COMPANY_INFO.url,
    "telephone": COMPANY_INFO.telephone,
    "priceRange": COMPANY_INFO.priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": COMPANY_INFO.address.streetAddress,
      "addressLocality": COMPANY_INFO.address.addressLocality,
      "postalCode": COMPANY_INFO.address.postalCode,
      "addressCountry": COMPANY_INFO.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": COMPANY_INFO.geo.latitude,
      "longitude": COMPANY_INFO.geo.longitude
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": COMPANY_INFO.openingHours.days,
      "opens": COMPANY_INFO.openingHours.opens,
      "closes": COMPANY_INFO.openingHours.closes
    }
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": COMPANY_INFO.name,
    "alternateName": COMPANY_INFO.alternateName,
    "url": COMPANY_INFO.url,
    "logo": COMPANY_INFO.logo,
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": COMPANY_INFO.tollFreeNumber,
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "IN",
        "availableLanguage": "en"
      },
      {
        "@type": "ContactPoint",
        "telephone": COMPANY_INFO.telephone,
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": "en"
      }
    ],
    "sameAs": [
      COMPANY_INFO.socialMedia.facebook,
      COMPANY_INFO.socialMedia.linkedin
    ]
  }
}

/**
 * Generate WebPage schema for specific pages
 * @param {{ title: string, description: string, url: string, breadcrumbs?: Array<{name: string, url: string}> }} options
 */
export function generateWebPageSchema({ title, description, url, breadcrumbs = [] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url
  }

  if (breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    }
  }

  return schema
}

/**
 * Generate LoanOrCredit schema for loan product pages
 */
export function generateLoanSchema({ loanType, description, interestRate, amount, tenure }) {
  return {
    "@context": "https://schema.org",
    "@type": "LoanOrCredit",
    "name": loanType,
    "description": description,
    "provider": {
      "@type": "FinancialService",
      "name": COMPANY_INFO.name
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": amount || "Variable",
      "availability": "https://schema.org/InStock"
    },
    ...(interestRate && { "interestRate": interestRate }),
    ...(tenure && { "loanTerm": tenure })
  }
}

/**
 * Generate SoftwareApplication schema for EMI Calculator
 */
export function generateCalculatorSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EMI Calculator",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "operatingSystem": "Any",
    "description": "Calculate your loan EMI (Equated Monthly Installment) for home loans, personal loans, and business loans with our free online EMI calculator."
  }
}

/**
 * Generate all base schemas (FinancialService + Organization)
 */
export function generateBaseSchemas() {
  return [
    generateFinancialServiceSchema(),
    generateOrganizationSchema()
  ]
}
