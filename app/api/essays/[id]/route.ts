import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const essay = await prisma.essay.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    return NextResponse.json(essay)
  } catch (error) {
    console.error('Error fetching essay:', error)
    return NextResponse.json({ error: 'Failed to fetch essay' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.essay.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting essay:', error)
    return NextResponse.json({ error: 'Failed to delete essay' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { title, content } = body

    // Verify ownership
    const essay = await prisma.essay.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Update essay
    const updatedEssay = await prisma.essay.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ essay: updatedEssay })
  } catch (error) {
    console.error('Error updating essay:', error)
    return NextResponse.json({ error: 'Failed to update essay' }, { status: 500 })
  }
}
