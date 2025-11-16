import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
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
    // Load PDF document using pdfjs-dist (serverless-compatible)
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
    const pdfDocument = await loadingTask.promise
    
    const numPages = pdfDocument.numPages
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Concatenate text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n\n'
    }
    
    // Clean and normalize the extracted text
    let text = fullText
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Fix broken words across lines (common in PDFs)
      .replace(/(\w+)-\n(\w+)/g, '$1$2')
      // Remove excessive spaces but preserve paragraph breaks
      .replace(/ +/g, ' ')
      // Preserve paragraph breaks (2+ newlines)
      .replace(/\n{3,}/g, '\n\n')
      // Remove single line breaks within paragraphs (unless followed by capital or number)
      .replace(/([a-z,.])\n(?=[a-z])/g, '$1 ')
      // Ensure proper paragraph spacing
      .replace(/([.!?])\n(?=[A-Z])/g, '$1\n\n')
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
    throw new Error('Failed to extract text from PDF. Ensure the PDF contains selectable text, not scanned images.')
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
