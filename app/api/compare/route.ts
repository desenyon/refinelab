import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compareEssays } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { beforeEssayId, afterEssayId } = body

    if (!beforeEssayId || !afterEssayId) {
      return NextResponse.json(
        { error: 'Both essay IDs are required' },
        { status: 400 }
      )
    }

    // Fetch both essays
    const [beforeEssay, afterEssay] = await Promise.all([
      prisma.essay.findFirst({
        where: { id: beforeEssayId, userId: session.user.id }
      }),
      prisma.essay.findFirst({
        where: { id: afterEssayId, userId: session.user.id }
      })
    ])

    if (!beforeEssay || !afterEssay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Compare essays using AI
    const comparison = await compareEssays(beforeEssay.content, afterEssay.content)

    // Save comparison
    const savedComparison = await prisma.essayComparison.create({
      data: {
        beforeEssayId,
        afterEssayId,
        clarityDelta: comparison.clarityDelta,
        coherenceDelta: comparison.coherenceDelta,
        structureDelta: comparison.structureDelta,
        argumentDelta: comparison.argumentDelta,
        analysisDelta: comparison.analysisDelta,
        improvements: JSON.parse(JSON.stringify(comparison.improvements))
      }
    })

    return NextResponse.json({ comparison: savedComparison })
  } catch (error) {
    console.error('Error comparing essays:', error)
    return NextResponse.json({ error: 'Failed to compare essays' }, { status: 500 })
  }
}
