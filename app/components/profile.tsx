"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Flame,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  Pencil,
  LogOut,
  Star,
  Footprints,
  Calendar,
  Trophy,
  Brain,
  Moon,
  Sunrise,
  Clock,
  Users,
  CheckCircle,
  Layers,
  Award,
  Crown,
} from "lucide-react"
import type { User, Badge, UserSettings, UserStats, PracticeDay } from "@/lib/types"
import { TierCard } from "./tier-card"
import { PracticeHeatmap } from "./practice-heatmap"
import { cn } from "@/lib/utils"
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

interface ProfileProps {
  user: User
  stats: UserStats
  badges: Badge[]
  settings: UserSettings
  isPro?: boolean
  practiceData?: PracticeDay[]
}

export function Profile({ user, stats, badges, settings, isPro = false, practiceData = [] }: ProfileProps) {
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled)
  const [practiceGoal, setPracticeGoal] = useState(settings.dailyPracticeGoal)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [tempGoal, setTempGoal] = useState(practiceGoal)

  const earnedBadges = badges.filter((b) => b.earnedAt !== null)

  const handleSaveGoal = () => {
    setPracticeGoal(tempGoal)
    setGoalModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src="/friendly-avatar.jpg" alt={user.name} />
            <AvatarFallback className="text-lg font-semibold">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm font-medium">{`${user.tier} - Level ${user.level}`}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Pencil className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{user.currentStreak} days</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{user.totalXP.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalPractices}</p>
              <p className="text-xs text-muted-foreground">Total Practices</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalReps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Reps</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Card (Compact) */}
      <TierCard level={user.level} totalXP={user.totalXP} currentStreak={user.currentStreak} compact />

      {/* Practice Heatmap */}
      {practiceData.length > 0 && (
        <PracticeHeatmap practiceData={practiceData} onDateClick={(date) => console.log("Clicked date:", date)} />
      )}

      {/* Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Badges ({earnedBadges.length}/{badges.length})
          </h2>
          <Link href="/profile/badges" className="text-sm font-medium text-primary hover:underline">
            View All Badges
          </Link>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.icon] || Star
              const isEarned = badge.earnedAt !== null
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                    isEarned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-40",
                  )}
                  title={badge.name}
                >
                  <Icon className="h-6 w-6" />
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Settings Section */}
      <div className="space-y-1">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Settings</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="divide-y divide-border p-0">
            {/* Daily Reminder */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Daily reminder</p>
                {reminderEnabled && <p className="text-sm text-muted-foreground">{settings.reminderTime}</p>}
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>
            {/* Practice Goal */}
            <button
              onClick={() => {
                setTempGoal(practiceGoal)
                setGoalModalOpen(true)
              }}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-foreground">Practice goal</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{practiceGoal} per day</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
            {/* Privacy Settings */}
            <Link
              href="/profile/privacy"
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <p className="font-medium text-foreground">Privacy settings</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            {/* Account Settings */}
            <button className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Account settings</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Card (Free Users) */}
      {!isPro && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Upgrade to Pro</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Unlimited affirmations</li>
                  <li>Advanced analytics</li>
                  <li>Priority AI generation</li>
                  <li>Remove ads</li>
                </ul>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/upgrade">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <Button variant="destructive" className="w-full">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>

      {/* Practice Goal Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily Practice Goal</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-6 py-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTempGoal(Math.max(1, tempGoal - 1))}
              disabled={tempGoal <= 1}
            >
              -
            </Button>
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{tempGoal}</p>
              <p className="text-sm text-muted-foreground">practices per day</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTempGoal(Math.min(10, tempGoal + 1))}
              disabled={tempGoal >= 10}
            >
              +
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoal}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
