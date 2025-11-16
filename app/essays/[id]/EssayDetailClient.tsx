'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, TrendingUp, FileText, Lightbulb, Target, BookOpen, Sparkles, MessageSquare, Edit, Network, ArrowRight, Layers, GitBranch, Repeat } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import EditorClient from './EditorClient'

interface ParagraphAnalysis {
  paragraphNumber: number
  text: string
  tags: string[]
  feedback: string
  issueTypes: string[]
}

interface Essay {
  id: string
  title: string
  content: string
  assignmentName: string | null
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
  evidenceDistribution: number | null
  analysisToSummaryRatio: number | null
  sentenceVariety: number | null
  logicalProgression: number | null
  paragraphAnalysis: any
  strengthsWeaknesses: any
  teacherComments: any
}

export default function EssayDetailClient({ essay }: { essay: Essay }) {
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null)
  const [showFlowMap, setShowFlowMap] = useState(false)
  
  const paragraphAnalysis: ParagraphAnalysis[] = essay.paragraphAnalysis as ParagraphAnalysis[] || []
  const strengthsWeaknesses = essay.strengthsWeaknesses as { strengths: string[], weaknesses: string[] } || { strengths: [], weaknesses: [] }
  const teacherComments = essay.teacherComments as string[] || []

  // Generate structure flow map
  const structureFlow = useMemo(() => {
    return paragraphAnalysis.map((para, idx) => {
      const hasIntro = para.tags.some(t => t.toLowerCase().includes('intro'))
      const hasConclusion = para.tags.some(t => t.toLowerCase().includes('conclusion'))
      const hasThesis = para.tags.some(t => t.toLowerCase().includes('thesis'))
      const hasEvidence = para.tags.some(t => t.toLowerCase().includes('evidence'))
      const hasAnalysis = para.tags.some(t => t.toLowerCase().includes('analysis'))
      
      return {
        number: para.paragraphNumber,
        role: hasIntro ? 'Introduction' : hasConclusion ? 'Conclusion' : hasThesis ? 'Thesis' : hasEvidence ? 'Evidence' : hasAnalysis ? 'Analysis' : 'Body',
        tags: para.tags,
        issues: para.issueTypes.length,
        preview: para.text.substring(0, 80) + '...'
      }
    })
  }, [paragraphAnalysis])

  const metrics = [
    { name: 'Thesis Clarity', value: Math.round((essay.thesisClarity || 0) * 100), color: 'bg-blue-500' },
    { name: 'Argument Depth', value: Math.round((essay.argumentDepth || 0) * 100), color: 'bg-green-500' },
    { name: 'Structure', value: Math.round((essay.structureBalance || 0) * 100), color: 'bg-purple-500' },
    { name: 'Evidence', value: Math.round((essay.evidenceDistribution || 0) * 100), color: 'bg-yellow-500' },
    { name: 'Analysis Ratio', value: Math.round((essay.analysisToSummaryRatio || 0) * 100), color: 'bg-pink-500' },
    { name: 'Sentence Variety', value: Math.round((essay.sentenceVariety || 0) * 100), color: 'bg-indigo-500' },
  ]

  const radarData = [
    { skill: 'Thesis', value: Math.round((essay.thesisClarity || 0) * 100), fullMark: 100 },
    { skill: 'Argument', value: Math.round((essay.argumentDepth || 0) * 100), fullMark: 100 },
    { skill: 'Structure', value: Math.round((essay.structureBalance || 0) * 100), fullMark: 100 },
    { skill: 'Evidence', value: Math.round((essay.evidenceDistribution || 0) * 100), fullMark: 100 },
    { skill: 'Analysis', value: Math.round((essay.analysisToSummaryRatio || 0) * 100), fullMark: 100 },
    { skill: 'Variety', value: Math.round((essay.sentenceVariety || 0) * 100), fullMark: 100 },
  ]

  const barData = metrics.map(m => ({
    name: m.name.split(' ')[0],
    score: m.value,
    target: 85
  }))

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 85) return 'default'
    if (score >= 70) return 'secondary'
    return 'outline'
  }

  const getIssueTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'argumentation': Target,
      'analysis': Lightbulb,
      'evidence': BookOpen,
      'structure': FileText
    }
    return icons[type.toLowerCase()] || AlertCircle
  }

  const averageScore = Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="RefineLab" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </Link>
          <Link href="/essays">
            <Button variant="outline">Back to Essays</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Enhanced Overall Score Card */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{essay.title}</h2>
              {essay.assignmentName && (
                <p className="text-lg text-muted-foreground">{essay.assignmentName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Uploaded {new Date(essay.uploadedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Enhanced Score Card */}
            <Card className="min-w-[320px] border-2">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold mb-2" style={{
                    background: averageScore >= 85 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                averageScore >= 70 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                averageScore >= 60 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {averageScore}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Overall Score</p>
                  <Badge variant={averageScore >= 85 ? 'default' : averageScore >= 70 ? 'secondary' : 'outline'} className="text-xs">
                    {averageScore >= 85 ? 'Advanced' : averageScore >= 70 ? 'Proficient' : averageScore >= 60 ? 'Developing' : 'Needs Work'}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                {/* Mini Metric Breakdown */}
                <div className="space-y-2">
                  {metrics.slice(0, 3).map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.value} className="w-16 h-1.5" />
                        <span className={`font-medium w-8 text-right ${getScoreColor(metric.value)}`}>
                          {metric.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{essay.content.split(/\s+/).length}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{paragraphAnalysis.length}</div>
                    <div className="text-xs text-muted-foreground">Paragraphs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Integrity Notice */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-900 dark:text-blue-100">Academic Integrity</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              This analysis provides diagnostic feedback only. RefineLab never generates replacement text for your essay. All improvements must be your own work.
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="content">Essay Text</TabsTrigger>
                </TabsList>

                {/* Overview Tab - ENHANCED WITH MORE CONTENT */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Breakdown</CardTitle>
                      <CardDescription>Your scores across key writing dimensions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" fill="#667eea" name="Your Score" />
                          <Bar dataKey="target" fill="#e0e7ff" name="Target (85%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Comprehensive Essay Analysis Summary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Content Quality</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Thesis Clarity</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.thesisClarity || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.thesisClarity || 0) * 100)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Argument Depth</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.argumentDepth || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.argumentDepth || 0) * 100)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Evidence Quality</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.evidenceDistribution || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.evidenceDistribution || 0) * 100)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Technical Excellence</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Structure Balance</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.structureBalance || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.structureBalance || 0) * 100)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sentence Variety</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.sentenceVariety || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.sentenceVariety || 0) * 100)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Logical Flow</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(essay.logicalProgression || 0) * 100} className="w-20 h-2" />
                            <span className="text-sm font-medium">{Math.round((essay.logicalProgression || 0) * 100)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Insights Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Key Insights & Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {metrics.length > 0 && (() => {
                        const strongest = metrics.reduce((max, m) => m.value > max.value ? m : max)
                        const weakest = metrics.reduce((min, m) => m.value < min.value ? m : min)
                        const needsImprovement = metrics.filter(m => m.value < 70)
                        
                        return (
                          <>
                            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-900 dark:text-green-100">Strongest Area</span>
                              </div>
                              <p className="text-sm text-green-800 dark:text-green-200">
                                <strong>{strongest.name}</strong> scored {strongest.value}%. This demonstrates significant mastery and should be maintained in future work.
                              </p>
                            </div>
                            
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-900 dark:text-yellow-100">Priority for Improvement</span>
                              </div>
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>{weakest.name}</strong> scored {weakest.value}%. Focusing on this dimension will yield the greatest impact on your overall writing quality.
                              </p>
                            </div>

                            {needsImprovement.length > 0 && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-5 w-5 text-blue-600" />
                                  <span className="font-semibold text-blue-900 dark:text-blue-100">Areas Needing Attention</span>
                                </div>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  {needsImprovement.length} dimension{needsImprovement.length > 1 ? 's' : ''} below 70%: {needsImprovement.map(m => m.name).join(', ')}. Review the Structure tab for specific guidance.
                                </p>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* Writing Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Essay Statistics</CardTitle>
                      <CardDescription>Quantitative analysis of your writing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{essay.content.split(/\s+/).length}</div>
                          <div className="text-xs text-muted-foreground">Total Words</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{essay.content.split(/[.!?]+/).filter(s => s.trim()).length}</div>
                          <div className="text-xs text-muted-foreground">Sentences</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{paragraphAnalysis.length}</div>
                          <div className="text-xs text-muted-foreground">Paragraphs</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {Math.round(essay.content.split(/\s+/).length / paragraphAnalysis.length || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">Words/Paragraph</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Structure Tab - MASSIVELY IMPROVED */}
                <TabsContent value="structure" className="space-y-4 mt-6">
                  {/* Essay Flow Visualization */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Network className="h-5 w-5 text-blue-500" />
                            Essay Structure Flow
                          </CardTitle>
                          <CardDescription>Visual map of your essay's organization</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowFlowMap(!showFlowMap)}
                        >
                          {showFlowMap ? 'List View' : 'Flow View'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showFlowMap ? (
                        <div className="space-y-4">
                          {structureFlow.map((node, idx) => (
                            <div key={node.number} className="relative">
                              {idx > 0 && (
                                <div className="absolute left-8 -top-4 w-0.5 h-4 bg-gradient-to-b from-blue-300 to-blue-500"></div>
                              )}
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white ${
                                    node.role === 'Introduction' ? 'bg-green-500' :
                                    node.role === 'Conclusion' ? 'bg-purple-500' :
                                    node.role === 'Thesis' ? 'bg-blue-500' :
                                    'bg-gray-500'
                                  }`}>
                                    {node.number}
                                  </div>
                                  {idx < structureFlow.length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-blue-400 rotate-90 mt-2" />
                                  )}
                                </div>
                                <div className="flex-1 p-4 bg-muted rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="default">{node.role}</Badge>
                                    {node.issues > 0 && (
                                      <Badge variant="destructive">{node.issues} issues</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{node.preview}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {node.tags.map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Structure Summary */}
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <Layers className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold">{paragraphAnalysis.length}</div>
                                <p className="text-xs text-muted-foreground">Total Paragraphs</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <GitBranch className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <div className="text-2xl font-bold">
                                  {structureFlow.filter(n => n.role !== 'Body').length}
                                </div>
                                <p className="text-xs text-muted-foreground">Key Sections</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <Repeat className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                <div className="text-2xl font-bold">
                                  {paragraphAnalysis.filter(p => p.issueTypes.length > 0).length}
                                </div>
                                <p className="text-xs text-muted-foreground">Needs Attention</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Detailed Paragraph Analysis */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg">Paragraph-by-Paragraph Breakdown</h4>
                            {paragraphAnalysis.length === 0 ? (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  No detailed paragraph analysis available yet.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              paragraphAnalysis.map((para) => (
                                <div 
                                  key={para.paragraphNumber} 
                                  className={`border-l-4 pl-4 space-y-3 p-4 rounded-r-lg transition-all cursor-pointer ${
                                    selectedParagraph === para.paragraphNumber 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg scale-[1.02]' 
                                      : 'border-muted hover:border-blue-300 hover:bg-muted/50 hover:shadow-md'
                                  }`}
                                  onClick={() => setSelectedParagraph(
                                    selectedParagraph === para.paragraphNumber ? null : para.paragraphNumber
                                  )}
                                >
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="font-semibold text-base px-3 py-1">
                                        ¶ {para.paragraphNumber}
                                      </Badge>
                                      {para.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    {para.issueTypes.length > 0 && (
                                      <div className="flex gap-1">
                                        {para.issueTypes.map(type => {
                                          const Icon = getIssueTypeIcon(type)
                                          return (
                                            <div key={type} className="p-1.5 rounded-full bg-muted" title={type}>
                                              <Icon className="h-4 w-4" />
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                    "{para.text.substring(0, 150)}..."
                                  </p>
                                  
                                  <Alert className={selectedParagraph === para.paragraphNumber ? '' : 'opacity-75'}>
                                    <Lightbulb className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                      <strong>Feedback:</strong> {para.feedback}
                                    </AlertDescription>
                                  </Alert>

                                  {selectedParagraph === para.paragraphNumber && (
                                    <div className="mt-3 p-3 bg-background rounded-lg border animate-slide-up">
                                      <h5 className="font-semibold text-sm mb-2">Full Paragraph Text:</h5>
                                      <p className="text-sm leading-relaxed">{para.text}</p>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Editor Tab - NEW! */}
                <TabsContent value="editor" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-green-500" />
                            Live Essay Editor
                          </CardTitle>
                          <CardDescription>
                            Edit your essay with real-time feedback and live metrics
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <EditorClient 
                        essayId={essay.id}
                        initialContent={essay.content}
                        initialTitle={essay.title}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Metrics Tab */}
                <TabsContent value="metrics" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Metric Scores</CardTitle>
                      <CardDescription>
                        In-depth breakdown of each writing dimension
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {metrics.map((metric) => (
                        <div key={metric.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{metric.name}</span>
                            <Badge variant={getScoreBadgeVariant(metric.value)} className={getScoreColor(metric.value)}>
                              {metric.value}%
                            </Badge>
                          </div>
                          <Progress value={metric.value} className="h-3" />
                          <p className="text-xs text-muted-foreground">
                            {metric.value >= 85 ? 'Excellent performance. Maintain this standard.' : 
                             metric.value >= 70 ? 'Good work. Some refinement possible.' :
                             metric.value >= 60 ? 'Developing. Focus on strengthening this area.' :
                             'Needs significant work. Prioritize improvement here.'}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Radar</CardTitle>
                      <CardDescription>
                        Visual representation of your writing profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar name="Your Score" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Original Essay Content</CardTitle>
                      <CardDescription>Your submitted essay text</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div className="font-serif text-[16px] leading-[1.8] text-foreground">
                          {essay.content.split(/\n\n+/).filter(p => p.trim()).map((paragraph, idx) => (
                            <p key={idx} className="mb-6 first-line:indent-12 text-justify">
                              {paragraph.trim().replace(/\n/g, ' ')}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {strengthsWeaknesses.strengths.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No strengths identified yet</p>
                    ) : (
                      strengthsWeaknesses.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2 text-sm p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Areas to Improve */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                    Growth Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {strengthsWeaknesses.weaknesses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No areas for improvement identified</p>
                    ) : (
                      strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex gap-2 text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <Target className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Teacher Comments */}
              {teacherComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Teacher Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {teacherComments.map((comment, index) => (
                        <li key={index} className="text-sm p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/lessons">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Review Writing Lessons
                    </Button>
                  </Link>
                  <Link href="/upload">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Revised Draft
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
