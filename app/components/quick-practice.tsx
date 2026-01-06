import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Affirmation } from "@/lib/types"
import Link from "next/link"

interface QuickPracticeProps {
  affirmations: Affirmation[]
}

function formatLastPracticed(date: Date | null): string {
  if (!date) return "Never practiced"
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function QuickPractice({ affirmations }: QuickPracticeProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Quick Practice</CardTitle>
        <Link href="/library" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {affirmations.map((affirmation) => (
          <div key={affirmation.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{affirmation.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {affirmation.timesPracticed}x practiced · {formatLastPracticed(affirmation.lastPracticedAt)}
              </p>
            </div>
            <Button asChild size="sm" variant="ghost" className="shrink-0 text-primary hover:text-primary">
              <Link href={`/practice/${affirmation.id}`}>
                Practice
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
