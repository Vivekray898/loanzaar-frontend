'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const ProductsPage = dynamic(() => import('@/pages/ProductsPage'), { ssr: false })

export default function ProductsClient() {
  return (
    <>
      <ProductsPage />
      <BottomNav />
    </>
  )
}
