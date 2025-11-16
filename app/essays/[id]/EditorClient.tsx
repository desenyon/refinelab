'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Save, RefreshCw, History, Eye, FileText, Lightbulb, 
  Target, BookOpen, Zap, TrendingUp, AlertCircle, CheckCircle2,
  Code, Clock, Hash, Type, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface EditorProps {
  essayId: string
  initialContent: string
  initialTitle: string
}

interface LiveMetrics {
  wordCount: number
  characterCount: number
  paragraphCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  avgSentencesPerParagraph: number
  readingLevel: string
  estimatedReadTime: number
}

interface WritingSuggestion {
  type: 'style' | 'grammar' | 'clarity' | 'structure'
  severity: 'high' | 'medium' | 'low'
  message: string
  position: { start: number; end: number }
  suggestion?: string
}

export default function EditorClient({ essayId, initialContent, initialTitle }: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    wordCount: 0,
    characterCount: 0,
    paragraphCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    avgSentencesPerParagraph: 0,
    readingLevel: 'College',
    estimatedReadTime: 0
  })
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [revisionHistory, setRevisionHistory] = useState<Array<{timestamp: Date, wordCount: number}>>([])

  // Calculate live metrics
  const calculateMetrics = useCallback((text: string): LiveMetrics => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const characterCount = text.length
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const paragraphCount = paragraphs.length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentenceCount = sentences.length

    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const avgSentencesPerParagraph = paragraphCount > 0 ? sentenceCount / paragraphCount : 0
    const estimatedReadTime = Math.ceil(wordCount / 200) // 200 words per minute

    // Simple reading level calculation based on avg words per sentence
    let readingLevel = 'College'
    if (avgWordsPerSentence < 12) readingLevel = 'Middle School'
    else if (avgWordsPerSentence < 18) readingLevel = 'High School'
    else if (avgWordsPerSentence < 25) readingLevel = 'College'
    else readingLevel = 'Graduate'

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10,
      readingLevel,
      estimatedReadTime
    }
  }, [])

  // Detect writing issues
  const detectIssues = useCallback((text: string): WritingSuggestion[] => {
    const issues: WritingSuggestion[] = []
    
    // Check for passive voice (simplified)
    const passivePatterns = /\b(is|are|was|were|been|being)\s+\w+ed\b/gi
    let match
    while ((match = passivePatterns.exec(text)) !== null) {
      if (issues.length < 20) { // Limit to 20 suggestions
        issues.push({
          type: 'style',
          severity: 'low',
          message: 'Consider using active voice for stronger writing',
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Check for weak verbs
    const weakVerbs = /\b(very|really|quite|just|rather|fairly|pretty)\s+/gi
    while ((match = weakVerbs.exec(text)) !== null) {
      if (issues.length < 20) {
        issues.push({
          type: 'style',
          severity: 'medium',
          message: 'Remove qualifier and use a stronger word',
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Check for long sentences (>35 words)
    const sentences = text.split(/[.!?]+/)
    let currentPos = 0
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/)
      if (words.length > 35) {
        issues.push({
          type: 'clarity',
          severity: 'high',
          message: `Long sentence (${words.length} words). Consider breaking it up.`,
          position: { start: currentPos, end: currentPos + sentence.length }
        })
      }
      currentPos += sentence.length + 1
    })

    // Check for paragraph length
    const paragraphs = text.split(/\n\n+/)
    let paraPos = 0
    paragraphs.forEach(para => {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim())
      if (sentences.length > 8) {
        issues.push({
          type: 'structure',
          severity: 'medium',
          message: `Long paragraph (${sentences.length} sentences). Consider splitting.`,
          position: { start: paraPos, end: paraPos + para.length }
        })
      }
      paraPos += para.length + 2
    })

    return issues.slice(0, 20) // Limit to top 20
  }, [])

  // Update metrics when content changes
  useEffect(() => {
    const metrics = calculateMetrics(content)
    setLiveMetrics(metrics)
    
    // Debounce suggestions
    const timer = setTimeout(() => {
      const issues = detectIssues(content)
      setSuggestions(issues)
    }, 1000)

    return () => clearTimeout(timer)
  }, [content, calculateMetrics, detectIssues])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timer = setTimeout(() => {
      handleSave(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [content, title, hasUnsavedChanges])

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/essays/${essayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (response.ok) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        setRevisionHistory(prev => [...prev, { timestamp: new Date(), wordCount: liveMetrics.wordCount }])
        if (!isAutoSave) {
          toast.success('Essay saved successfully!')
        }
      } else {
        toast.error('Failed to save essay')
      }
    } catch (error) {
      toast.error('Error saving essay')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(true)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setHasUnsavedChanges(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-950'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'style': return Sparkles
      case 'grammar': return CheckCircle2
      case 'clarity': return Eye
      case 'structure': return FileText
      default: return AlertCircle
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Main Editor Area */}
      <div className="flex-1 space-y-4">
        {/* Title Editor */}
        <Card>
          <CardContent className="pt-6">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none focus:ring-0"
              placeholder="Essay Title..."
            />
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Essay Content</CardTitle>
              <CardDescription>
                {hasUnsavedChanges && (
                  <span className="text-yellow-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    Unsaved changes
                  </span>
                )}
                {lastSaved && !hasUnsavedChanges && (
                  <span className="text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Last saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSave()}
                disabled={isSaving || !hasUnsavedChanges}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-[600px] p-4 font-serif text-base leading-relaxed bg-background border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Start writing your essay here..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Live Metrics & Suggestions */}
      <div className="lg:w-96 space-y-4">
        {/* Live Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Live Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Words</span>
                </div>
                <div className="text-2xl font-bold">{liveMetrics.wordCount}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Paragraphs</span>
                </div>
                <div className="text-2xl font-bold">{liveMetrics.paragraphCount}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sentences</span>
                </div>
                <div className="text-2xl font-bold">{liveMetrics.sentenceCount}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Read Time</span>
                </div>
                <div className="text-2xl font-bold">{liveMetrics.estimatedReadTime}m</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Words/Sentence</span>
                <span className="font-medium">{liveMetrics.avgWordsPerSentence}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Sentences/Paragraph</span>
                <span className="font-medium">{liveMetrics.avgSentencesPerParagraph}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reading Level</span>
                <Badge variant="secondary">{liveMetrics.readingLevel}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Writing Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Suggestions
              </div>
              <Badge variant="outline">{suggestions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                Looking good! No issues detected.
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {suggestions.map((suggestion, idx) => {
                  const Icon = getTypeIcon(suggestion.type)
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSuggestion === idx ? 'ring-2 ring-blue-500' : ''
                      } ${getSeverityColor(suggestion.severity)}`}
                      onClick={() => setSelectedSuggestion(idx)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{suggestion.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revision History */}
        {revisionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Recent Saves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {revisionHistory.slice(-5).reverse().map((revision, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                    <span className="text-muted-foreground">
                      {revision.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge variant="outline">{revision.wordCount} words</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
