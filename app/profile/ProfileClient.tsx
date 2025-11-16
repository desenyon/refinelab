'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { User, RefreshCw, Loader2 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

interface Fingerprint {
  id: string
  formalityScore: number | null
  confidenceScore: number | null
  averageParagraphLength: number | null
  introSummaryBalance: number | null
  evidencePatterns: string[]
  structuralTendencies: string[]
  toneTendencies: string[]
  updatedAt: string
}

export default function ProfileClient() {
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetchFingerprint()
  }, [])

  const fetchFingerprint = async () => {
    try {
      const res = await fetch('/api/fingerprint')
      if (res.ok) {
        setFingerprint(await res.json())
      }
    } catch {
      toast.error('Failed to load fingerprint')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/fingerprint', { method: 'POST' })
      if (res.ok) {
        setFingerprint(await res.json())
        toast.success('Fingerprint regenerated')
      }
    } catch {
      toast.error('Failed to regenerate')
    } finally {
      setRegenerating(false)
    }
  }

  const radarData = fingerprint ? [
    { skill: 'Formality', value: Math.round((fingerprint.formalityScore || 0) * 100) },
    { skill: 'Confidence', value: Math.round((fingerprint.confidenceScore || 0) * 100) },
    { skill: 'Balance', value: Math.round((fingerprint.introSummaryBalance || 0) * 100) },
  ] : []

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Writing Fingerprint</h1>
              <p className="text-muted-foreground mt-1">Your unique writing patterns</p>
            </div>
            <Button onClick={handleRegenerate} disabled={regenerating} variant="outline">
              {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !fingerprint ? (
            <EmptyState
              icon={User}
              title="No fingerprint yet"
              description="Upload essays to generate your writing fingerprint"
              actionLabel="Upload Essay"
              actionHref="/upload"
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Formality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round((fingerprint.formalityScore || 0) * 100)}%</div>
                    <Progress value={(fingerprint.formalityScore || 0) * 100} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round((fingerprint.confidenceScore || 0) * 100)}%</div>
                    <Progress value={(fingerprint.confidenceScore || 0) * 100} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Paragraph</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round(fingerprint.averageParagraphLength || 0)}</div>
                    <p className="text-xs text-muted-foreground mt-2">words</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Style Profile</CardTitle>
                  <CardDescription>Visual representation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tone Tendencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fingerprint.toneTendencies?.map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <Badge variant="secondary">{i + 1}</Badge>
                          <span className="text-sm">{t}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Structural Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fingerprint.structuralTendencies?.map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <Badge variant="secondary">{i + 1}</Badge>
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Habits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fingerprint.evidencePatterns?.map((e, i) => (
                      <div key={i} className="flex gap-2">
                        <Badge variant="outline">{i + 1}</Badge>
                        <span className="text-sm">{e}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
