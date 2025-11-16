'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Search, Calendar, TrendingUp, Filter, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface Essay {
  id: string
  title: string
  assignmentName: string | null
  uploadedAt: string
  thesisClarity: number | null
  argumentDepth: number | null
  structureBalance: number | null
}

export default function EssaysClient() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  useEffect(() => {
    fetchEssays()
  }, [])

  const fetchEssays = async () => {
    try {
      const response = await fetch('/api/essays')
      if (response.ok) {
        const data = await response.json()
        setEssays(data.essays || data)
      }
    } catch (error) {
      toast.error('Failed to load essays')
    } finally {
      setLoading(false)
    }
  }

  const filteredEssays = essays.filter(essay =>
    essay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    essay.assignmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedEssays = [...filteredEssays].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      case 'date-asc':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'score':
        const scoreA = (a.thesisClarity || 0) + (a.argumentDepth || 0) + (a.structureBalance || 0)
        const scoreB = (b.thesisClarity || 0) + (b.argumentDepth || 0) + (b.structureBalance || 0)
        return scoreB - scoreA
      default:
        return 0
    }
  })

  const getScoreBadge = (score: number) => {
    const pct = Math.round(score * 100)
    if (pct >= 85) return { variant: 'default' as const, label: `${pct}%` }
    if (pct >= 70) return { variant: 'secondary' as const, label: `${pct}%` }
    return { variant: 'destructive' as const, label: `${pct}%` }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">My Essays</h1>
              <p className="text-muted-foreground mt-1">
                {essays.length} essay{essays.length !== 1 ? 's' : ''} analyzed
              </p>
            </div>
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload Essay
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search essays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="score">Highest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedEssays.length === 0 ? (
            searchQuery ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No essays match your search</p>
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={FileText}
                title="No essays yet"
                description="Upload your first essay to start tracking your writing progress"
                actionLabel="Upload Essay"
                actionHref="/upload"
              />
            )
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedEssays.map((essay) => {
                const avgScore = ((essay.thesisClarity || 0) + (essay.argumentDepth || 0) + (essay.structureBalance || 0)) / 3
                const badge = getScoreBadge(avgScore)
                
                return (
                  <Link key={essay.id} href={`/essays/${essay.id}`}>
                    <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 mt-1">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                                {essay.title}
                              </h3>
                              {essay.assignmentName && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {essay.assignmentName}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant={badge.variant} className="flex-shrink-0">
                            {badge.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(essay.uploadedAt).toLocaleDateString()}
                          </div>
                          {essay.thesisClarity && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Thesis {Math.round(essay.thesisClarity * 100)}%
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
