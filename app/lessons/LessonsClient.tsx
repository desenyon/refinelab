'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, CheckCircle2, Lightbulb } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  category: string
  principles: string[]
  strategies: string[]
  checklistItems: string[]
}

export default function LessonsClient() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
        if (data.length > 0) {
          setSelectedLesson(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Thesis', 'Analysis', 'Structure', 'Evidence', 'Coherence', 'Style']

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
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Writing Lessons</h2>
            <p className="text-muted-foreground">
              Learn writing principles and strategies to strengthen your essays
            </p>
          </div>

          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              These lessons teach general writing principles. They provide conceptual understanding, 
              not specific text for your essays.
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lesson List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Available Lessons</CardTitle>
                  <CardDescription>Select a lesson to learn more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading lessons...</p>
                  ) : (
                    lessons.map((lesson) => (
                      <Button
                        key={lesson.id}
                        variant={selectedLesson?.id === lesson.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        size="sm"
                        onClick={() => setSelectedLesson(lesson)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Badge variant="outline" className="text-xs">
                            {lesson.category}
                          </Badge>
                          <span className="text-xs truncate flex-1 text-left">
                            {lesson.title}
                          </span>
                        </div>
                      </Button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Filter by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="cursor-pointer">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lesson Content */}
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <Tabs defaultValue="principles">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="principles">Principles</TabsTrigger>
                    <TabsTrigger value="strategies">Strategies</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  </TabsList>

                  <TabsContent value="principles" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <Badge className="w-fit mb-2">{selectedLesson.category}</Badge>
                        <CardTitle>{selectedLesson.title}</CardTitle>
                        <CardDescription>
                          Key concepts to understand
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedLesson.principles.map((principle, index) => (
                            <li key={index} className="flex gap-3">
                              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>{principle}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="strategies" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>How to Apply This Skill</CardTitle>
                        <CardDescription>
                          Practical strategies for your writing
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-3">
                          {selectedLesson.strategies.map((strategy, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                                {index + 1}
                              </span>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="checklist" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Self-Assessment Checklist</CardTitle>
                        <CardDescription>
                          Use these questions to evaluate your essay
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedLesson.checklistItems.map((item, index) => (
                            <li key={index} className="flex gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Alert>
                      <AlertDescription>
                        <strong>Tip:</strong> Review these questions as you revise your essay. 
                        If you answer "no" to any question, that's an area to focus on improving.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a lesson to begin learning
                    </p>
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
