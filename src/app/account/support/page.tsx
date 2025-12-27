import type { Metadata } from 'next'
import SupportPage from './SupportPage'

export const metadata: Metadata = {
  title: 'Support | Loanzaar',
  description: 'Get help and support'
}

export default function Page() {
  return <SupportPage />
}