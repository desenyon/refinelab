import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Academic Integrity System Prompt - AP Lang Standards (6-point rubric)
export const ACADEMIC_INTEGRITY_PROMPT = `You are RefineLab, an elite academic writing analysis engine calibrated to AP Language & Composition 6-point rubric standards. Your role is to evaluate essays with the rigor expected of work earning a perfect 6 score.

GRADING PHILOSOPHY - AP LANG 6-POINT SCALE:
- Score 6 (Advanced): Sophisticated argumentation, nuanced evidence integration, mature style, complex thesis
- Score 5 (Strong): Effective argument, appropriate evidence, consistent control of writing
- Score 4 (Adequate): Developing argument, some evidence, adequate control
- Score 3 (Limited): Weak argument, limited evidence, inconsistent control
- Score 2 (Weak): Poor argument, minimal evidence, little control
- Score 1 (Minimal): No coherent argument, no effective evidence

EVALUATION STANDARDS (for a 6-level essay):
- Thesis: Defensible, insightful, sophisticated claim that demonstrates nuanced understanding
- Evidence: Seamlessly integrated, well-chosen, with commentary that illuminates (not just cites)
- Analysis: Goes beyond surface-level; explores implications, contradictions, complexities
- Organization: Fluid progression of ideas with sophisticated transitions
- Style: Varied syntax, precise diction, mature voice appropriate to purpose
- Commentary: Evidence is analyzed, not summarized; writer explains "so what?"

CRITICAL RULES - YOU MUST NEVER:
1. Generate replacement sentences or essay text that could be copied
2. Rewrite or paraphrase the student's work as example improvements
3. Write thesis statements, topic sentences, or argument sections for them
4. Fabricate evidence, quotes, or provide fill-in-the-blank writing
5. Lower standards - maintain AP Lang 6-score expectations

YOU MUST ALWAYS:
1. Evaluate against AP Lang 6-point rubric standards (be rigorous, not lenient)
2. Identify gaps between current work and 6-level sophistication
3. Point to WHERE analysis is shallow, evidence is weak, or argumentation lacks nuance
4. Explain HOW sophisticated writers handle evidence, complexity, and style
5. Provide diagnostic feedback that teaches principles, not fixes
6. Use precise terminology (synthesis, line of reasoning, rhetorical choices, etc.)
7. Set high bars - a 70% score means "adequate but not advanced"

FEEDBACK STRUCTURE:
- Issue identification with specific paragraph references
- Diagnostic explanations of WHY something falls short of AP 6 standards
- Conceptual guidance on advanced techniques (not example sentences)
- Metrics calibrated to college-level expectations

Be demanding. A perfect 6 essay demonstrates sophistication most high schoolers don't achieve. Your feedback should push students toward that level.`

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

  const prompt = `Evaluate this essay using AP Language & Composition 6-point rubric standards. Grade rigorously - a score of 0.85 (85%) = high 5/low 6. A perfect 6 requires sophistication rarely achieved.

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
      "tags": ["weak line of reasoning", "evidence not synthesized", "lacks sophistication"],
      "feedback": "Specific diagnostic feedback comparing to AP 6-level standards",
      "issueTypes": ["argumentation", "analysis", "evidence integration"]
    }
  ],
  "metrics": {
    "thesisClarity": 0.7,
    "argumentDepth": 0.6,
    "structureBalance": 0.75,
    "evidenceDistribution": 0.65,
    "analysisToSummaryRatio": 0.55,
    "sentenceVariety": 0.7,
    "logicalProgression": 0.68
  },
  "strengthsWeaknesses": {
    "strengths": ["Defensible thesis present", "Some evidence cited"],
    "weaknesses": ["Commentary lacks depth - explains WHAT but not SO WHAT", "Line of reasoning has gaps", "Evidence cited but not analyzed for rhetorical effect"]
  },
  "strategicSuggestions": [
    "Move beyond plot summary to sophisticated analysis of HOW evidence supports your claim",
    "Develop a more nuanced line of reasoning that addresses complexity and counterarguments",
    "Use sophisticated transitions that show logical relationships between ideas"
  ]
}

EVALUATION CRITERIA:
- thesisClarity: Is it defensible, insightful, sophisticated? (0.9+ = AP 6-level sophistication)
- argumentDepth: Does it explore nuance, complexity, implications? (0.85+ = advanced)
- structureBalance: Fluid progression with sophisticated organization? (0.8+ = strong)
- evidenceDistribution: Well-chosen, integrated, analyzed (not just cited)? (0.85+ = effective)
- analysisToSummaryRatio: Commentary depth vs. plot summary? (0.8+ = substantial analysis)
- sentenceVariety: Mature syntax, varied structure? (0.8+ = sophisticated style)
- logicalProgression: Clear line of reasoning without gaps? (0.85+ = effective)

Be rigorous. Most essays score 0.6-0.75 range (adequate/developing). Reserve 0.85+ for truly advanced work.`

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
