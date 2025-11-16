'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, TrendingUp, Trash2, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Essay {
  id: string
  title: string
  assignmentName: string | null
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
  analysisToSummaryRatio: number | null
}

export default function EssaysClient() {
  const router = useRouter()
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/essays/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEssays(essays.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Error deleting essay:', error)
    } finally {
      setDeleting(null)
    }
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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">My Essays</h2>
              <p className="text-muted-foreground">
                All your analyzed essays in one place
              </p>
            </div>
            <Link href="/upload">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Upload New Essay
              </Button>
            </Link>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading essays...</p>
              </CardContent>
            </Card>
          ) : essays.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No essays yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first essay to get started with analysis and feedback.
                </p>
                <Link href="/upload">
                  <Button>Upload Essay</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {essays.map((essay) => (
                <Card key={essay.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{essay.title}</CardTitle>
                        {essay.assignmentName && (
                          <CardDescription className="mt-1">
                            {essay.assignmentName}
                          </CardDescription>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          Uploaded {new Date(essay.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/essays/${essay.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(essay.id)}
                          disabled={deleting === essay.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {essay.thesisClarity !== null && (
                        <Badge variant="secondary">
                          Thesis: {Math.round(essay.thesisClarity * 100)}%
                        </Badge>
                      )}
                      {essay.argumentDepth !== null && (
                        <Badge variant="secondary">
                          Depth: {Math.round(essay.argumentDepth * 100)}%
                        </Badge>
                      )}
                      {essay.structureBalance !== null && (
                        <Badge variant="secondary">
                          Structure: {Math.round(essay.structureBalance * 100)}%
                        </Badge>
                      )}
                      {essay.analysisToSummaryRatio !== null && (
                        <Badge variant="secondary">
                          Analysis: {Math.round(essay.analysisToSummaryRatio * 100)}%
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
