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

  const prompt = `Evaluate this essay using AP Language & Composition 6-point rubric standards. Grade rigorously and UNIQUELY for each essay - scores must reflect the ACTUAL quality of THIS specific essay, not generic averages.

CRITICAL: Analyze the ACTUAL content below. Each essay is different - your metrics MUST vary significantly based on what you actually read.

Essay Text:
"""
${essayText}
"""

REQUIRED ANALYSIS PROCESS:
1. Read the ENTIRE essay carefully
2. Identify the SPECIFIC thesis statement (quote it)
3. Count and evaluate each body paragraph's argumentation
4. Assess the ACTUAL evidence quality and integration
5. Measure sentence variety by counting sentence structures
6. Evaluate logical flow between specific paragraphs

SCORING CALIBRATION (use the FULL RANGE):
- 0.90-1.00: Nearly perfect, rare - sophisticated thesis, seamless evidence integration, mature style
- 0.80-0.89: Strong - clear argument, good evidence, effective writing
- 0.70-0.79: Adequate - developing argument, some evidence, decent control
- 0.60-0.69: Limited - weak argument, minimal evidence, inconsistent writing
- 0.50-0.59: Poor - unclear thesis, little support, weak organization
- 0.40-0.49: Very weak - major issues in all areas
- Below 0.40: Failing - incoherent or minimal effort

SCORE EACH METRIC INDEPENDENTLY based on what you actually observe:

Return ONLY valid JSON in this exact structure:
{
  "paragraphAnalysis": [
    {
      "paragraphNumber": 1,
      "text": "first 100 chars of actual paragraph...",
      "tags": ["specific issue from THIS paragraph"],
      "feedback": "Specific feedback about THIS paragraph's actual content",
      "issueTypes": ["actual issues found"]
    }
  ],
  "metrics": {
    "thesisClarity": 0.XX,
    "argumentDepth": 0.XX,
    "structureBalance": 0.XX,
    "evidenceDistribution": 0.XX,
    "analysisToSummaryRatio": 0.XX,
    "sentenceVariety": 0.XX,
    "logicalProgression": 0.XX
  },
  "strengthsWeaknesses": {
    "strengths": ["Specific strength from THIS essay with example"],
    "weaknesses": ["Specific weakness from THIS essay with example"]
  },
  "strategicSuggestions": [
    "Targeted suggestion based on THIS essay's specific issues"
  ]
}

METRIC DEFINITIONS WITH EXAMPLES:
- thesisClarity: How clear, specific, and arguable is the thesis? 
  * 0.9+: "Shakespeare's use of soliloquy reveals Hamlet's psychological complexity while critiquing political corruption"
  * 0.7: "Hamlet is about revenge and madness"
  * 0.5: Unclear or missing thesis
  
- argumentDepth: Does the essay analyze WHY and HOW, not just WHAT?
  * 0.9+: Explores implications, counterarguments, complexity
  * 0.7: Makes claims with some support
  * 0.5: Mostly plot summary or description
  
- structureBalance: Paragraph organization and logical flow
  * 0.9+: Seamless transitions, balanced development
  * 0.7: Clear structure with some transitions
  * 0.5: Choppy or unbalanced organization
  
- evidenceDistribution: Quality and integration of evidence
  * 0.9+: Well-chosen quotes, analyzed deeply, integrated smoothly
  * 0.7: Evidence present but may be cited without analysis
  * 0.5: Little evidence or poorly integrated
  
- analysisToSummaryRatio: Percentage of analysis vs. summary
  * 0.9+: 80%+ analysis, minimal plot summary
  * 0.7: 60% analysis, 40% summary
  * 0.5: 50% or more is just summary
  
- sentenceVariety: Syntax sophistication and variation
  * 0.9+: Complex, varied, sophisticated sentence structures
  * 0.7: Mix of simple and complex, adequate variety
  * 0.5: Repetitive, simple sentence structures
  
- logicalProgression: Does each paragraph build on the last?
  * 0.9+: Clear through-line with sophisticated development
  * 0.7: Generally follows but may have gaps
  * 0.5: Ideas seem disconnected or repetitive

IMPORTANT: Scores should vary by at least 0.10-0.30 between different metrics based on what you actually observe. No two essays should have identical scores unless they're genuinely identical in quality.`

  try {
    console.log(`[AI Analysis] Starting analysis for essay (${essayText.length} chars)`)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log(`[AI Analysis] Raw response length: ${text.length} chars`)
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
    
    if (!jsonMatch) {
      console.error('[AI Analysis] Failed to extract JSON from response:', text.substring(0, 500))
      throw new Error('Failed to extract JSON from AI response')
    }
    
    const jsonText = jsonMatch[1]
    const parsed = JSON.parse(jsonText)
    
    // Validate that metrics are present and vary
    if (!parsed.metrics) {
      throw new Error('AI response missing metrics object')
    }
    
    const metricsValues = Object.values(parsed.metrics) as number[]
    const allSame = metricsValues.every(v => v === metricsValues[0])
    
    if (allSame) {
      console.warn('[AI Analysis] Warning: All metrics have the same value, AI may not be analyzing properly')
    }
    
    console.log(`[AI Analysis] Successfully parsed analysis with ${parsed.paragraphAnalysis?.length || 0} paragraphs`)
    console.log(`[AI Analysis] Metric range: ${Math.min(...metricsValues).toFixed(2)} - ${Math.max(...metricsValues).toFixed(2)}`)
    
    return parsed
  } catch (error) {
    console.error('[AI Analysis] Error during analysis:', error)
    throw error
  }
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
