import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Star,
  Footprints,
  Calendar,
  Trophy,
  Brain,
  Flame,
  Pencil,
  Moon,
  Sunrise,
  Clock,
  Users,
  CheckCircle,
  Layers,
  Award,
  Crown,
} from "lucide-react"
import { mockBadges } from "@/lib/mock-data"
import Link from "next/link"

const badgeIcons: Record<string, React.ElementType> = {
  footprints: Footprints,
  calendar: Calendar,
  trophy: Trophy,
  brain: Brain,
  flame: Flame,
  pencil: Pencil,
  moon: Moon,
  sunrise: Sunrise,
  clock: Clock,
  users: Users,
  "check-circle": CheckCircle,
  layers: Layers,
  award: Award,
  crown: Crown,
  star: Star,
}

export default function BadgesPage() {
  const earnedBadges = mockBadges.filter((b) => b.earnedAt !== null)
  const unearnedBadges = mockBadges.filter((b) => b.earnedAt === null)

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground">All Badges</h1>
        </div>

        {/* Earned Badges */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Earned ({earnedBadges.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {earnedBadges.map((badge) => {
              const Icon = badgeIcons[badge.icon] || Star
              return (
                <Card key={badge.id} className="border-0 shadow-sm">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Locked Badges */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Locked ({unearnedBadges.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {unearnedBadges.map((badge) => {
              const Icon = badgeIcons[badge.icon] || Star
              return (
                <Card key={badge.id} className="border-0 opacity-50 shadow-sm">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{badge.requirement}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
