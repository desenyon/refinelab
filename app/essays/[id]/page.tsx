import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EssayDetailClient from './EssayDetailClient'

export default async function EssayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const essay = await prisma.essay.findFirst({
    where: {
      id,
      userId: session.user.id
    }
  })

  if (!essay) {
    redirect('/essays')
  }

  return <EssayDetailClient essay={essay} />
}
