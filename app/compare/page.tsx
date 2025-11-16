import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import CompareClient from './CompareClient'

export default async function ComparePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <CompareClient />
}
