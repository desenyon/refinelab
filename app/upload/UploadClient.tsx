'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Loader2 } from 'lucide-react'

export default function UploadClient() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [assignmentName, setAssignmentName] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [extractedComments, setExtractedComments] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setLoading(true)
    setError('')
    setUploadProgress(30)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to process file')
        return
      }

      const data = await response.json()
      setContent(data.text)
      setExtractedComments(data.teacherComments || [])
      setUploadProgress(100)
      
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    } catch (err) {
      setError('Error processing file. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !content) {
      setError('Title and content are required')
      return
    }

    setLoading(true)
    setError('')

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
        setError(data.error || 'Failed to analyze essay')
        return
      }

      const data = await response.json()
      router.push(`/essays/${data.essay.id}`)
    } catch (err) {
      setError('Error submitting essay. Please try again.')
    } finally {
      setLoading(false)
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
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Upload Essay</h2>
            <p className="text-muted-foreground">
              Upload a document or paste your essay text for analysis
            </p>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong>🛡️ Academic Integrity:</strong> RefineLab will analyze your essay and provide 
                feedback on structure, clarity, and argumentation—but will never generate replacement text 
                you can paste into your work.
              </p>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upload Document (Optional)</CardTitle>
              <CardDescription>
                Upload a PDF, DOCX, or image file. We'll extract text and any teacher comments automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {loading && uploadProgress < 100 ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, or image files</p>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} />
                )}
              </div>
            </CardContent>
          </Card>

          {extractedComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Teacher Comments</CardTitle>
                  <CardDescription>
                    We found these comments in your document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {extractedComments.map((comment, index) => (
                      <li key={index} className="text-sm p-2 bg-muted rounded">
                        {comment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Essay Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Essay Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Analysis of Romeo and Juliet"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment">Assignment Name (Optional)</Label>
                    <Input
                      id="assignment"
                      placeholder="e.g., English 101 - Literary Analysis"
                      value={assignmentName}
                      onChange={(e) => setAssignmentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Essay Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste or type your essay here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={15}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {content.length} characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Essay'
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }
