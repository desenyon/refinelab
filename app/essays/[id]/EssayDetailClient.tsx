'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, TrendingUp, FileText, Lightbulb, Target, BookOpen, Sparkles, MessageSquare } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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
  
  const paragraphAnalysis: ParagraphAnalysis[] = essay.paragraphAnalysis as ParagraphAnalysis[] || []
  const strengthsWeaknesses = essay.strengthsWeaknesses as { strengths: string[], weaknesses: string[] } || { strengths: [], weaknesses: [] }
  const teacherComments = essay.teacherComments as string[] || []

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
          {/* Header with Overall Score */}
          <div className="flex items-start justify-between">
            <div>
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
            <Card className="min-w-[200px]">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl font-bold mb-2" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {averageScore}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="content">Essay Text</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
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

                  {/* Quick Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Quick Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Strongest Area */}
                      {metrics.length > 0 && (() => {
                        const strongest = metrics.reduce((max, m) => m.value > max.value ? m : max)
                        const weakest = metrics.reduce((min, m) => m.value < min.value ? m : min)
                        return (
                          <>
                            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-900 dark:text-green-100">Strongest Area</span>
                              </div>
                              <p className="text-sm text-green-800 dark:text-green-200">
                                <strong>{strongest.name}</strong> ({strongest.value}%) - This is a significant strength in your writing!
                              </p>
                            </div>
                            
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-900 dark:text-yellow-100">Growth Opportunity</span>
                              </div>
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>{weakest.name}</strong> ({weakest.value}%) - Focus here to see the biggest improvement.
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Structure Tab */}
                <TabsContent value="structure" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paragraph-by-Paragraph Analysis</CardTitle>
                      <CardDescription>
                        Detailed feedback for each section of your essay
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                            className={`border-l-4 pl-4 space-y-3 p-4 rounded-r-lg transition-colors ${
                              selectedParagraph === para.paragraphNumber 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                : 'border-muted hover:border-blue-300 hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedParagraph(
                              selectedParagraph === para.paragraphNumber ? null : para.paragraphNumber
                            )}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-semibold">
                                  Paragraph {para.paragraphNumber}
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
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {para.text}
                            </p>
                            
                            <Alert>
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                <strong>Feedback:</strong> {para.feedback}
                              </AlertDescription>
                            </Alert>
                          </div>
                        ))
                      )}
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
                            {metric.value >= 85 ? '🎯 Excellent! Keep this up.' : 
                             metric.value >= 70 ? '👍 Good work. Some room for improvement.' :
                             metric.value >= 60 ? '⚠️ Developing. Focus on strengthening this area.' :
                             '📈 Needs work. This should be a priority for improvement.'}
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
