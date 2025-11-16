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
    const { essay1Id, essay2Id, beforeEssayId, afterEssayId } = body
    
    // Support both parameter naming conventions
    const firstId = essay1Id || beforeEssayId
    const secondId = essay2Id || afterEssayId

    if (!firstId || !secondId) {
      return NextResponse.json(
        { error: 'Both essay IDs are required' },
        { status: 400 }
      )
    }

    // Fetch both essays
    const [beforeEssay, afterEssay] = await Promise.all([
      prisma.essay.findFirst({
        where: { id: firstId, userId: session.user.id }
      }),
      prisma.essay.findFirst({
        where: { id: secondId, userId: session.user.id }
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
        beforeEssayId: firstId,
        afterEssayId: secondId,
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
