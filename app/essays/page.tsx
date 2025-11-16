import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import EssaysClient from './EssaysClient'

export default async function EssaysPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <EssaysClient />
}
