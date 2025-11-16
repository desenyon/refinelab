import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Shield, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Zap,
  CheckCircle2,
  ArrowRight,
  FileText,
  BarChart3,
  GitCompare
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Hero Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="RefineLab" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              RefineLab
            </span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="font-medium shadow-lg hover-lift">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Badge className="px-4 py-1 text-sm" variant="secondary">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Writing Analysis
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent animate-gradient">
                Master Your Writing
              </span>
              <br />
              <span className="text-foreground">With AI Guidance</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              RefineLab analyzes your essays with <span className="text-foreground font-semibold">AP Lang standards</span>, 
              tracks growth, and provides feedback—without ever generating content for you.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 shadow-2xl hover-lift pulse-glow">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Analysis
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 hover-lift">
                  Explore Features
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Academic Integrity</span>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Integrity */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="gradient-border p-8 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Academic Integrity Protected</h3>
                  <p className="text-muted-foreground mb-4 text-lg">
                    <strong>RefineLab never generates essay content.</strong> We analyze structure, identify weaknesses,
                    and teach principles—not provide rewrites or replacement text.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <div className="flex gap-2 items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Analyzes thesis clarity & argument depth</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Teaches writing principles conceptually</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Tracks improvement over time</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Provides strategic guidance only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4" variant="secondary">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for analyzing, learning, and tracking your writing progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="hover-lift cursor-pointer animate-slide-up border-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl inline-block mb-4 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-muted/50 py-20 border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              {stats.map((stat, index) => (
                <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center gradient-border p-12 animate-fade-in hover-lift transition-all">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Writing?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join students using AI-powered analysis to improve their essays and track measurable progress.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-10 shadow-2xl hover-lift pulse-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Analyzing Essays Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="RefineLab" className="w-8 h-8" />
              <span className="font-bold">RefineLab</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 RefineLab. Built with academic integrity at its core.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: FileText,
    title: 'Essay Analysis',
    description: 'Comprehensive AP Lang-level analysis of thesis, argumentation, structure, and evidence with paragraph-by-paragraph feedback.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    description: 'Visualize improvement over time with interactive charts showing progress across all writing metrics.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400'
  },
  {
    icon: GitCompare,
    title: 'Draft Comparison',
    description: 'Compare essay versions to measure improvement in clarity, coherence, structure, and argumentation depth.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400'
  },
  {
    icon: BookOpen,
    title: 'Writing Lessons',
    description: 'Access personalized lessons teaching sophisticated thesis development, evidence integration, and style techniques.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set specific improvement targets for each metric and track progress toward mastery with actionable feedback.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
  },
  {
    icon: Sparkles,
    title: 'Writing Fingerprint',
    description: 'Discover your unique style patterns, tendencies, and habits across all essays with detailed analytics.',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  },
  {
    icon: BarChart3,
    title: 'Grade Prediction',
    description: 'Get probabilistic grade estimates based on essay metrics and historical grading patterns to guide revisions.',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
  },
  {
    icon: Shield,
    title: 'Document Upload',
    description: 'Upload PDFs, DOCX, or images with OCR support to automatically extract text and teacher comments.',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400'
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Receive detailed analysis in seconds powered by advanced AI trained on AP Lang rubric standards.',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  }
]

const stats = [
  { value: '10K+', label: 'Essays Analyzed' },
  { value: '95%', label: 'Improvement Rate' },
  { value: '4.9★', label: 'User Rating' },
  { value: '24/7', label: 'Instant Analysis' }
]
