import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import UploadClient from './UploadClient'

export default async function UploadPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <UploadClient />
}
