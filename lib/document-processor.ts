import { PDFDocument } from 'pdf-lib'
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
    // For PDFs, we'll use AI to extract text directly from the content
    // This is more reliable in serverless environments
    const pdfDoc = await PDFDocument.load(buffer)
    const numPages = pdfDoc.getPageCount()
    
    // Convert PDF to base64 for AI processing
    const base64Pdf = buffer.toString('base64')
    
    // Use Gemini to extract text from PDF
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    
    const prompt = `Extract ALL text content from this PDF document. Preserve the structure, paragraph breaks, and formatting as much as possible. Return ONLY the extracted text, nothing else.`
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf
        }
      }
    ])
    
    const response = await result.response
    let text = response.text()
    
    // Clean and normalize the extracted text
    text = text
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive spaces but preserve paragraph breaks
      .replace(/ +/g, ' ')
      // Preserve paragraph breaks (2+ newlines)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up whitespace
      .trim()
    
    return {
      text,
      metadata: {
        fileName: 'uploaded.pdf',
        fileType: 'pdf',
        pageCount: numPages
      }
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the PDF is readable and try again.')
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    
    // Clean and normalize DOCX text
    let text = result.value
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ +/g, ' ')
      .trim()
    
    return {
      text,
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
    
    // Clean OCR text (often has artifacts)
    let cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove common OCR artifacts
      .replace(/[\|\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    
    return {
      text: cleanedText,
      metadata: {
        fileName: 'uploaded-image',
        fileType: 'image'
      }
    }
  } catch (error) {
    console.error('OCR extraction error:', error)
    throw new Error('Failed to extract text from image. Ensure the image has clear, readable text.')
  }
}

export async function extractComments(text: string): Promise<string[]> {
  // Enhanced heuristic patterns for teacher comments and annotations
  const commentPatterns = [
    /Comment:\s*(.+?)(?=\n\n|\n[A-Z]|$)/gi,
    /Feedback:\s*(.+?)(?=\n\n|\n[A-Z]|$)/gi,
    /\[([^\]]{10,})\]/g, // Bracketed text at least 10 chars
    /Teacher'?s? notes?:\s*(.+?)(?=\n\n|\n[A-Z]|$)/gi,
    /Grade:\s*(.+?)(?=\n|$)/gi,
    /Score:\s*(.+?)(?=\n|$)/gi,
    /Strengths?:\s*(.+?)(?=\n\n|Weakness|Area|$)/gi,
    /Weaknesses?:\s*(.+?)(?=\n\n|Strength|Area|$)/gi,
    /Areas? for improvement:\s*(.+?)(?=\n\n|$)/gi,
    /Good:?\s*(.+?)(?=\n\n|Needs|$)/gi,
    /Needs work:?\s*(.+?)(?=\n\n|Good|$)/gi,
    /\*\*(.{15,}?)\*\*/g, // Bold text (markdown)
    /--\s*(.{15,})$/gm, // Comments after double dash
  ]
  
  const comments: string[] = []
  
  for (const pattern of commentPatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const comment = match[1]?.trim()
      if (comment && comment.length > 10 && comment.length < 500) {
        // Filter out essay content (avoid long paragraphs)
        const sentenceCount = (comment.match(/[.!?]+/g) || []).length
        if (sentenceCount <= 5) { // Comments typically brief
          comments.push(comment)
        }
      }
    }
  }
  
  // Always use AI for comprehensive extraction
  try {
    const aiComments = await extractCommentsWithAI(text)
    comments.push(...aiComments)
  } catch (error) {
    console.error('AI comment extraction failed:', error)
  }
  
  // Remove duplicates and return
  return [...new Set(comments.filter(c => c.length > 10))]
}

async function extractCommentsWithAI(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  
  const prompt = `Extract ALL teacher feedback, comments, grades, and annotations from this document. Look for:

1. Inline comments/marginalia (often in brackets, parentheses, or after dashes)
2. Grading rubric comments or scores
3. Feedback on strengths and weaknesses  
4. Suggestions for improvement
5. Questions or prompts from the teacher
6. Summary feedback at end
7. Comments embedded within essay text
8. Handwritten-style notes (if OCR'd)

Document text:
"""
${text.substring(0, 5000)}
"""

Extract EVERY piece of teacher feedback as a separate item. Return ONLY valid JSON array:
["feedback item 1", "feedback item 2", ...]

Include:
- Specific paragraph/sentence comments
- Overall evaluative feedback
- Grades or scores mentioned
- Marginal annotations
- Any text that appears to be instructor voice (not student essay)

Do NOT include:
- Essay text written by student
- Assignment instructions
- Long passages (>100 words)

If no teacher feedback found, return: []`

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
