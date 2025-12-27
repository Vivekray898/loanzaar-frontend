import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'Profile | Loanzaar',
  description: 'Edit your profile'
}

export default function ProfilePage() {
  return <ProfileClient />
}