import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ExtractedDocument {
  text: string
  teacherComments?: string[]
  metadata?: {
    fileName: string
    fileType: string
    pageCount?: number
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const data = await pdf(buffer)
    
    return {
      text: data.text,
      metadata: {
        fileName: 'uploaded.pdf',
        fileType: 'pdf',
        pageCount: data.numpages
      }
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    
    return {
      text: result.value,
      metadata: {
        fileName: 'uploaded.docx',
        fileType: 'docx'
      }
    }
  } catch (error) {
    console.error('DOCX extraction error:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
      logger: () => {} // Suppress logs
    })
    
    return {
      text,
      metadata: {
        fileName: 'uploaded-image',
        fileType: 'image'
      }
    }
  } catch (error) {
    console.error('OCR extraction error:', error)
    throw new Error('Failed to extract text from image')
  }
}

export async function extractComments(text: string): Promise<string[]> {
  // Simple heuristic to extract comments
  // Look for patterns like "Comment:", "Feedback:", or text in [brackets]
  const commentPatterns = [
    /Comment:\s*(.+?)(?=\n|$)/gi,
    /Feedback:\s*(.+?)(?=\n|$)/gi,
    /\[(.+?)\]/g,
    /Teacher's note:\s*(.+?)(?=\n|$)/gi
  ]
  
  const comments: string[] = []
  
  for (const pattern of commentPatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 5) {
        comments.push(match[1].trim())
      }
    }
  }
  
  // Use AI to identify additional teacher comments/feedback
  if (comments.length < 3 && text.length > 100) {
    try {
      const aiComments = await extractCommentsWithAI(text)
      comments.push(...aiComments)
    } catch (error) {
      console.error('AI comment extraction failed:', error)
    }
  }
  
  return [...new Set(comments)] // Remove duplicates
}

async function extractCommentsWithAI(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  
  const prompt = `Analyze this document and extract any teacher comments, feedback, or annotations.
These might appear as:
- Marginal notes
- Inline feedback
- Comments about writing quality
- Suggestions for improvement

Document text (first 3000 chars):
"""
${text.substring(0, 3000)}
"""

Return ONLY a JSON array of extracted comments:
["comment 1", "comment 2", ...]

If no clear teacher comments are found, return an empty array: []`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()
    
    const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || responseText.match(/(\[[\s\S]*?\])/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1])
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (error) {
    console.error('AI parsing error:', error)
  }
  
  return []
}

export async function processUploadedFile(
  file: File
): Promise<ExtractedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name.toLowerCase()
  
  let result: ExtractedDocument
  
  if (fileName.endsWith('.pdf')) {
    result = await extractTextFromPDF(buffer)
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    result = await extractTextFromDOCX(buffer)
  } else if (
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png')
  ) {
    result = await extractTextFromImage(buffer)
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or image files.')
  }
  
  // Extract potential teacher comments
  if (result.text) {
    result.teacherComments = await extractComments(result.text)
  }
  
  if (result.metadata) {
    result.metadata.fileName = file.name
  }
  
  return result
}
