import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard | Loanzaar',
  description: 'Your personal loan and insurance dashboard'
}

export default function Dashboard() {
  // Redirect to account page since UserDashboardPage was removed
  redirect('/account')
}
