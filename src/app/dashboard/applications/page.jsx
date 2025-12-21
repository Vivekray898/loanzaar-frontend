import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Applications | Loanzaar',
  description: 'View your loan and insurance applications'
}

export default function Applications() {
  redirect('/account')
}
