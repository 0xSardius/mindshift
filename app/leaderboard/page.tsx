import { Leaderboard } from "@/components/leaderboard"
import { BottomNav } from "@/components/bottom-nav"

export default function LeaderboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background pb-16">
      <Leaderboard />
      <BottomNav />
    </main>
  )
}
