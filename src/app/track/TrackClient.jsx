'use client'

import dynamic from 'next/dynamic'
import NavBar from '@/components/NavBar'
import BottomNav from '@/components/BottomNav'

const TrackPage = dynamic(() => import('@/pages/TrackPage'), { ssr: false })

export default function TrackClient() {
  return (
    <>
      <NavBar />
      <TrackPage />
      <BottomNav />
    </>
  )
}
