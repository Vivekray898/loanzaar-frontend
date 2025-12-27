import type { Metadata } from 'next'
import TrackPage from './TrackPage'

export const metadata: Metadata = {
  title: 'Profile | Loanzaar',
  description: 'Edit your profile'
}

export default function ProfilePage() {
  return <TrackPage />
}