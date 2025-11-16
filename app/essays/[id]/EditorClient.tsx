'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Save, RefreshCw, History, Eye, FileText, Lightbulb, 
  Target, BookOpen, Zap, TrendingUp, AlertCircle, CheckCircle2,
  Code, Clock, Hash, Type, Sparkles, ArrowLeft, X
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
  uniqueWords: number
  vocabularyDiversity: number
  transitionWords: number
  academicTone: number
}

interface WritingSuggestion {
  type: 'style' | 'grammar' | 'clarity' | 'structure'
  severity: 'high' | 'medium' | 'low'
  message: string
  position: { start: number; end: number }
  suggestion?: string
}

export default function EditorClient({ essayId, initialContent, initialTitle }: EditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [wordGoal, setWordGoal] = useState(500)
  const [focusMode, setFocusMode] = useState(false)
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    wordCount: 0,
    characterCount: 0,
    paragraphCount: 0,
    sentenceCount: 0,
    avgWordsPerSentence: 0,
    avgSentencesPerParagraph: 0,
    readingLevel: 'College',
    estimatedReadTime: 0,
    uniqueWords: 0,
    vocabularyDiversity: 0,
    transitionWords: 0,
    academicTone: 0
  })
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [revisionHistory, setRevisionHistory] = useState<Array<{timestamp: Date, wordCount: number}>>([])
  const [showTips, setShowTips] = useState(true)
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasUnsavedChanges) handleSave()
      }
      // Cmd/Ctrl + Shift + F for focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setFocusMode(!focusMode)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [hasUnsavedChanges, focusMode])
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

    // Calculate vocabulary diversity
    const uniqueWordsSet = new Set(words.map(w => w.toLowerCase()))
    const uniqueWords = uniqueWordsSet.size
    const vocabularyDiversity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0

    // Count transition words
    const transitionWordsList = [
      'however', 'therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless',
      'additionally', 'similarly', 'conversely', 'specifically', 'ultimately', 'meanwhile',
      'indeed', 'thus', 'hence', 'nonetheless', 'likewise', 'accordingly'
    ]
    const transitionWords = words.filter(w => 
      transitionWordsList.includes(w.toLowerCase())
    ).length

    // Calculate academic tone (simplified)
    const academicWords = words.filter(w => w.length > 8).length
    const academicTone = wordCount > 0 ? Math.round((academicWords / wordCount) * 100) : 0

    return {
      wordCount,
      characterCount,
      paragraphCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10,
      readingLevel,
      estimatedReadTime,
      uniqueWords,
      vocabularyDiversity,
      transitionWords,
      academicTone
    }
  }, [])

  // Detect writing issues
  const detectIssues = useCallback((text: string): WritingSuggestion[] => {
    const issues: WritingSuggestion[] = []
    
    // Check for passive voice
    const passivePatterns = /\b(is|are|was|were|been|being)\s+\w+ed\b/gi
    let match
    while ((match = passivePatterns.exec(text)) !== null) {
      if (issues.length < 30) {
        issues.push({
          type: 'style',
          severity: 'low',
          message: 'Consider using active voice for stronger writing',
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Check for weak qualifiers
    const weakVerbs = /\b(very|really|quite|just|rather|fairly|pretty)\s+/gi
    while ((match = weakVerbs.exec(text)) !== null) {
      if (issues.length < 30) {
        issues.push({
          type: 'style',
          severity: 'medium',
          message: 'Remove qualifier and use a stronger word',
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    }

    // Check for repetitive words
    const words = text.toLowerCase().split(/\s+/)
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      if (word.length > 5) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })
    Object.entries(wordFreq).forEach(([word, count]) => {
      if (count > 5 && issues.length < 30) {
        issues.push({
          type: 'style',
          severity: 'medium',
          message: `"${word}" appears ${count} times. Consider using synonyms.`,
          position: { start: 0, end: 0 }
        })
      }
    })

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
      } else if (sentences.length === 1 && para.trim().split(/\s+/).length > 10) {
        issues.push({
          type: 'structure',
          severity: 'low',
          message: 'Single-sentence paragraph. Add supporting sentences or merge with another paragraph.',
          position: { start: paraPos, end: paraPos + para.length }
        })
      }
      paraPos += para.length + 2
    })

    // Check for missing transitions between paragraphs
    paragraphs.forEach((para, idx) => {
      if (idx > 0 && para.trim()) {
        const firstSentence = para.split(/[.!?]+/)[0]
        const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'similarly', 'consequently']
        const hasTransition = transitionWords.some(word => 
          firstSentence.toLowerCase().includes(word)
        )
        if (!hasTransition && issues.length < 30) {
          issues.push({
            type: 'structure',
            severity: 'low',
            message: 'Consider adding a transition word to connect with the previous paragraph.',
            position: { start: 0, end: 0 }
          })
        }
      }
    })

    // Check for clichés and wordy phrases
    const cliches = [
      { phrase: /at the end of the day/gi, replacement: 'ultimately' },
      { phrase: /in order to/gi, replacement: 'to' },
      { phrase: /due to the fact that/gi, replacement: 'because' },
      { phrase: /in spite of the fact that/gi, replacement: 'although' },
      { phrase: /at this point in time/gi, replacement: 'now' }
    ]
    cliches.forEach(({ phrase, replacement }) => {
      while ((match = phrase.exec(text)) !== null) {
        if (issues.length < 30) {
          issues.push({
            type: 'style',
            severity: 'medium',
            message: `Replace "${match[0]}" with "${replacement}"`,
            position: { start: match.index, end: match.index + match[0].length },
            suggestion: replacement
          })
        }
      }
    })

    return issues.slice(0, 30)
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
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Top Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none focus:ring-0 min-w-[300px]"
              placeholder="Essay Title..."
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Unsaved
              </span>
            )}
            {lastSaved && !hasUnsavedChanges && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              onClick={() => setFocusMode(!focusMode)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {focusMode ? 'Show Sidebar' : 'Focus'}
            </Button>
            
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
        </div>

        {/* Writing Goal Progress Bar */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium">Goal:</span>
              <input
                type="number"
                value={wordGoal}
                onChange={(e) => setWordGoal(Number(e.target.value))}
                className="w-16 px-1.5 py-0.5 text-xs border rounded"
                min="100"
                step="100"
              />
              <span className="text-xs text-muted-foreground">words</span>
            </div>
            <span className="text-xs font-medium">
              {liveMetrics.wordCount} / {wordGoal} 
              <span className="text-muted-foreground ml-1">
                ({Math.round((liveMetrics.wordCount / wordGoal) * 100)}%)
              </span>
            </span>
          </div>
          <Progress 
            value={(liveMetrics.wordCount / wordGoal) * 100} 
            className="h-1.5"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`flex-1 flex flex-col transition-all duration-300`}>
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full min-h-[calc(100vh-240px)] p-8 font-serif text-lg leading-relaxed bg-background/50 border-2 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="Start writing your essay here...

Use ⌘/Ctrl + S to save
Use ⌘/Ctrl + Shift + F to toggle focus mode"
                style={{
                  lineHeight: '1.8',
                  letterSpacing: '0.01em'
                }}
              />
            </div>
          </div>

          {/* Bottom Stats Bar */}
          <div className="border-t bg-muted/30 px-6 py-2">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  {liveMetrics.wordCount} words
                </span>
                <span className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5" />
                  {liveMetrics.sentenceCount} sentences
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {liveMetrics.paragraphCount} paragraphs
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {liveMetrics.estimatedReadTime}min read
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-xs">
                  {liveMetrics.readingLevel}
                </Badge>
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  {suggestions.length} suggestions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Live Metrics & Suggestions */}
        {!focusMode && (
          <div className="w-[380px] border-l bg-muted/5 overflow-y-auto">
            <div className="p-4 space-y-4">
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

            <Separator />

            {/* Advanced Vocabulary Metrics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Vocabulary Analysis
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Unique Words</span>
                  <span className="font-medium">{liveMetrics.uniqueWords}</span>
                </div>
                <Progress value={Math.min(liveMetrics.vocabularyDiversity, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Diversity: {liveMetrics.vocabularyDiversity}%
                  {liveMetrics.vocabularyDiversity < 40 && ' - Try using more varied vocabulary'}
                  {liveMetrics.vocabularyDiversity >= 40 && liveMetrics.vocabularyDiversity < 60 && ' - Good variety'}
                  {liveMetrics.vocabularyDiversity >= 60 && ' - Excellent diversity'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Transition Words</span>
                  <Badge variant={liveMetrics.transitionWords >= 5 ? 'default' : 'secondary'}>
                    {liveMetrics.transitionWords}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {liveMetrics.transitionWords < 3 && 'Add more transitions to improve flow'}
                  {liveMetrics.transitionWords >= 3 && liveMetrics.transitionWords < 8 && 'Good use of transitions'}
                  {liveMetrics.transitionWords >= 8 && 'Excellent transition usage'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Academic Tone</span>
                  <span className="font-medium">{liveMetrics.academicTone}%</span>
                </div>
                <Progress value={Math.min(liveMetrics.academicTone * 2, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {liveMetrics.academicTone < 15 && 'Use more sophisticated vocabulary'}
                  {liveMetrics.academicTone >= 15 && liveMetrics.academicTone < 25 && 'Good academic tone'}
                  {liveMetrics.academicTone >= 25 && 'Strong academic voice'}
                </p>
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
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      {focusMode && (
        <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur border rounded-lg p-4 shadow-lg z-10">
          <p className="text-sm font-semibold mb-2">Keyboard Shortcuts</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between gap-4">
              <span>Save:</span>
              <kbd className="px-2 py-0.5 bg-muted rounded">⌘/Ctrl + S</kbd>
            </div>
            <div className="flex justify-between gap-4">
              <span>Focus Mode:</span>
              <kbd className="px-2 py-0.5 bg-muted rounded">⌘/Ctrl + Shift + F</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Tips */}
      {showTips && liveMetrics.wordCount < 10 && (
        <div className="fixed top-20 right-4 bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-lg p-6 shadow-2xl max-w-md animate-in slide-in-from-top z-10">
          <button
            onClick={() => setShowTips(false)}
            className="absolute top-2 right-2 text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Welcome to the Live Editor!
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Real-time metrics track your writing as you type</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Get instant suggestions to improve your writing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Auto-saves every 30 seconds or press ⌘/Ctrl + S</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Focus Mode hides the sidebar for distraction-free writing</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
