import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LessonsClient from './LessonsClient'

export default async function LessonsPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LessonsClient />
    </Suspense>
  )
}
