'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const ProductsPage = dynamic(() => import('@/pages/ProductsPage'), { ssr: false })

export default function ProductsClient() {
  return (
    <>
      <NavBar />
      <ProductsPage />
      <BottomNav />
    </>
  )
}
