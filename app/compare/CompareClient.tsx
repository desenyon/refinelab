'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { GitCompare, TrendingUp, TrendingDown, Minus, ArrowRight, CheckCircle2, SplitSquareHorizontal } from 'lucide-react'
import { toast } from 'sonner'

interface Essay {
  id: string
  title: string
  content: string
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
  evidenceDistribution: number | null
  analysisToSummaryRatio: number | null
}

export default function CompareClient() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [essay1, setEssay1] = useState<string>('')
  const [essay2, setEssay2] = useState<string>('')
  const [comparing, setComparing] = useState(false)
  const [comparison, setComparison] = useState<any>(null)
  const [selectedEssay1, setSelectedEssay1] = useState<Essay | null>(null)
  const [selectedEssay2, setSelectedEssay2] = useState<Essay | null>(null)

  useEffect(() => {
    fetch('/api/essays')
      .then(r => r.json())
      .then(d => setEssays(d.essays || d))
      .finally(() => setLoading(false))
  }, [])

  const handleCompare = async () => {
    if (!essay1 || !essay2) {
      toast.error('Select two essays')
      return
    }
    if (essay1 === essay2) {
      toast.error('Select different essays')
      return
    }

    const e1 = essays.find(e => e.id === essay1)
    const e2 = essays.find(e => e.id === essay2)
    setSelectedEssay1(e1 || null)
    setSelectedEssay2(e2 || null)

    setComparing(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay1Id: essay1, essay2Id: essay2 })
      })
      if (res.ok) {
        const data = await res.json()
        setComparison(data.comparison || data)
        toast.success('Comparison complete!')
      } else {
        toast.error('Comparison failed')
      }
    } catch {
      toast.error('Comparison failed')
    } finally {
      setComparing(false)
    }
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0.05) return <TrendingUp className="h-5 w-5 text-green-600" />
    if (delta < -0.05) return <TrendingDown className="h-5 w-5 text-red-600" />
    return <Minus className="h-5 w-5 text-muted-foreground" />
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0.05) return 'text-green-600 bg-green-50 dark:bg-green-950'
    if (delta < -0.05) return 'text-red-600 bg-red-50 dark:bg-red-950'
    return 'text-muted-foreground bg-muted'
  }

  const getMetricLabel = (key: string) => {
    const labels: Record<string, string> = {
      clarityDelta: 'Thesis Clarity',
      coherenceDelta: 'Coherence',
      structureDelta: 'Structure',
      argumentDelta: 'Argument Depth',
      analysisDelta: 'Analysis Quality'
    }
    return labels[key] || key.replace('Delta', '')
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Compare Essays</h1>
            <p className="text-muted-foreground mt-1">Track improvement between drafts and versions</p>
          </div>

          {essays.length < 2 ? (
            <EmptyState
              icon={GitCompare}
              title="Need more essays"
              description="Upload at least 2 essays to compare their analysis and track improvement"
              actionLabel="Upload Essay"
              actionHref="/upload"
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select Essays to Compare</CardTitle>
                  <CardDescription>Choose two essays to analyze differences and improvements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Essay (Before)</label>
                      <Select value={essay1} onValueChange={setEssay1}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select essay" />
                        </SelectTrigger>
                        <SelectContent>
                          {essays.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Second Essay (After)</label>
                      <Select value={essay2} onValueChange={setEssay2}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select essay" />
                        </SelectTrigger>
                        <SelectContent>
                          {essays.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCompare} 
                    disabled={comparing || !essay1 || !essay2} 
                    className="w-full"
                    size="lg"
                  >
                    {comparing ? 'Analyzing...' : 'Compare Essays'}
                  </Button>
                </CardContent>
              </Card>

              {comparison && (
                <div className="space-y-6">
                  {/* Metric Deltas */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Changes</CardTitle>
                      <CardDescription>Comparison between Essay 1 and Essay 2</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['clarityDelta', 'coherenceDelta', 'structureDelta', 'argumentDelta', 'analysisDelta'].map(key => (
                        comparison[key] !== undefined && (
                          <div key={key} className={`flex items-center justify-between p-4 rounded-lg border ${getDeltaColor(comparison[key])}`}>
                            <div className="flex items-center gap-3">
                              {getDeltaIcon(comparison[key])}
                              <span className="font-medium">{getMetricLabel(key)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl font-bold">{formatPercentage(comparison[key])}</div>
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </CardContent>
                  </Card>

                  {/* Key Improvements */}
                  {comparison.improvements && Array.isArray(comparison.improvements) && comparison.improvements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Key Improvements
                        </CardTitle>
                        <CardDescription>Notable changes between versions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {comparison.improvements.map((imp: string, i: number) => (
                            <li key={i} className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <ArrowRight className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Side by Side Metrics */}
                  {selectedEssay1 && selectedEssay2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SplitSquareHorizontal className="h-5 w-5" />
                          Metric Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="metrics">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="metrics">Metric Scores</TabsTrigger>
                            <TabsTrigger value="preview">Content Preview</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="metrics" className="space-y-4 mt-4">
                            {[
                              { key: 'thesisClarity', label: 'Thesis Clarity' },
                              { key: 'argumentDepth', label: 'Argument Depth' },
                              { key: 'structureBalance', label: 'Structure' },
                              { key: 'evidenceDistribution', label: 'Evidence Use' },
                              { key: 'analysisToSummaryRatio', label: 'Analysis Ratio' }
                            ].map(({ key, label }) => {
                              const val1 = (selectedEssay1[key as keyof Essay] as number) || 0
                              const val2 = (selectedEssay2[key as keyof Essay] as number) || 0
                              const diff = val2 - val1
                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{label}</span>
                                    <div className="flex items-center gap-2">
                                      {diff > 0.01 && <TrendingUp className="h-4 w-4 text-green-600" />}
                                      {diff < -0.01 && <TrendingDown className="h-4 w-4 text-red-600" />}
                                      <span className="text-sm text-muted-foreground">
                                        {(val1 * 100).toFixed(0)}% → {(val2 * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Progress value={val1 * 100} className="h-2" />
                                    <Progress value={val2 * 100} className="h-2" />
                                  </div>
                                </div>
                              )
                            })}
                          </TabsContent>

                          <TabsContent value="preview" className="mt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Essay 1: {selectedEssay1.title}</h4>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
                                  {selectedEssay1.content.substring(0, 500)}...
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Essay 2: {selectedEssay2.title}</h4>
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg max-h-60 overflow-y-auto">
                                  {selectedEssay2.content.substring(0, 500)}...
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
