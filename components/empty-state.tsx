import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {(actionLabel && (actionHref || actionOnClick)) && (
          actionHref ? (
            <Link href={actionHref}>
              <Button size="lg">{actionLabel}</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={actionOnClick}>{actionLabel}</Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
