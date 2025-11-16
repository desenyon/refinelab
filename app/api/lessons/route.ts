import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Pre-defined writing lessons (can be expanded)
const lessons = [
  {
    id: 'thesis-clarity',
    title: 'Strengthening Your Thesis Statement',
    category: 'Thesis',
    principles: [
      'A thesis should be specific, debatable, and arguable',
      'It should preview the main points of your essay',
      'Avoid vague language like "interesting" or "important"',
      'Take a clear position that can be supported with evidence',
    ],
    strategies: [
      'Ask yourself: What specific claim am I making?',
      'Consider: Can someone reasonably disagree with this?',
      'Ensure your thesis appears early (usually end of intro)',
      'Revise to make it more precise and focused',
    ],
    checklistItems: [
      'Is my thesis specific rather than general?',
      'Does it make a claim that requires support?',
      'Can I preview how I will support this claim?',
      'Would a reader understand my essay\'s focus from this statement?',
    ],
  },
  {
    id: 'analysis-depth',
    title: 'Deepening Your Analysis',
    category: 'Analysis',
    principles: [
      'Analysis goes beyond summary - it explains WHY and HOW',
      'Connect evidence back to your thesis',
      'Explore implications and significance',
      'Consider multiple interpretations',
    ],
    strategies: [
      'After citing evidence, ask: "What does this show?" or "Why does this matter?"',
      'Use analytical verbs: suggests, reveals, demonstrates, implies',
      'Explain the connection between evidence and your claim',
      'Consider counterarguments and address them',
    ],
    checklistItems: [
      'Do I explain the significance of my evidence?',
      'Have I moved beyond just describing what happens?',
      'Do I connect my analysis back to my thesis?',
      'Have I explored the "so what?" of my arguments?',
    ],
  },
  {
    id: 'structure-balance',
    title: 'Balancing Essay Structure',
    category: 'Structure',
    principles: [
      'Each paragraph should have a clear focus (one main idea)',
      'Introduction sets up the argument, body develops it, conclusion synthesizes',
      'Transitions connect ideas between paragraphs',
      'Evidence should be distributed throughout, not front-loaded',
    ],
    strategies: [
      'Start each body paragraph with a clear topic sentence',
      'Ensure each paragraph connects to your thesis',
      'Use transitional phrases to guide readers',
      'Balance the length and depth of body paragraphs',
    ],
    checklistItems: [
      'Does each paragraph have a clear main point?',
      'Are my paragraphs connected logically?',
      'Is my introduction proportional to my essay length?',
      'Does my conclusion synthesize rather than just repeat?',
    ],
  },
  {
    id: 'evidence-use',
    title: 'Using Evidence Effectively',
    category: 'Evidence',
    principles: [
      'Evidence should directly support your claims',
      'Integrate quotes smoothly into your prose',
      'Always analyze evidence - don\'t let it speak for itself',
      'Use a variety of evidence types when appropriate',
    ],
    strategies: [
      'Introduce quotes with context',
      'Follow quotes with analysis, not another quote',
      'Use signal phrases to integrate sources',
      'Select the most relevant portions to quote',
    ],
    checklistItems: [
      'Have I introduced each piece of evidence?',
      'Do I analyze evidence after presenting it?',
      'Is my evidence relevant to my specific claim?',
      'Have I cited sources appropriately?',
    ],
  },
  {
    id: 'transitions',
    title: 'Improving Transitions and Flow',
    category: 'Coherence',
    principles: [
      'Transitions show relationships between ideas',
      'Good flow helps readers follow your logic',
      'Connections can be explicit (transition words) or implicit (content links)',
      'Vary your transitional strategies',
    ],
    strategies: [
      'Use transition words: however, furthermore, consequently',
      'Link back to previous paragraph\'s main idea',
      'Use repetition of key terms strategically',
      'Ensure logical progression from one idea to the next',
    ],
    checklistItems: [
      'Can readers follow my logic from paragraph to paragraph?',
      'Have I used transition words appropriately?',
      'Do my paragraphs build on each other?',
      'Is the relationship between ideas clear?',
    ],
  },
  {
    id: 'sentence-variety',
    title: 'Increasing Sentence Variety',
    category: 'Style',
    principles: [
      'Vary sentence length to create rhythm',
      'Use different sentence structures',
      'Balance complex and simple sentences',
      'Avoid repetitive sentence openings',
    ],
    strategies: [
      'Mix short, punchy sentences with longer, complex ones',
      'Start sentences in different ways (not always subject-verb)',
      'Use subordinate clauses for variety',
      'Read your work aloud to hear rhythm',
    ],
    checklistItems: [
      'Do I have a mix of short and long sentences?',
      'Have I varied how I start sentences?',
      'Does my writing have rhythm and flow?',
      'Am I repeating the same sentence patterns?',
    ],
  },
]

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const lessonId = searchParams.get('id')

    // Filter by ID if provided
    if (lessonId) {
      const lesson = lessons.find(l => l.id === lessonId)
      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }
      return NextResponse.json(lesson)
    }

    // Filter by category if provided
    if (category) {
      const filtered = lessons.filter(l => l.category === category)
      return NextResponse.json(filtered)
    }

    // Return all lessons
    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}
