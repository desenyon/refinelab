'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [assignmentName, setAssignmentName] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [extractedComments, setExtractedComments] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileUpload(selectedFile)
    }
  }

  const handleFileUpload = async (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PDF, DOCX, or image file'
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB'
      })
      return
    }

    setFile(selectedFile)
    setLoading(true)
    setError('')
    setUploadProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      setUploadProgress(40)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(80)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process file')
      }

      const data = await response.json()
      setContent(data.text)
      setExtractedComments(data.teacherComments || [])
      setUploadProgress(100)
      
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }

      toast.success('File processed!', {
        description: `${data.text.length} chars${data.teacherComments?.length ? `, ${data.teacherComments.length} comments` : ''}`
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error processing file'
      setError(message)
      toast.error('Upload failed', { description: message })
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Title required')
      return
    }
    
    if (!content.trim()) {
      toast.error('Content required')
      return
    }

    if (content.length < 100) {
      toast.error('Essay too short', {
        description: 'Minimum 100 characters required'
      })
      return
    }

    setAnalyzing(true)
    setError('')

    const toastId = toast.loading('Analyzing essay...', {
      description: 'This takes 10-30 seconds'
    })

    try {
      const response = await fetch('/api/essays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          assignmentName,
          teacherComments: extractedComments,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze')
      }

      const data = await response.json()
      
      toast.success('Analysis complete!', {
        id: toastId,
        description: 'Graded with AP Lang standards'
      })
      
      router.push(`/essays/${data.essay.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      setError(message)
      toast.error('Failed', { id: toastId, description: message })
      setAnalyzing(false)
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(w => w).length
  const paragraphCount = content.split(/\n\n+/).filter(p => p.trim()).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Upload Essay</h1>
            <p className="text-muted-foreground">
              Upload document or paste text for AP Lang-level analysis
            </p>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Academic Integrity:</strong> RefineLab analyzes and provides feedback—never generates replacement text.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upload Document (Optional)</CardTitle>
              <CardDescription>
                PDF, DOCX, or image. Auto-extracts text and teacher comments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className={`flex items-center justify-center w-full ${dragActive ? 'ring-2 ring-primary' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <label
                    htmlFor="file-upload"
                    className={`gradient-border flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      dragActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {loading && uploadProgress < 100 ? (
                        <>
                          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                          <p className="text-sm text-muted-foreground">Processing...</p>
                        </>
                      ) : uploadProgress === 100 ? (
                        <>
                          <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
                          <p className="text-sm font-medium">Processed!</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="mb-2 text-sm">
                            <span className="font-semibold">Click</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, JPG, PNG (max 10MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                </div>

                {file && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {extractedComments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Teacher Comments</CardTitle>
                  <Badge>{extractedComments.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {extractedComments.map((comment, i) => (
                    <div key={i} className="p-3 bg-muted rounded text-sm flex gap-2">
                      <Badge variant="outline" className="flex-shrink-0">{i + 1}</Badge>
                      <p>{comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Essay Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="title"
                      placeholder="Essay title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment">Assignment (Optional)</Label>
                    <Input
                      id="assignment"
                      placeholder="English 101"
                      value={assignmentName}
                      onChange={(e) => setAssignmentName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Essay Content <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="content"
                    placeholder="Paste essay here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={22}
                    required
                    className="font-serif text-[15px] leading-relaxed"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{content.length} chars</span>
                    <div className="flex gap-4">
                      <span>{wordCount} words</span>
                      <span>{paragraphCount} ¶</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                size="lg"
                disabled={analyzing || !title.trim() || !content.trim()}
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Analyze Essay
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/dashboard')}
                disabled={analyzing}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
