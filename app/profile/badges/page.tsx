"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BADGE_TYPES } from "@/convex/lib/badgeTypes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function BadgesPage() {
  const badges = useQuery(api.queries.getBadges)

  if (badges === undefined) {
    return (
      <main className="min-h-screen bg-background pb-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  const earnedBadgeIds = new Set(badges?.map((b) => b.badgeType) || [])
  const allBadgeTypes = Object.values(BADGE_TYPES)

  const earnedBadges = allBadgeTypes.filter((b) => earnedBadgeIds.has(b.id))
  const unearnedBadges = allBadgeTypes.filter((b) => !earnedBadgeIds.has(b.id))

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
          {earnedBadges.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No badges earned yet. Keep practicing!</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <Card key={badge.id} className="border-0 shadow-sm">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl">
                      {badge.icon}
                    </div>
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Locked Badges */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Locked ({unearnedBadges.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {unearnedBadges.map((badge) => (
              <Card key={badge.id} className="border-0 opacity-50 shadow-sm">
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground text-2xl">
                    {badge.icon}
                  </div>
                  <p className="text-sm font-medium text-foreground">{badge.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
