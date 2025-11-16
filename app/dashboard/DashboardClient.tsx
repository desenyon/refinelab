'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, TrendingUp, Target, Upload, Sparkles, BookOpen, GitCompare, Award } from 'lucide-react'

interface Essay {
  id: string
  title: string
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
  evidenceQuality: number | null
}

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter()
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const recentEssays = essays.slice(0, 4)
  
  const growthData = essays.slice(-6).map((essay, index) => ({
    name: `Essay ${index + 1}`,
    clarity: essay.thesisClarity ? Math.round(essay.thesisClarity * 100) : 0,
    depth: essay.argumentDepth ? Math.round(essay.argumentDepth * 100) : 0,
    structure: essay.structureBalance ? Math.round(essay.structureBalance * 100) : 0,
    evidence: essay.evidenceQuality ? Math.round(essay.evidenceQuality * 100) : 0,
  }))

  const avgClarity = essays.length > 0
    ? Math.round((essays.reduce((sum, e) => sum + (e.thesisClarity || 0), 0) / essays.length) * 100)
    : 0

  const avgDepth = essays.length > 0
    ? Math.round((essays.reduce((sum, e) => sum + (e.argumentDepth || 0), 0) / essays.length) * 100)
    : 0

  const weekEssays = essays.filter(e => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(e.uploadedAt) > weekAgo
  }).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-muted-foreground text-lg">
              Track your writing growth and get insights to improve your essays.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-lift animate-slide-up border-2 transition-all hover:shadow-lg" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Essays</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{essays.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {essays.length > 0 ? 'Keep building your portfolio' : 'Upload your first essay'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift animate-slide-up border-2" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Thesis Clarity</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgClarity}%</div>
                <Progress value={avgClarity} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="hover-lift animate-slide-up border-2" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Argument Depth</CardTitle>
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgDepth}%</div>
                <Progress value={avgDepth} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="hover-lift animate-slide-up border-2" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{weekEssays}</div>
                <p className="text-xs text-muted-foreground mt-1">Essays analyzed</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="animate-slide-up gradient-border hover-lift" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump right into improving your writing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/upload">
                  <Button className="w-full h-auto py-6 flex-col gap-2 hover-lift" size="lg">
                    <Upload className="h-6 w-6" />
                    <span className="font-semibold">Upload Essay</span>
                    <span className="text-xs font-normal opacity-80">Get instant analysis</span>
                  </Button>
                </Link>
                <Link href="/compare">
                  <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover-lift" size="lg">
                    <GitCompare className="h-6 w-6" />
                    <span className="font-semibold">Compare Drafts</span>
                    <span className="text-xs font-normal opacity-80">Track improvements</span>
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 hover-lift" size="lg">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-semibold">Writing Lessons</span>
                    <span className="text-xs font-normal opacity-80">Learn techniques</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          {essays.length > 1 && (
            <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle>Writing Growth Over Time</CardTitle>
                <CardDescription>
                  Track your improvement across key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clarity" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Thesis Clarity" />
                    <Line type="monotone" dataKey="depth" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Argument Depth" />
                    <Line type="monotone" dataKey="structure" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Structure" />
                    <Line type="monotone" dataKey="evidence" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Evidence Quality" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Essays */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Essays</CardTitle>
                  <CardDescription>Your latest submissions and analyses</CardDescription>
                </div>
                {essays.length > 4 && (
                  <Link href="/essays">
                    <Button variant="ghost" size="sm">View All →</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : essays.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-chart-1/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No essays yet</h3>
                  <p className="text-muted-foreground mb-6">Upload your first essay to get started with AI-powered analysis</p>
                  <Link href="/upload">
                    <Button className="pulse-glow">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Your First Essay
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEssays.map((essay) => (
                    <div
                      key={essay.id}
                      className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all hover-lift"
                      onClick={() => router.push(`/essays/${essay.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{essay.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(essay.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {essay.thesisClarity && (
                          <Badge variant="secondary" className="text-xs">
                            Clarity: {Math.round(essay.thesisClarity * 100)}%
                          </Badge>
                        )}
                        {essay.argumentDepth && (
                          <Badge variant="outline" className="text-xs">
                            Depth: {Math.round(essay.argumentDepth * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
