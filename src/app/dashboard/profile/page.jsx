import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Profile | Loanzaar',
  description: 'Manage your profile information'
}

export default function Profile() {
  // The legacy `UserProfilePage` was removed — redirect to the public profile route
  redirect('/profile')
}
