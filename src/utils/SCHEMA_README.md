# Schema.org Structured Data System

This directory contains utilities for generating and injecting Schema.org structured data across the application for improved SEO.

## Files

- **`schema.js`** - Schema generators for various schema types (FinancialService, Organization, WebPage, LoanOrCredit, etc.)
- **`StructuredData.jsx`** - React component that injects JSON-LD into the page

## Usage

### Global Schema (All Pages)

The base schemas (FinancialService + Organization) are automatically injected on all public pages via `layout-client.jsx`.

### Page-Specific Schema

Add custom schemas to individual pages:

```jsx
import StructuredData from '@/components/StructuredData'
import { generateWebPageSchema, generateLoanSchema } from '@/utils/schema'

export default function MyPage() {
  const schemas = [
    generateWebPageSchema({
      title: 'Page Title',
      description: 'Page description',
      url: 'https://www.loanzaar.com/my-page',
      breadcrumbs: [
        { name: 'Home', url: 'https://www.loanzaar.com' },
        { name: 'My Page', url: 'https://www.loanzaar.com/my-page' }
      ]
    }),
    generateLoanSchema({
      loanType: 'Home Loan',
      description: 'Get the best home loan rates',
      interestRate: '8.5%',
      amount: '5000000',
      tenure: '20 years'
    })
  ]

  return (
    <div>
      <StructuredData schema={schemas} />
      {/* Your page content */}
    </div>
  )
}
```

## Available Schema Generators

1. **`generateFinancialServiceSchema()`** - Company as a financial service
2. **`generateOrganizationSchema()`** - Company organization details
3. **`generateWebPageSchema(options)`** - WebPage with breadcrumbs
4. **`generateLoanSchema(options)`** - LoanOrCredit product
5. **`generateCalculatorSchema()`** - EMI Calculator as SoftwareApplication
6. **`generateBaseSchemas()`** - Returns both FinancialService + Organization

## Configuration

Update company information in `src/utils/schema.js`:

```javascript
const COMPANY_INFO = {
  name: "LoanZaar",
  url: "https://www.loanzaar.com/",
  telephone: "+91 90290 59005",
  // ... other details
}
```

## Testing

View injected schemas by:
1. Opening browser DevTools
2. Inspecting `<head>` section
3. Looking for `<script type="application/ld+json">` tags
4. Or use [Google Rich Results Test](https://search.google.com/test/rich-results)
