'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, TrendingUp, FileText, Lightbulb } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

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
  const paragraphAnalysis: ParagraphAnalysis[] = essay.paragraphAnalysis as ParagraphAnalysis[] || []
  const strengthsWeaknesses = essay.strengthsWeaknesses as { strengths: string[], weaknesses: string[] } || { strengths: [], weaknesses: [] }
  const teacherComments = essay.teacherComments as string[] || []

  const metrics = [
    { name: 'Thesis Clarity', value: Math.round((essay.thesisClarity || 0) * 100) },
    { name: 'Argument Depth', value: Math.round((essay.argumentDepth || 0) * 100) },
    { name: 'Structure', value: Math.round((essay.structureBalance || 0) * 100) },
    { name: 'Evidence', value: Math.round((essay.evidenceDistribution || 0) * 100) },
    { name: 'Analysis Ratio', value: Math.round((essay.analysisToSummaryRatio || 0) * 100) },
    { name: 'Sentence Variety', value: Math.round((essay.sentenceVariety || 0) * 100) },
  ]

  const radarData = [
    { skill: 'Thesis', value: Math.round((essay.thesisClarity || 0) * 100) },
    { skill: 'Argument', value: Math.round((essay.argumentDepth || 0) * 100) },
    { skill: 'Structure', value: Math.round((essay.structureBalance || 0) * 100) },
    { skill: 'Evidence', value: Math.round((essay.evidenceDistribution || 0) * 100) },
    { skill: 'Analysis', value: Math.round((essay.analysisToSummaryRatio || 0) * 100) },
    { skill: 'Variety', value: Math.round((essay.sentenceVariety || 0) * 100) },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="RefineLab" className="w-8 h-8" />
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </Link>
          <Link href="/essays">
            <Button variant="outline">Back to Essays</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{essay.title}</h2>
            {essay.assignmentName && (
              <p className="text-muted-foreground">{essay.assignmentName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Uploaded {new Date(essay.uploadedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Academic Integrity Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Remember:</strong> This analysis provides feedback and insights only. 
              RefineLab does not generate replacement text for your essay.
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="structure">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="structure">Structure Map</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="content">Essay Text</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paragraph-Level Analysis</CardTitle>
                      <CardDescription>
                        Each paragraph analyzed for structure, clarity, and depth
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {paragraphAnalysis.length === 0 ? (
                        <p className="text-muted-foreground">No paragraph analysis available</p>
                      ) : (
                        paragraphAnalysis.map((para) => (
                          <div key={para.paragraphNumber} className="border-l-4 border-primary pl-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Paragraph {para.paragraphNumber}</Badge>
                              {para.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {para.text}
                            </p>
                            <Alert>
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {para.feedback}
                              </AlertDescription>
                            </Alert>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Metrics</CardTitle>
                      <CardDescription>
                        Quantitative assessment of your essay's strengths
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {metrics.map((metric) => (
                        <div key={metric.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{metric.name}</span>
                            <span className={`font-semibold ${getScoreColor(metric.value)}`}>
                              {metric.value}%
                            </span>
                          </div>
                          <Progress value={metric.value} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Radar</CardTitle>
                      <CardDescription>
                        Visual representation of your writing dimensions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content">
                  <Card>
                    <CardHeader>
                      <CardTitle>Essay Content</CardTitle>
                      <CardDescription>Original essay text as submitted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div className="font-serif text-[15px] leading-[1.8] text-foreground">
                          {essay.content.split(/\n\n+/).filter(p => p.trim()).map((paragraph, idx) => (
                            <p key={idx} className="mb-6 indent-8 first:indent-0">
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

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strengthsWeaknesses.strengths.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No strengths identified</p>
                    ) : (
                      strengthsWeaknesses.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strengthsWeaknesses.weaknesses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No weaknesses identified</p>
                    ) : (
                      strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>

              {teacherComments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {teacherComments.map((comment, index) => (
                        <li key={index} className="text-sm p-2 bg-muted rounded">
                          {comment}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
