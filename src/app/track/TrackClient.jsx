'use client'

import dynamic from 'next/dynamic'
 
import BottomNav from '@/components/BottomNav'

const TrackPage = dynamic(() => import('@/pages/TrackPage'), { ssr: false })

export default function TrackClient() {
  return (
    <>
      <TrackPage />
      <BottomNav />
    </>
  )
}
