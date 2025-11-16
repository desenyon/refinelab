import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-2xl font-bold">RefineLab</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-5xl font-bold tracking-tight">
              Your Writing Growth Engine
            </h2>
            <p className="text-xl text-muted-foreground">
              RefineLab analyzes your essays, teaches skills, tracks growth over time, 
              and helps you understand grading patterns—all while maintaining strict academic integrity.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8">
                  Start Analyzing Essays
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Academic Integrity Notice */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border-2 border-primary/20 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-3xl">🛡️</span>
                  Academic Integrity Protected
                </h3>
                <p className="text-muted-foreground mb-4">
                  <strong>RefineLab never generates content you can paste into your essay.</strong> We provide feedback, 
                  insights, metrics, and strategic guidance—not rewrites, paraphrases, or replacement text.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Analyzes structure and identifies weaknesses</li>
                  <li>✓ Explains WHY something needs improvement</li>
                  <li>✓ Teaches writing principles conceptually</li>
                  <li>✗ Does NOT write thesis statements or paragraphs</li>
                  <li>✗ Does NOT rewrite or paraphrase your text</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="border rounded-lg p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Improve Your Writing?</h3>
            <p className="text-lg mb-8 opacity-90">
              Join students who are taking control of their writing growth.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 RefineLab. Built with academic integrity at its core.</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: '📊',
    title: 'Structure Mapper',
    description: 'Visualize essay structure with paragraph-level analysis showing weaknesses in thesis, arguments, and transitions.'
  },
  {
    icon: '📚',
    title: 'Writing Lessons',
    description: 'Access adaptive lessons linked to your specific weaknesses, teaching principles not providing answers.'
  },
  {
    icon: '📈',
    title: 'Growth Dashboard',
    description: 'Track metrics over time across all essays with charts showing improvement in clarity, depth, and structure.'
  },
  {
    icon: '🔄',
    title: 'Draft Comparison',
    description: 'Compare essay versions to see metric improvements without showing text-level diffs.'
  },
  {
    icon: '🎯',
    title: 'Grading Patterns',
    description: 'Analyze past grades to identify where you typically lose points and focus improvement efforts.'
  },
  {
    icon: '✨',
    title: 'Writing Fingerprint',
    description: 'Understand your unique writing style, tendencies, and habits across all your work.'
  },
  {
    icon: '🎓',
    title: 'Goal Tracking',
    description: 'Set improvement goals for each assignment and track progress with actionable metrics.'
  },
  {
    icon: '🔮',
    title: 'Grade Prediction',
    description: 'Get probabilistic grade estimates based on your essay metrics and historical grading patterns.'
  },
  {
    icon: '📝',
    title: 'Document Upload',
    description: 'Upload PDFs, DOCX files, or images with OCR to extract text and teacher comments automatically.'
  }
]
