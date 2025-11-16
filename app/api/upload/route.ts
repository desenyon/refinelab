import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { processUploadedFile } from '@/lib/document-processor'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const extracted = await processUploadedFile(file)

    return NextResponse.json({
      text: extracted.text,
      teacherComments: extracted.teacherComments || [],
      metadata: extracted.metadata
    })
  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
}
