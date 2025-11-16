'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Award,
  Lightbulb,
  FileText
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: any
  color: string
  locked: boolean
  completed: boolean
  progress: number
  sections: {
    title: string
    content: string[]
    examples?: string[]
  }[]
}

const lessons: Lesson[] = [
  {
    id: 'thesis',
    title: 'Crafting Sophisticated Thesis Statements',
    description: 'Learn to write defensible, nuanced thesis statements that establish clear positions while acknowledging complexity.',
    duration: '25 min',
    difficulty: 'Intermediate',
    icon: Target,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    locked: false,
    completed: false,
    progress: 0,
    sections: [
      {
        title: 'What Makes a Thesis Sophisticated?',
        content: [
          'A sophisticated thesis goes beyond simple claims. It demonstrates nuanced thinking by:',
          '• Establishing a clear, defensible position on a complex issue',
          '• Acknowledging counterarguments or tensions',
          '• Using precise language that reflects analytical depth',
          '• Providing a roadmap for the argument that follows'
        ]
      },
      {
        title: 'The Anatomy of Strong Thesis Statements',
        content: [
          'Effective thesis statements contain three key components:',
          '1. CLAIM: Your central argument or interpretation',
          '2. REASONING: The "why" or "how" behind your claim',
          '3. SIGNIFICANCE: Why the argument matters or what it reveals',
          '',
          'Consider the difference:',
          'Weak: "Social media is bad for teenagers."',
          'Strong: "While social media offers connectivity, its algorithmic design exploits adolescent psychology, prioritizing engagement over well-being and creating dependency patterns that undermine authentic social development."'
        ]
      },
      {
        title: 'Common Pitfalls to Avoid',
        content: [
          '× Obvious statements: "Shakespeare was a talented writer."',
          '× Factual claims: "The novel has three main characters."',
          '× Questions: "What does the author really mean?"',
          '× Announcement: "This essay will discuss symbolism."',
          '× Vague language: "Society has many issues to address."',
          '',
          'Instead, make debatable claims using precise, analytical language.'
        ]
      },
      {
        title: 'Practice Framework',
        content: [
          'Use this formula to strengthen your thesis:',
          '',
          '[Author/Text/Phenomenon] + [Action Verb] + [Nuanced Claim] + [Method/Evidence] + [Larger Significance]',
          '',
          'Example: "Morrison\'s use of fragmented chronology in Beloved disrupts linear narrative expectations, forcing readers to experience trauma as cyclical rather than resolved, thereby challenging redemption narratives in historical fiction."'
        ],
        examples: [
          'Topic: Climate Change Policy',
          'Weak: "We need better climate policies."',
          'Strong: "Effective climate policy requires reframing environmental protection not as economic sacrifice but as investment opportunity, leveraging market mechanisms to align corporate incentives with sustainability goals."',
          '',
          'Topic: Artificial Intelligence in Education',
          'Weak: "AI has pros and cons in schools."',
          'Strong: "While AI tutoring systems promise personalized learning, their deployment risks codifying existing educational inequities by prioritizing measurable outcomes over critical thinking skills that resist algorithmic assessment."'
        ]
      }
    ]
  },
  {
    id: 'evidence',
    title: 'Evidence Integration & Analysis',
    description: 'Master the art of selecting, embedding, and analyzing evidence to build compelling arguments.',
    duration: '30 min',
    difficulty: 'Advanced',
    icon: Sparkles,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    locked: false,
    completed: false,
    progress: 0,
    sections: [
      {
        title: 'The Evidence Sandwich Model',
        content: [
          'Strong paragraphs follow this three-layer structure:',
          '',
          '1. SETUP (Context): Introduce what you\'re about to prove',
          '2. EVIDENCE (Quote/Data): Present your specific support',
          '3. ANALYSIS (Interpretation): Explain how evidence proves your point',
          '',
          'The analysis layer is typically 2-3x longer than the quote itself. This is where critical thinking happens.'
        ]
      },
      {
        title: 'Embedding Techniques',
        content: [
          'Never drop quotes without context. Use these integration methods:',
          '',
          '• Signal Phrase: According to Morrison, "..."',
          '• Sentence Integration: The text reveals "..." when examining...',
          '• Clause Embedding: The author\'s claim that "..." demonstrates...',
          '',
          'Always follow quotes with analysis beginning with phrases like:',
          '• This demonstrates that...',
          '• This language suggests...',
          '• The significance of this lies in...',
          '• By framing it this way, the author...'
        ]
      },
      {
        title: 'Quality Over Quantity',
        content: [
          'AP Lang scorers prioritize analysis depth over evidence volume.',
          '',
          'Instead of multiple surface-level quotes like: "The text says X. It also says Y. Additionally, Z appears."',
          '',
          'Use fewer quotes with deeper analysis:',
          '"Morrison\'s choice to describe memory as \'rememory\' (p. 36) creates linguistic innovation that mirrors the novel\'s central argument: traumatic memory doesn\'t follow linear time. The neologism forces readers to experience language breakdown, paralleling the characters\' psychological fragmentation."'
        ]
      },
      {
        title: 'Connecting Evidence to Thesis',
        content: [
          'Every paragraph should explicitly link back to your thesis.',
          '',
          'Use bridging language:',
          '• "This supports the broader claim that..."',
          '• "This pattern reinforces how..."',
          '• "Returning to the thesis, this evidence demonstrates..."',
          '',
          'Ask yourself: "So what?" after each piece of evidence. If you can\'t answer why it matters to your argument, cut it.'
        ],
        examples: [
          'Weak Analysis:',
          '"The author writes, \'The sky turned dark.\' This shows the weather changed."',
          '',
          'Strong Analysis:',
          '"The author writes, \'The sky turned dark.\' This atmospheric shift from the earlier \'brilliant sunlight\' (p. 12) mirrors the protagonist\'s internal transformation from naive optimism to disillusioned awareness. The environmental change functions as an objective correlative, externalizing psychological deterioration that dialogue alone could not capture."'
        ]
      }
    ]
  },
  {
    id: 'organization',
    title: 'Structural Coherence & Transitions',
    description: 'Build logically flowing arguments with clear organization and sophisticated transitions.',
    duration: '20 min',
    difficulty: 'Intermediate',
    icon: TrendingUp,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    locked: false,
    completed: false,
    progress: 0,
    sections: [
      {
        title: 'Organizational Strategies',
        content: [
          'Choose a structure that serves your argument:',
          '',
          '• Chronological: Trace development over time',
          '• Cause-Effect: Show relationships between phenomena',
          '• Comparison: Highlight contrasts to reveal insights',
          '• Problem-Solution: Identify issues and propose remedies',
          '• Thematic: Group evidence by conceptual categories',
          '',
          'AP Lang essays typically use thematic organization, with each body paragraph exploring a different dimension of your thesis.'
        ]
      },
      {
        title: 'Sophisticated Transitions',
        content: [
          'Move beyond basic transitions like "Also," "Next," "Finally."',
          '',
          'Use conceptual bridges that show relationships:',
          '',
          '• Building complexity: "While this addresses X, a more nuanced view considers..."',
          '• Contrasting: "This optimistic reading, however, overlooks..."',
          '• Causal: "This shift in tone results from..."',
          '• Temporal: "Tracing this pattern reveals..."',
          '• Hierarchical: "More fundamentally, this suggests..."'
        ]
      },
      {
        title: 'Paragraph Unity',
        content: [
          'Each paragraph should:',
          '✓ Begin with a clear topic sentence',
          '✓ Focus on ONE main idea',
          '✓ Use evidence supporting that idea',
          '✓ Analyze how evidence proves the point',
          '✓ Connect back to thesis',
          '',
          'If a paragraph tries to make multiple disconnected points, split it. If two paragraphs make the same point, merge them.'
        ]
      },
      {
        title: 'Signposting & Forecasting',
        content: [
          'Help readers navigate your argument:',
          '',
          'Intro roadmap: "This essay will examine X through three lenses: rhetorical strategy, historical context, and ethical implications."',
          '',
          'Mid-argument reminders: "Having established X, we now turn to Y..."',
          '',
          'Counterargument acknowledgment: "Critics might argue Z; however, closer analysis reveals..."',
          '',
          'These signposts demonstrate control over complex material.'
        ],
        examples: [
          'Weak Transition:',
          '"The author uses metaphors. Also, there are symbols. Finally, imagery appears."',
          '',
          'Strong Transition:',
          '"Beyond metaphorical language, Morrison employs symbol systems that operate both individually and collectively. While each image carries local meaning, their cumulative effect creates a symbolic vocabulary that readers must decode holistically. This deliberate complexity mirrors the novel\'s central claim about fragmented memory."'
        ]
      }
    ]
  },
  {
    id: 'style',
    title: 'Style, Voice & Rhetorical Maturity',
    description: 'Develop sophisticated prose that demonstrates rhetorical awareness and analytical precision.',
    duration: '25 min',
    difficulty: 'Advanced',
    icon: BookOpen,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    locked: false,
    completed: false,
    progress: 0,
    sections: [
      {
        title: 'Sentence Variety',
        content: [
          'Mature writing varies sentence structure for emphasis:',
          '',
          '• Simple: Direct statements for clarity',
          '• Compound: Connecting related ideas with coordination',
          '• Complex: Subordinating to show relationships',
          '• Compound-Complex: Layering multiple relationships',
          '',
          'Avoid monotonous patterns. Mix short, punchy sentences with longer analytical ones. Use periodic sentences (delaying main clause) to build suspense or emphasis.'
        ]
      },
      {
        title: 'Academic Voice Without Stiffness',
        content: [
          'Strong academic writing is formal yet engaging:',
          '',
          '✓ Use active voice when possible: "Morrison challenges readers" > "Readers are challenged"',
          '✓ Employ precise verbs: "demonstrates," "reveals," "underscores" > "shows"',
          '✓ Maintain analytical distance: Avoid "I think" or "I feel"',
          '✓ Acknowledge complexity: "arguably," "suggests," "potentially"',
          '',
          '× Avoid: contractions, slang, casual language',
          '× Avoid: pretentious vocabulary that obscures meaning'
        ]
      },
      {
        title: 'Diction Precision',
        content: [
          'Word choice reveals analytical sophistication:',
          '',
          'Replace vague verbs:',
          '• talks about → interrogates, examines, explores',
          '• shows → demonstrates, reveals, illustrates',
          '• tells → conveys, suggests, implies',
          '',
          'Use discipline-specific terminology:',
          '• rhetorical strategy, ethos/pathos/logos',
          '• narrative structure, diction, syntax',
          '• juxtaposition, parallelism, irony',
          '',
          'But never use jargon for its own sake—precision means clarity.'
        ]
      },
      {
        title: 'Rhetorical Devices in Your Own Writing',
        content: [
          'Deploy the same techniques you analyze:',
          '',
          '• Parallelism: "Morrison questions assumptions, challenges conventions, and disrupts expectations."',
          '• Antithesis: "The novel celebrates memory while exposing its distortions."',
          '• Rhetorical Questions: "But can trauma ever be fully narrated?"',
          '• Cumulative Sentences: Building clauses to create rhythm',
          '',
          'Use these strategically, not excessively. One well-placed device > multiple forced attempts.'
        ],
        examples: [
          'Weak Style:',
          '"The book is good. The author writes well. There are many themes. I liked it a lot."',
          '',
          'Strong Style:',
          '"Morrison\'s narrative architecture—fragmented, recursive, resistant to closure—enacts the very trauma it depicts. By refusing linear chronology, the text forces readers into the psychological space of the traumatized, where past and present collapse into perpetual re-experiencing. This formal choice transcends mere stylistic innovation; it becomes the novel\'s central argument about historical memory\'s inescapable weight."'
        ]
      }
    ]
  }
]

