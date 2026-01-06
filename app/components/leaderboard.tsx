"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry, UserRankInfo, Tier } from "@/lib/types"
import {
  mockLeaderboardWeekly,
  mockLeaderboardMonthly,
  mockLeaderboardAllTime,
  mockUserRankInfo,
} from "@/lib/mock-data"

const tierIcons: Record<Tier, string> = {
  NOVICE: "🌱",
  APPRENTICE: "💫",
  PRACTITIONER: "💪",
  EXPERT: "⚡",
  MASTER: "🏆",
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

function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry
  rank: number
}) {
  const isTop3 = rank <= 3
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null

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
      <div className="text-xl">{tierIcons[entry.tier]}</div>

      {/* User Info */}
      <div className="flex flex-1 flex-col">
        <span className={cn("font-medium leading-tight", entry.isCurrentUser && "text-primary")}>
          {entry.username}
          {entry.isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
        </span>
        <span className="text-xs text-muted-foreground">Lv. {entry.level}</span>
      </div>

      {/* Total Reps */}
      <div className="text-right font-bold tabular-nums">{entry.totalReps.toLocaleString()}</div>
    </div>
  )
}

function UserRankCard({
  rankInfo,
  onToggleAnonymous,
}: {
  rankInfo: UserRankInfo
  onToggleAnonymous: (checked: boolean) => void
}) {
  return (
    <Card className="border-t shadow-lg">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-xl font-bold">
              #{rankInfo.rank}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                of {rankInfo.totalUsers.toLocaleString()} users
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary">
              {rankInfo.repsToNextRank} reps to #{rankInfo.rank - 1}
            </p>
            <p className="text-xs text-muted-foreground">🎯 Keep going!</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Label htmlFor="anonymous-mode" className="text-sm text-muted-foreground">
            Show as Anonymous User
          </Label>
          <Switch id="anonymous-mode" checked={rankInfo.anonymousMode} onCheckedChange={onToggleAnonymous} />
        </div>
      </CardContent>
    </Card>
  )
}

type TimeFrame = "weekly" | "monthly" | "all-time"

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly")
  const [isLoading, setIsLoading] = useState(false)
  const [userRankInfo, setUserRankInfo] = useState<UserRankInfo>(mockUserRankInfo)

  const leaderboardData: Record<TimeFrame, LeaderboardEntry[]> = {
    weekly: mockLeaderboardWeekly,
    monthly: mockLeaderboardMonthly,
    "all-time": mockLeaderboardAllTime,
  }

  const currentData = leaderboardData[timeFrame]

  const handleTabChange = (value: string) => {
    setIsLoading(true)
    setTimeFrame(value as TimeFrame)
    // Simulate loading for real-time query
    setTimeout(() => setIsLoading(false), 300)
  }

  const handleToggleAnonymous = (checked: boolean) => {
    setUserRankInfo((prev) => ({ ...prev, anonymousMode: checked }))
  }

  // Find current user's rank in current data
  const currentUserIndex = currentData.findIndex((e) => e.isCurrentUser)
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : userRankInfo.rank

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
            <TabsTrigger value="all-time" className="flex-1">
              All-Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-48">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="flex flex-col gap-1">
            {currentData.map((entry, index) => (
              <LeaderboardRow key={entry.userId} entry={entry} rank={index + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky User Rank Card */}
      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md px-4">
        <UserRankCard
          rankInfo={{
            ...userRankInfo,
            rank: currentUserRank,
          }}
          onToggleAnonymous={handleToggleAnonymous}
        />
      </div>
    </div>
  )
}
