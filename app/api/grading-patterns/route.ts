import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patterns = await prisma.gradingPattern.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(patterns)
  } catch (error) {
    console.error('Error fetching grading patterns:', error)
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { assignmentName, grade, rubricData, penaltyAreas } = body

    const pattern = await prisma.gradingPattern.create({
      data: {
        userId: session.user.id,
        assignmentName,
        grade,
        rubricData: rubricData ? JSON.parse(JSON.stringify(rubricData)) : null,
        penaltyAreas: penaltyAreas ? JSON.parse(JSON.stringify(penaltyAreas)) : null
      }
    })

    return NextResponse.json(pattern)
  } catch (error) {
    console.error('Error creating grading pattern:', error)
    return NextResponse.json({ error: 'Failed to create pattern' }, { status: 500 })
  }
}