export default function LessonsClient() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [activeSection, setActiveSection] = useState(0)

  const completedCount = lessons.filter(l => l.completed).length
  const overallProgress = (completedCount / lessons.length) * 100

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6 hover-lift"
            onClick={() => setSelectedLesson(null)}
          >
            ← Back to Lessons
          </Button>

          {/* Lesson Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-xl ${selectedLesson.color}`}>
                <selectedLesson.icon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{selectedLesson.title}</h1>
                <p className="text-muted-foreground text-lg">{selectedLesson.description}</p>
                <div className="flex gap-3 mt-4">
                  <Badge variant="secondary">{selectedLesson.duration}</Badge>
                  <Badge variant="outline">{selectedLesson.difficulty}</Badge>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{activeSection + 1} / {selectedLesson.sections.length}</span>
              </div>
              <Progress value={((activeSection + 1) / selectedLesson.sections.length) * 100} />
            </div>
          </div>

          {/* Lesson Content */}
          <Card className="animate-slide-up hover-lift">
            <CardHeader>
              <CardTitle className="text-2xl">
                {selectedLesson.sections[activeSection].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedLesson.sections[activeSection].content.map((paragraph, i) => (
                <p key={i} className={paragraph.startsWith('•') || paragraph.startsWith('×') ? 'text-muted-foreground ml-4' : paragraph === '' ? 'hidden' : 'text-foreground leading-relaxed'}>
                  {paragraph}
                </p>
              ))}

              {selectedLesson.sections[activeSection].examples && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold">Examples</h4>
                    </div>
                    {selectedLesson.sections[activeSection].examples.map((example, i) => (
                      <p key={i} className={example === '' ? 'h-2' : 'text-sm leading-relaxed'}>
                        {example}
                      </p>
                    ))}
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                >
                  Previous Section
                </Button>
                <Button
                  onClick={() => {
                    if (activeSection < selectedLesson.sections.length - 1) {
                      setActiveSection(activeSection + 1)
                    } else {
                      setSelectedLesson(null)
                    }
                  }}
                  className="hover-lift"
                >
                  {activeSection < selectedLesson.sections.length - 1 ? (
                    <>Next Section <ChevronRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Complete Lesson <CheckCircle2 className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-chart-1 rounded-xl">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Writing Lessons</h1>
              <p className="text-muted-foreground">Master AP Lang principles with structured guidance</p>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="mt-6 gradient-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-semibold text-lg">Your Progress</div>
                    <div className="text-sm text-muted-foreground">
                      {completedCount} of {lessons.length} lessons completed
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {lessons.map((lesson, index) => {
            const Icon = lesson.icon
            return (
              <Card 
                key={lesson.id} 
                className={`hover-lift cursor-pointer animate-slide-up border-2 transition-all hover:shadow-lg hover:border-primary/50 ${lesson.locked ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => !lesson.locked && setSelectedLesson(lesson)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${lesson.color}`}>
                      {lesson.locked ? <Lock className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    {lesson.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : lesson.progress > 0 ? (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    ) : null}
                  </div>
                  <CardTitle className="text-xl mt-4">{lesson.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex gap-3">
                      <Badge variant="secondary">{lesson.duration}</Badge>
                      <Badge variant="outline">{lesson.difficulty}</Badge>
                    </div>
                  </div>
                  {lesson.progress > 0 && (
                    <div className="space-y-2">
                      <Progress value={lesson.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">{lesson.progress}% complete</p>
                    </div>
                  )}
                  {!lesson.locked && (
                    <Button className="w-full mt-4" variant={lesson.completed ? "outline" : "default"}>
                      {lesson.completed ? 'Review Lesson' : lesson.progress > 0 ? 'Continue' : 'Start Lesson'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Study Tips */}
        <Card className="mt-8 animate-fade-in border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Study Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Complete lessons in order to build foundational skills progressively</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Apply techniques immediately in your next essay to reinforce learning</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Review completed lessons before major assignments to refresh strategies</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Track how lesson concepts appear in your essay analysis feedback</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
