"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Tier = "NOVICE" | "APPRENTICE" | "PRACTITIONER" | "EXPERT" | "MASTER"

const tierIcons: Record<Tier, string> = {
  NOVICE: "🌱",
  APPRENTICE: "💫",
  PRACTITIONER: "💪",
  EXPERT: "⚡",
  MASTER: "🏆",
}

function getLevelTier(level: number): Tier {
  if (level <= 10) return "NOVICE"
  if (level <= 20) return "APPRENTICE"
  if (level <= 30) return "PRACTITIONER"
  if (level <= 40) return "EXPERT"
  return "MASTER"
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-card p-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  )
}

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  totalXP: number
  level: number
  currentStreak: number
  isCurrentUser: boolean
  imageUrl: string | null | undefined
}

function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry
  rank: number
}) {
  const isTop3 = rank <= 3
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null
  const tier = getLevelTier(entry.level)

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50",
        entry.isCurrentUser && "bg-primary/10 ring-1 ring-primary/30",
        isTop3 && !entry.isCurrentUser && "bg-amber-50/50 dark:bg-amber-950/20",
      )}
    >
      {/* Rank / Medal */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center text-sm font-semibold",
          isTop3 ? "text-2xl" : "text-muted-foreground",
        )}
      >
        {medal ?? rank}
      </div>

      {/* Tier Icon */}
      <div className="text-xl">{tierIcons[tier]}</div>

      {/* User Info */}
      <div className="flex flex-1 flex-col">
        <span className={cn("font-medium leading-tight", entry.isCurrentUser && "text-primary")}>
          {entry.username}
          {entry.isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
        </span>
        <span className="text-xs text-muted-foreground">Lv. {entry.level}</span>
      </div>

      {/* Total XP */}
      <div className="text-right font-bold tabular-nums">{entry.totalXP.toLocaleString()} XP</div>
    </div>
  )
}

function UserRankCard({
  rank,
  totalUsers,
  xpToNextRank,
  nextRankUsername,
  anonymousMode,
  onToggleAnonymous,
}: {
  rank: number
  totalUsers: number
  xpToNextRank: number
  nextRankUsername: string
  anonymousMode: boolean
  onToggleAnonymous: (checked: boolean) => void
}) {
  return (
    <Card className="border-t shadow-lg">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-xl font-bold">
              #{rank}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                of {totalUsers.toLocaleString()} users
              </span>
            </p>
          </div>
          {rank > 1 && (
            <div className="text-right">
              <p className="text-sm font-medium text-primary">
                {xpToNextRank} XP to #{rank - 1}
              </p>
              <p className="text-xs text-muted-foreground">🎯 Keep going!</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Label htmlFor="anonymous-mode" className="text-sm text-muted-foreground">
            Show as Anonymous User
          </Label>
          <Switch id="anonymous-mode" checked={anonymousMode} onCheckedChange={onToggleAnonymous} />
        </div>
      </CardContent>
    </Card>
  )
}

type TimeFrame = "weekly" | "monthly" | "allTime"

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("allTime")

  const leaderboard = useQuery(api.queries.getLeaderboard, { timeframe: timeFrame, limit: 50 })
  const userRankInfo = useQuery(api.queries.getUserRankInfo)
  const currentUser = useQuery(api.queries.getCurrentUser)
  const updateSettings = useMutation(api.mutations.updateUserSettings)

  const handleTabChange = (value: string) => {
    setTimeFrame(value as TimeFrame)
  }

  const handleToggleAnonymous = async (checked: boolean) => {
    try {
      await updateSettings({ anonymousMode: checked })
    } catch (error) {
      console.error("Failed to update anonymous mode:", error)
    }
  }

  const isLoading = leaderboard === undefined || userRankInfo === undefined

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <h1 className="text-xl font-bold">Leaderboard 🏆</h1>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card px-4 py-2">
        <Tabs value={timeFrame} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="allTime" className="flex-1">
              All-Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-48">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="flex flex-col gap-1">
            {leaderboard.map((entry) => (
              <LeaderboardRow key={entry.userId} entry={entry} rank={entry.rank} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-muted-foreground text-lg mb-2">No rankings yet</p>
            <p className="text-muted-foreground text-sm">Start practicing to appear on the leaderboard!</p>
          </div>
        )}
      </div>

      {/* Sticky User Rank Card */}
      {userRankInfo && currentUser && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md px-4">
          <UserRankCard
            rank={userRankInfo.rank}
            totalUsers={userRankInfo.totalUsers}
            xpToNextRank={userRankInfo.xpToNextRank}
            nextRankUsername={userRankInfo.nextRankUsername}
            anonymousMode={currentUser.anonymousMode}
            onToggleAnonymous={handleToggleAnonymous}
          />
        </div>
      )}
    </div>
  )
}
