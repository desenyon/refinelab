'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { FileText, TrendingUp, Target, BarChart3, Upload } from 'lucide-react'

interface Essay {
  id: string
  title: string
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
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

  const recentEssays = essays.slice(0, 3)
  
  const growthData = essays.slice(-5).map((essay, index) => ({
    name: `Essay ${index + 1}`,
    clarity: essay.thesisClarity ? Math.round(essay.thesisClarity * 100) : 0,
    depth: essay.argumentDepth ? Math.round(essay.argumentDepth * 100) : 0,
    structure: essay.structureBalance ? Math.round(essay.structureBalance * 100) : 0,
  }))

  const latestEssay = essays[0]
  const radarData = latestEssay ? [
    { skill: 'Thesis Clarity', value: Math.round((latestEssay.thesisClarity || 0) * 100) },
    { skill: 'Argument Depth', value: Math.round((latestEssay.argumentDepth || 0) * 100) },
    { skill: 'Structure', value: Math.round((latestEssay.structureBalance || 0) * 100) },
  ] : []

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card p-4">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="default" className="w-full justify-start" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Essay
              </Button>
            </Link>
            <Link href="/essays">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                My Essays
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Compare Drafts
              </Button>
            </Link>
            <Link href="/lessons">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Writing Lessons
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Writing Profile
              </Button>
            </Link>
            <Link href="/dashboard#goals">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Goals
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'Student'}!</h2>
              <p className="text-muted-foreground">
                Track your writing growth and get insights to improve your essays.
              </p>
            </div>

            {/* Academic Integrity Reminder */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Remember: RefineLab provides feedback and strategy, never replacement text.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{essays.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {essays.length > 0 ? 'Keep building your portfolio' : 'Upload your first essay'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Thesis Clarity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {essays.length > 0
                      ? Math.round(
                          (essays.reduce((sum, e) => sum + (e.thesisClarity || 0), 0) /
                            essays.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Across all essays</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {essays.filter(e => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(e.uploadedAt) > weekAgo
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Essays analyzed</p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Chart */}
            {essays.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Writing Growth Over Time</CardTitle>
                  <CardDescription>
                    Track your improvement across key metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="clarity" stroke="#8884d8" name="Thesis Clarity" />
                      <Line type="monotone" dataKey="depth" stroke="#82ca9d" name="Argument Depth" />
                      <Line type="monotone" dataKey="structure" stroke="#ffc658" name="Structure" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Essays */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Essays</CardTitle>
                <CardDescription>
                  Your latest submissions and analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : essays.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No essays yet</p>
                    <Link href="/upload">
                      <Button>Upload Your First Essay</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEssays.map((essay) => (
                      <div
                        key={essay.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/essays/${essay.id}`)}
                      >
                        <div>
                          <h4 className="font-medium">{essay.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(essay.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {essay.thesisClarity && (
                            <Badge variant="secondary">
                              Clarity: {Math.round(essay.thesisClarity * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {essays.length > 3 && (
                      <Link href="/essays">
                        <Button variant="outline" className="w-full">
                          View All Essays
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
