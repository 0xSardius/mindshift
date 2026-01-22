"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { useTheme } from "next-themes"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Flame,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  Pencil,
  LogOut,
  Star,
  Loader2,
  CreditCard,
  Moon,
  Lock,
} from "lucide-react"
import { toast } from "sonner"
import { TierCard } from "./tier-card"
import { PracticeHeatmap } from "./practice-heatmap"
import { PatternInsights } from "./pattern-insights"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BADGE_TYPES } from "@/convex/lib/badgeTypes"

interface ConvexUser {
  _id: string
  name?: string
  imageUrl?: string
  currentStreak: number
  longestStreak: number
  totalXP: number
  level: number
  tier: "free" | "pro" | "elite"
  dailyPracticeGoal: number
  reminderEnabled: boolean
  reminderTime?: string
  anonymousMode: boolean
}

interface ConvexStats {
  totalPractices: number
  totalRepetitions: number
  totalAffirmations: number
  archivedAffirmations: number
  practicesToday: number
  currentStreak: number
  longestStreak: number
  totalXP: number
  level: number
}

interface ConvexBadge {
  _id: string
  badgeType: string
  earnedAt: number
}

interface PracticeDay {
  date: string
  count: number
}

interface PatternData {
  topDistortions: Array<{
    type: string
    count: number
    percentage: number
  }>
  topThemes: Array<{
    theme: string
    count: number
    percentage: number
  }>
  totalTransformations: number
  isPro: boolean
}

interface ProfileProps {
  user: ConvexUser
  stats: ConvexStats
  badges: ConvexBadge[]
  practiceData?: PracticeDay[]
  patterns?: PatternData | null
}

function getTierName(level: number): string {
  if (level <= 10) return "NOVICE"
  if (level <= 20) return "APPRENTICE"
  if (level <= 30) return "PRACTITIONER"
  if (level <= 40) return "EXPERT"
  return "MASTER"
}

export function Profile({ user, stats, badges, practiceData = [], patterns }: ProfileProps) {
  const { signOut, openUserProfile } = useClerk()
  const { theme, setTheme } = useTheme()
  const updateSettings = useMutation(api.mutations.updateUserSettings)
  const updateProfile = useMutation(api.mutations.updateUserProfile)

  const [reminderEnabled, setReminderEnabled] = useState(user.reminderEnabled)
  const [practiceGoal, setPracticeGoal] = useState(user.dailyPracticeGoal)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [tempGoal, setTempGoal] = useState(practiceGoal)
  const [isSaving, setIsSaving] = useState(false)
  const [isBillingLoading, setIsBillingLoading] = useState(false)
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [tempName, setTempName] = useState(user.name || "")
  const [isSavingName, setIsSavingName] = useState(false)

  const isPro = user.tier === "pro" || user.tier === "elite"
  const isDarkMode = theme === "dark"

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const tierName = getTierName(user.level)
  const displayName = user.name || "User"

  // Get all badge types for display
  const allBadgeTypes = Object.values(BADGE_TYPES)
  const earnedBadgeIds = new Set(badges.map((b) => b.badgeType))

  const handleReminderToggle = async (checked: boolean) => {
    setReminderEnabled(checked)
    try {
      await updateSettings({ reminderEnabled: checked })
    } catch (error) {
      console.error("Failed to update reminder:", error)
      setReminderEnabled(!checked) // Revert on error
    }
  }

  const handleSaveGoal = async () => {
    setIsSaving(true)
    try {
      await updateSettings({ dailyPracticeGoal: tempGoal })
      setPracticeGoal(tempGoal)
      setGoalModalOpen(false)
    } catch (error) {
      console.error("Failed to update goal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty")
      return
    }
    setIsSavingName(true)
    try {
      await updateProfile({ name: tempName.trim() })
      setNameModalOpen(false)
      toast.success("Name updated successfully")
    } catch (error) {
      console.error("Failed to update name:", error)
      toast.error("Failed to update name")
    } finally {
      setIsSavingName(false)
    }
  }

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" })
  }

  const handleManageBilling = async () => {
    setIsBillingLoading(true)
    try {
      const response = await fetch("/api/billing", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Billing portal error:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsBillingLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm font-medium">{`${tierName} - Level ${user.level}`}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            setTempName(user.name || "")
            setNameModalOpen(true)
          }}
        >
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
              <p className="text-xl font-bold text-foreground">{stats.totalRepetitions.toLocaleString()}</p>
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

      {/* Pattern Insights (Pro Feature) */}
      <PatternInsights patterns={patterns || null} />

      {/* Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Badges ({badges.length}/{allBadgeTypes.length})
          </h2>
          <Link href="/profile/badges" className="text-sm font-medium text-primary hover:underline">
            View All Badges
          </Link>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {allBadgeTypes.slice(0, 10).map((badgeType) => {
              const isEarned = earnedBadgeIds.has(badgeType.id)
              return (
                <div
                  key={badgeType.id}
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl",
                    isEarned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-40",
                  )}
                  title={badgeType.name}
                >
                  {badgeType.icon}
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
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground">Dark mode</p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
            {/* Daily Reminder */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-foreground">Daily reminder</p>
                {reminderEnabled && user.reminderTime && <p className="text-sm text-muted-foreground">{user.reminderTime}</p>}
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={handleReminderToggle} />
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
            <button
              onClick={() => openUserProfile()}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
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
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Unlimited affirmations</li>
                  <li>Advanced analytics</li>
                  <li>Priority AI generation</li>
                  <li>Streak Shield protection</li>
                </ul>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/pricing">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manage Subscription (Pro Users) */}
      {isPro && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Pro Subscription</p>
                  <p className="text-sm text-muted-foreground">Manage billing & invoices</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isBillingLoading}
              >
                {isBillingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Manage"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
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
            <Button onClick={handleSaveGoal} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Name Modal */}
      <Dialog open={nameModalOpen} onOpenChange={setNameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>
              Update your display name. This is how you&apos;ll appear in the app.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={isSavingName}>
              {isSavingName ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
