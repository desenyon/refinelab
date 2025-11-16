'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Essay {
  id: string
  title: string
  uploadedAt: string
}

interface ComparisonResult {
  clarityDelta: number
  coherenceDelta: number
  structureDelta: number
  argumentDelta: number
  analysisDelta: number
  improvements: string[]
}

export default function CompareClient() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [beforeId, setBeforeId] = useState('')
  const [afterId, setAfterId] = useState('')
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEssays()
  }, [])

  const fetchEssays = async () => {
    try {
      const response = await fetch('/api/essays')
      if (response.ok) {
        const data = await response.json()
        setEssays(data)
      }
    } catch (error) {
      console.error('Error fetching essays:', error)
    }
  }

  const handleCompare = async () => {
    if (!beforeId || !afterId) {
      setError('Please select both essays to compare')
      return
    }

    if (beforeId === afterId) {
      setError('Please select different essays')
      return
    }

    setLoading(true)
    setError('')
    setComparison(null)

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeEssayId: beforeId, afterEssayId: afterId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to compare essays')
        return
      }

      const data = await response.json()
      setComparison(data.comparison)
    } catch (err) {
      setError('Error comparing essays. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0.05) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (delta < -0.05) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0.05) return 'text-green-600'
    if (delta < -0.05) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : ''
    return `${sign}${Math.round(delta * 100)}%`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Compare Essay Drafts</h2>
            <p className="text-muted-foreground">
              See how your writing has improved between two versions
            </p>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Academic Integrity:</strong> This comparison shows metric-level improvements, 
              not text-level differences. You'll see how scores changed, not what specific words were altered.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Select Essays to Compare</CardTitle>
              <CardDescription>
                Choose a "before" and "after" version of your essay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Before (Earlier Draft)</label>
                  <Select value={beforeId} onValueChange={setBeforeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first essay" />
                    </SelectTrigger>
                    <SelectContent>
                      {essays.map((essay) => (
                        <SelectItem key={essay.id} value={essay.id}>
                          {essay.title} ({new Date(essay.uploadedAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">After (Later Draft)</label>
                  <Select value={afterId} onValueChange={setAfterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second essay" />
                    </SelectTrigger>
                    <SelectContent>
                      {essays.map((essay) => (
                        <SelectItem key={essay.id} value={essay.id}>
                          {essay.title} ({new Date(essay.uploadedAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCompare} 
                disabled={loading || !beforeId || !afterId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Compare Essays'
                )}
              </Button>
            </CardContent>
          </Card>

          {comparison && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Metric Changes</CardTitle>
                  <CardDescription>
                    How your writing metrics evolved between drafts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Clarity', delta: comparison.clarityDelta },
                    { name: 'Coherence', delta: comparison.coherenceDelta },
                    { name: 'Structure', delta: comparison.structureDelta },
                    { name: 'Argument Strength', delta: comparison.argumentDelta },
                    { name: 'Analysis Depth', delta: comparison.analysisDelta },
                  ].map((metric) => (
                    <div key={metric.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeltaIcon(metric.delta)}
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={Math.abs(metric.delta) * 100} 
                          className="w-32"
                        />
                        <span className={`text-sm font-semibold ${getDeltaColor(metric.delta)} w-12 text-right`}>
                          {formatDelta(metric.delta)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Identified Improvements</CardTitle>
                  <CardDescription>
                    Strategic changes observed between versions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparison.improvements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No specific improvements identified</p>
                  ) : (
                    <ul className="space-y-2">
                      {comparison.improvements.map((improvement, index) => (
                        <li key={index} className="flex gap-2">
                          <Badge variant="secondary" className="shrink-0">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
