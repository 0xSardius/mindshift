"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Profile } from "@/components/profile"
import { BottomNav } from "@/components/bottom-nav"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const user = useQuery(api.queries.getCurrentUser)
  const stats = useQuery(api.queries.getUserStats)
  const badges = useQuery(api.queries.getBadges)
  const practiceHistory = useQuery(api.queries.getPracticeHistory, { days: 730 }) // 2 years of data
  const patterns = useQuery(api.queries.getUserPatterns)

  const isLoading = user === undefined || stats === undefined || badges === undefined

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!user || !stats) {
    return (
      <main className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your profile</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 pt-6">
        <Profile
          user={user}
          stats={stats}
          badges={badges || []}
          practiceData={practiceHistory || []}
          patterns={patterns}
        />
      </div>
      <BottomNav />
    </main>
  )
}
