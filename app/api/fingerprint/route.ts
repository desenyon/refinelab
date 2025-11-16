import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractWritingFingerprint } from '@/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if fingerprint exists
    let fingerprint = await prisma.writingFingerprint.findUnique({
      where: { userId: session.user.id }
    })

    // If not exists or outdated, generate new one
    if (!fingerprint) {
      const essays = await prisma.essay.findMany({
        where: { userId: session.user.id },
        select: { 
          content: true,
          thesisClarity: true,
          argumentDepth: true,
          structureBalance: true,
          evidenceDistribution: true,
          analysisToSummaryRatio: true,
          sentenceVariety: true,
        },
        orderBy: { uploadedAt: 'desc' },
        take: 10 // Analyze last 10 essays
      })

      if (essays.length === 0) {
        return NextResponse.json({ error: 'No essays found to analyze' }, { status: 404 })
      }

      const essaysData = essays.map((e: any) => ({
        content: e.content,
        metrics: {
          thesisClarity: e.thesisClarity,
          argumentDepth: e.argumentDepth,
          structureBalance: e.structureBalance,
          evidenceDistribution: e.evidenceDistribution,
          analysisToSummaryRatio: e.analysisToSummaryRatio,
          sentenceVariety: e.sentenceVariety,
        }
      }))

      const analysis = await extractWritingFingerprint(essaysData)

      // Calculate aggregate metrics
      const avgParagraphLength = essays.reduce((sum: number, e: any) => {
        const paragraphs = e.content.split('\n\n').filter((p: string) => p.trim().length > 0)
        const avgWords = paragraphs.reduce((s: number, p: string) => s + p.split(' ').length, 0) / paragraphs.length
        return sum + avgWords
      }, 0) / essays.length

      fingerprint = await prisma.writingFingerprint.upsert({
        where: { userId: session.user.id },
        update: {
          formalityScore: 0.75, // Placeholder - would need more sophisticated analysis
          confidenceScore: 0.70, // Placeholder
          averageParagraphLength: avgParagraphLength,
          introSummaryBalance: 0.65, // Placeholder
          evidencePatterns: JSON.parse(JSON.stringify(analysis.evidenceHabits)),
          structuralTendencies: JSON.parse(JSON.stringify(analysis.structuralPatterns)),
          toneTendencies: JSON.parse(JSON.stringify(analysis.toneTendencies)),
        },
        create: {
          userId: session.user.id,
          formalityScore: 0.75,
          confidenceScore: 0.70,
          averageParagraphLength: avgParagraphLength,
          introSummaryBalance: 0.65,
          evidencePatterns: JSON.parse(JSON.stringify(analysis.evidenceHabits)),
          structuralTendencies: JSON.parse(JSON.stringify(analysis.structuralPatterns)),
          toneTendencies: JSON.parse(JSON.stringify(analysis.toneTendencies)),
        }
      })
    }

    return NextResponse.json(fingerprint)
  } catch (error) {
    console.error('Error fetching fingerprint:', error)
    return NextResponse.json({ error: 'Failed to fetch fingerprint' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Force regeneration of fingerprint
    const essays = await prisma.essay.findMany({
      where: { userId: session.user.id },
      select: { 
        content: true,
        thesisClarity: true,
        argumentDepth: true,
        structureBalance: true,
        evidenceDistribution: true,
        analysisToSummaryRatio: true,
        sentenceVariety: true,
      },
      orderBy: { uploadedAt: 'desc' },
      take: 10
    })

    if (essays.length === 0) {
      return NextResponse.json({ error: 'No essays found to analyze' }, { status: 404 })
    }

    const essaysData = essays.map((e: any) => ({
      content: e.content,
      metrics: {
        thesisClarity: e.thesisClarity,
        argumentDepth: e.argumentDepth,
        structureBalance: e.structureBalance,
        evidenceDistribution: e.evidenceDistribution,
        analysisToSummaryRatio: e.analysisToSummaryRatio,
        sentenceVariety: e.sentenceVariety,
      }
    }))

    const analysis = await extractWritingFingerprint(essaysData)

    const avgParagraphLength = essays.reduce((sum: number, e: any) => {
      const paragraphs = e.content.split('\n\n').filter((p: string) => p.trim().length > 0)
      const avgWords = paragraphs.reduce((s: number, p: string) => s + p.split(' ').length, 0) / paragraphs.length
      return sum + avgWords
    }, 0) / essays.length

    const fingerprint = await prisma.writingFingerprint.upsert({
      where: { userId: session.user.id },
      update: {
        formalityScore: 0.75,
        confidenceScore: 0.70,
        averageParagraphLength: avgParagraphLength,
        introSummaryBalance: 0.65,
        evidencePatterns: JSON.parse(JSON.stringify(analysis.evidenceHabits)),
        structuralTendencies: JSON.parse(JSON.stringify(analysis.structuralPatterns)),
        toneTendencies: JSON.parse(JSON.stringify(analysis.toneTendencies)),
      },
      create: {
        userId: session.user.id,
        formalityScore: 0.75,
        confidenceScore: 0.70,
        averageParagraphLength: avgParagraphLength,
        introSummaryBalance: 0.65,
        evidencePatterns: JSON.parse(JSON.stringify(analysis.evidenceHabits)),
        structuralTendencies: JSON.parse(JSON.stringify(analysis.structuralPatterns)),
        toneTendencies: JSON.parse(JSON.stringify(analysis.toneTendencies)),
      }
    })

    return NextResponse.json(fingerprint)
  } catch (error) {
    console.error('Error regenerating fingerprint:', error)
    return NextResponse.json({ error: 'Failed to regenerate fingerprint' }, { status: 500 })
  }
}
