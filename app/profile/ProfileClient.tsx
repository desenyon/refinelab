'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, RefreshCw, User } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

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
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFingerprint()
  }, [])

  const fetchFingerprint = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/fingerprint')
      if (response.ok) {
        const data = await response.json()
        setFingerprint(data)
      } else if (response.status === 404) {
        setError('Upload some essays first to generate your writing fingerprint')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to load fingerprint')
      }
    } catch (error) {
      console.error('Error fetching fingerprint:', error)
      setError('Failed to load fingerprint')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      setError('')
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setFingerprint(data)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to regenerate fingerprint')
      }
    } catch (error) {
      console.error('Error regenerating fingerprint:', error)
      setError('Failed to regenerate fingerprint')
    } finally {
      setRegenerating(false)
    }
  }

  const radarData = fingerprint ? [
    { skill: 'Formality', value: Math.round((fingerprint.formalityScore || 0) * 100) },
    { skill: 'Confidence', value: Math.round((fingerprint.confidenceScore || 0) * 100) },
    { skill: 'Intro Balance', value: Math.round((fingerprint.introSummaryBalance || 0) * 100) },
  ] : []

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Writing Fingerprint</h2>
              <p className="text-muted-foreground">
                Patterns and tendencies across all your essays
              </p>
            </div>
            <Button
              onClick={handleRegenerate}
              disabled={regenerating || loading}
              variant="outline"
              size="sm"
            >
              {regenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>

          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Your writing fingerprint shows habitual patterns in your writing style. 
              This helps you understand your tendencies, not change who you are as a writer.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing your writing patterns...</p>
              </CardContent>
            </Card>
          ) : fingerprint ? (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Formality Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((fingerprint.formalityScore || 0) * 100)}%
                    </div>
                    <Progress value={(fingerprint.formalityScore || 0) * 100} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {fingerprint.formalityScore && fingerprint.formalityScore > 0.7
                        ? 'Highly formal academic tone'
                        : 'Moderate formality'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((fingerprint.confidenceScore || 0) * 100)}%
                    </div>
                    <Progress value={(fingerprint.confidenceScore || 0) * 100} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {fingerprint.confidenceScore && fingerprint.confidenceScore > 0.7
                        ? 'Assertive claims'
                        : 'Tentative language'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Paragraph Length</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(fingerprint.averageParagraphLength || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">words per paragraph</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Writing Style Profile</CardTitle>
                  <CardDescription>Visual representation of your writing dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Your Style"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tone Tendencies</CardTitle>
                    <CardDescription>How your voice comes across</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fingerprint.toneTendencies && fingerprint.toneTendencies.length > 0 ? (
                        fingerprint.toneTendencies.map((tendency, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-0.5">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{tendency}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tone patterns identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Structural Patterns</CardTitle>
                    <CardDescription>How you organize your writing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fingerprint.structuralTendencies && fingerprint.structuralTendencies.length > 0 ? (
                        fingerprint.structuralTendencies.map((tendency, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Badge variant="secondary" className="mt-0.5">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{tendency}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No structural patterns identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Evidence Habits</CardTitle>
                  <CardDescription>How you use and integrate evidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fingerprint.evidencePatterns && fingerprint.evidencePatterns.length > 0 ? (
                      fingerprint.evidencePatterns.map((pattern, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{pattern}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No evidence patterns identified</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(fingerprint.updatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Upload some essays to generate your writing fingerprint
                </p>
                <Link href="/upload">
                  <Button>Upload Essay</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
