'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { toast } from 'sonner'

interface Essay {
  id: string
  title: string
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
}

export default function CompareClient() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [essay1, setEssay1] = useState<string>('')
  const [essay2, setEssay2] = useState<string>('')
  const [comparing, setComparing] = useState(false)
  const [comparison, setComparison] = useState<any>(null)

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

    setComparing(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay1Id: essay1, essay2Id: essay2 })
      })
      if (res.ok) {
        const data = await res.json()
        setComparison(data)
        toast.success('Comparison complete')
      }
    } catch {
      toast.error('Comparison failed')
    } finally {
      setComparing(false)
    }
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0.05) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (delta < -0.05) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Compare Essays</h1>
            <p className="text-muted-foreground mt-1">Track improvement between drafts</p>
          </div>

          {essays.length < 2 ? (
            <EmptyState
              icon={GitCompare}
              title="Need more essays"
              description="Upload at least 2 essays to compare"
              actionLabel="Upload Essay"
              actionHref="/upload"
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select Essays</CardTitle>
                  <CardDescription>Choose two essays to compare</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Essay</label>
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
                      <label className="text-sm font-medium">Second Essay</label>
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
                  <Button onClick={handleCompare} disabled={comparing || !essay1 || !essay2} className="w-full">
                    {comparing ? 'Comparing...' : 'Compare Essays'}
                  </Button>
                </CardContent>
              </Card>

              {comparison && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparison Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['clarityDelta', 'coherenceDelta', 'structureDelta', 'argumentDelta'].map(key => (
                      <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium capitalize">{key.replace('Delta', '')}</span>
                        <div className="flex items-center gap-2">
                          {getDeltaIcon(comparison[key])}
                          <Badge>{(comparison[key] * 100).toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                    {comparison.improvements?.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold">Improvements</h4>
                        {comparison.improvements.map((imp: string, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground">• {imp}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
