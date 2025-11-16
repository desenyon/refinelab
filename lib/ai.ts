import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Academic Integrity System Prompt
export const ACADEMIC_INTEGRITY_PROMPT = `You are RefineLab, an academic writing analysis assistant that helps students improve their writing skills through feedback, metrics, and conceptual guidance.

CRITICAL RULES - YOU MUST NEVER:
1. Generate new sentences, paragraphs, or example text that could be pasted into an essay
2. Rewrite, paraphrase, or "improve" the student's text as actual replacement wording
3. Write thesis statements, topic sentences, claims, arguments, or essay sections
4. Fabricate evidence, quotes, or analysis
5. Output long continuous spans of novel academic prose tied to the student's prompt

YOU MUST ALWAYS:
1. Provide feedback in analytic, descriptive form - never as continuous essay prose
2. Explain WHY something is unclear or weak, not provide the fix
3. Suggest WHAT to strengthen at a conceptual level
4. Teach HOW writing principles work (general rules, not essay-specific text)
5. Point out recurring habits and patterns
6. Show where to add clarity, depth, or evidence
7. Provide skills-based lessons and strategies
8. Provide metrics and visualizations

If a user asks for rewrites, paraphrases, or sample wording, you must refuse politely and instead offer conceptual guidance.

Your responses should be structured as:
- Bullet lists of issues
- Metrics and scores
- Tags and labels
- Areas to focus on
- Strategic suggestions
- Conceptual explanations

NEVER provide text that reads like a continuation or replacement of their essay.`

export interface EssayAnalysisResult {
  paragraphAnalysis: ParagraphAnalysis[]
  metrics: EssayMetrics
  strengthsWeaknesses: {
    strengths: string[]
    weaknesses: string[]
  }
  strategicSuggestions: string[]
}

export interface ParagraphAnalysis {
  paragraphNumber: number
  text: string
  tags: string[]
  feedback: string
  issueTypes: string[]
}

export interface EssayMetrics {
  thesisClarity: number
  argumentDepth: number
  structureBalance: number
  evidenceDistribution: number
  analysisToSummaryRatio: number
  sentenceVariety: number
  logicalProgression: number
}

export async function analyzeEssay(essayText: string): Promise<EssayAnalysisResult> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    systemInstruction: ACADEMIC_INTEGRITY_PROMPT
  })

  const prompt = `Analyze the following essay and provide a comprehensive analysis in JSON format.

Essay:
"""
${essayText}
"""

Return ONLY valid JSON in this exact structure:
{
  "paragraphAnalysis": [
    {
      "paragraphNumber": 1,
      "text": "first 100 chars of paragraph...",
      "tags": ["weak transition", "summary-heavy", "thin analysis"],
      "feedback": "Descriptive feedback explaining the issue",
      "issueTypes": ["structure", "analysis", "evidence"]
    }
  ],
  "metrics": {
    "thesisClarity": 0.7,
    "argumentDepth": 0.6,
    "structureBalance": 0.8,
    "evidenceDistribution": 0.65,
    "analysisToSummaryRatio": 0.55,
    "sentenceVariety": 0.75,
    "logicalProgression": 0.7
  },
  "strengthsWeaknesses": {
    "strengths": ["Clear introduction", "Good use of evidence"],
    "weaknesses": ["Thesis needs more specificity", "Analysis is surface-level"]
  },
  "strategicSuggestions": [
    "Focus on deepening your analysis in paragraphs 3-5",
    "Make your thesis more explicit in the introduction"
  ]
}

Remember: Provide ONLY analytical feedback, not replacement text. All metrics should be between 0 and 1.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  
  return JSON.parse(jsonText)
}

export async function compareEssays(
  beforeText: string,
  afterText: string
): Promise<{
  clarityDelta: number
  coherenceDelta: number
  structureDelta: number
  argumentDelta: number
  analysisDelta: number
  improvements: string[]
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    systemInstruction: ACADEMIC_INTEGRITY_PROMPT
  })

  const prompt = `Compare these two essay versions and provide metrics showing improvement (or regression) in JSON format.

BEFORE:
"""
${beforeText}
"""

AFTER:
"""
${afterText}
"""

Return ONLY valid JSON in this structure:
{
  "clarityDelta": 0.15,
  "coherenceDelta": 0.12,
  "structureDelta": 0.08,
  "argumentDelta": 0.18,
  "analysisDelta": 0.22,
  "improvements": [
    "Thesis statement became more specific and arguable",
    "Added more analytical depth in body paragraphs",
    "Improved transitions between paragraphs"
  ]
}

Delta values should be between -1 and 1 (negative means regression, positive means improvement).`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  
  return JSON.parse(jsonText)
}

export async function generateStrategicSuggestions(
  essayText: string,
  weaknesses: string[]
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    systemInstruction: ACADEMIC_INTEGRITY_PROMPT
  })

  const prompt = `Based on the identified weaknesses, provide 5-7 strategic, conceptual suggestions for improvement. Do NOT provide specific wording or sentences to use.

Weaknesses identified:
${weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Return ONLY a JSON array of strings:
["Strategic suggestion 1", "Strategic suggestion 2", ...]

Focus on conceptual guidance like "strengthen analysis by...", "clarify your argument by...", "improve structure by..."`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/) || text.match(/(\[[\s\S]*\])/)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  
  return JSON.parse(jsonText)
}

export async function extractWritingFingerprint(essays: Array<{ content: string }>): Promise<{
  toneTendencies: string[]
  structuralPatterns: string[]
  pacingIssues: string[]
  evidenceHabits: string[]
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    systemInstruction: ACADEMIC_INTEGRITY_PROMPT
  })

  const essayContents = essays.map((e, i) => `Essay ${i + 1}:\n${e.content.substring(0, 2000)}`).join('\n\n---\n\n')

  const prompt = `Analyze these essays to identify recurring patterns in the writer's style. Return ONLY valid JSON.

${essayContents}

{
  "toneTendencies": ["Tends toward formal academic tone", "Uses tentative language frequently"],
  "structuralPatterns": ["Paragraphs average 6-8 sentences", "Heavy introductions, brief conclusions"],
  "pacingIssues": ["Arguments often stall in middle sections", "Rushes through evidence"],
  "evidenceHabits": ["Over-reliance on direct quotes", "Insufficient synthesis of sources"]
}`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  
  return JSON.parse(jsonText)
}

export async function predictGrade(
  essayMetrics: EssayMetrics,
  gradingPatterns: Array<{ grade: string; rubricData: any }>
): Promise<{
  predictedGradeBand: string
  confidence: number
  keyFactors: string[]
}> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-lite',
    systemInstruction: ACADEMIC_INTEGRITY_PROMPT
  })

  const prompt = `Based on essay metrics and past grading patterns, predict a grade band. Return ONLY valid JSON.

Current Essay Metrics:
${JSON.stringify(essayMetrics, null, 2)}

Past Grading Patterns:
${JSON.stringify(gradingPatterns, null, 2)}

{
  "predictedGradeBand": "B/B+",
  "confidence": 0.75,
  "keyFactors": [
    "Thesis clarity score aligns with B-range essays",
    "Analysis depth is slightly below A-range threshold",
    "Structure balance is consistent with past B+ assignments"
  ]
}`

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
  const jsonText = jsonMatch ? jsonMatch[1] : text
  
  return JSON.parse(jsonText)
}
