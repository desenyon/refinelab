import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeEssay } from '@/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const essays = await prisma.essay.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json(essays)
  } catch (error) {
    console.error('Error fetching essays:', error)
    return NextResponse.json({ error: 'Failed to fetch essays' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, assignmentName, teacherComments } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    console.log(`[Essay Analysis] Starting analysis for essay: "${title}"`)
    console.log(`[Essay Analysis] Content length: ${content.length} characters`)

    // Analyze essay with AI
    const analysis = await analyzeEssay(content)

    console.log(`[Essay Analysis] Analysis complete for "${title}"`)
    console.log(`[Essay Analysis] Metrics:`, {
      thesisClarity: analysis.metrics.thesisClarity,
      argumentDepth: analysis.metrics.argumentDepth,
      structureBalance: analysis.metrics.structureBalance,
      evidenceDistribution: analysis.metrics.evidenceDistribution,
      analysisToSummaryRatio: analysis.metrics.analysisToSummaryRatio,
      sentenceVariety: analysis.metrics.sentenceVariety,
      logicalProgression: analysis.metrics.logicalProgression
    })

    // Create essay in database
    const essay = await prisma.essay.create({
      data: {
        userId: session.user.id,
        title,
        content,
        assignmentName,
        teacherComments: teacherComments ? JSON.parse(JSON.stringify(teacherComments)) : null,
        thesisClarity: analysis.metrics.thesisClarity,
        argumentDepth: analysis.metrics.argumentDepth,
        structureBalance: analysis.metrics.structureBalance,
        evidenceDistribution: analysis.metrics.evidenceDistribution,
        analysisToSummaryRatio: analysis.metrics.analysisToSummaryRatio,
        sentenceVariety: analysis.metrics.sentenceVariety,
        logicalProgression: analysis.metrics.logicalProgression,
        paragraphAnalysis: JSON.parse(JSON.stringify(analysis.paragraphAnalysis)),
        strengthsWeaknesses: JSON.parse(JSON.stringify(analysis.strengthsWeaknesses))
      }
    })

    console.log(`[Essay Analysis] Essay saved to database with ID: ${essay.id}`)

    return NextResponse.json({ essay, analysis })
  } catch (error) {
    console.error('[Essay Analysis] Error creating essay:', error)
    return NextResponse.json({ error: 'Failed to create essay' }, { status: 500 })
  }
}
