"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap, Flame } from "lucide-react"
import type { Tier } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"
import { calculateXPForNextLevel } from "@/convex/lib/xpCalculator"

export const tierConfig: Record<
  Tier,
  {
    label: string
    colorClass: string
    bgClass: string
    bgTint: string
    levelsRequired: number
  }
> = {
  NOVICE: {
    label: "Novice",
    colorClass: "text-tier-novice",
    bgClass: "bg-tier-novice",
    bgTint: "bg-tier-novice/10",
    levelsRequired: 0,
  },
  APPRENTICE: {
    label: "Apprentice",
    colorClass: "text-tier-apprentice",
    bgClass: "bg-tier-apprentice",
    bgTint: "bg-tier-apprentice/10",
    levelsRequired: 10,
  },
  PRACTITIONER: {
    label: "Practitioner",
    colorClass: "text-tier-practitioner",
    bgClass: "bg-tier-practitioner",
    bgTint: "bg-tier-practitioner/10",
    levelsRequired: 20,
  },
  EXPERT: {
    label: "Expert",
    colorClass: "text-tier-expert",
    bgClass: "bg-tier-expert",
    bgTint: "bg-tier-expert/20",
    levelsRequired: 30,
  },
  MASTER: {
    label: "Master",
    colorClass: "text-tier-master",
    bgClass: "bg-tier-master",
    bgTint: "bg-tier-master/20",
    levelsRequired: 40,
  },
}

const tierOrder: Tier[] = ["NOVICE", "APPRENTICE", "PRACTITIONER", "EXPERT", "MASTER"]

function getTierFromLevel(level: number): Tier {
  if (level >= 40) return "MASTER"
  if (level >= 30) return "EXPERT"
  if (level >= 20) return "PRACTITIONER"
  if (level >= 10) return "APPRENTICE"
  return "NOVICE"
}


function getNextTier(currentTier: Tier): Tier | null {
  const currentIndex = tierOrder.indexOf(currentTier)
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1]
  }
  return null
}

function getLevelsToNextTier(level: number, currentTier: Tier): { current: number; total: number } {
  const nextTier = getNextTier(currentTier)
  if (!nextTier) return { current: 10, total: 10 }

  const currentTierStart = tierConfig[currentTier].levelsRequired
  const nextTierStart = tierConfig[nextTier].levelsRequired
  const levelsInTier = nextTierStart - currentTierStart
  const levelsCompleted = level - currentTierStart

  return { current: levelsCompleted, total: levelsInTier }
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}

interface TierCardProps {
  level: number
  totalXP: number
  currentStreak: number
  compact?: boolean
}

export function TierCard({ level, totalXP, currentStreak, compact = false }: TierCardProps) {
  const tier = getTierFromLevel(level)
  const tierInfo = tierConfig[tier]
  const { xpProgress, xpRequired } = calculateXPForNextLevel(totalXP, level)
  const currentXP = xpProgress
  const xpToNextLevel = xpRequired
  const progressPercent = xpRequired > 0 ? (xpProgress / xpRequired) * 100 : 100
  const tierProgress = getLevelsToNextTier(level, tier)
  const nextTier = getNextTier(tier)

  if (compact) {
    return (
      <Card className={cn("overflow-hidden border-0 shadow-md", tierInfo.bgTint)}>
        <div className={cn("h-1", tierInfo.bgClass)} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", tierInfo.bgClass)}>
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className={cn("text-xs font-semibold uppercase tracking-wide", tierInfo.colorClass)}>
                  {tierInfo.label}
                </span>
                <p className="text-lg font-bold text-foreground">Level {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next Level</p>
              <p className="text-sm font-medium text-foreground">
                {currentXP}/{xpToNextLevel} XP
              </p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-3 h-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden border-0 shadow-lg", tierInfo.bgTint)}>
      <div className={cn("h-1.5", tierInfo.bgClass)} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className={cn("flex h-12 w-12 items-center justify-center rounded-full", tierInfo.bgClass)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold uppercase tracking-wide", tierInfo.colorClass)}>
                  {tierInfo.label}
                </span>
                <Zap className={cn("h-4 w-4", tierInfo.colorClass)} />
              </div>
              <p className="text-2xl font-bold text-foreground">Level {level}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-foreground">{currentStreak} days</span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="font-medium text-foreground">
              <AnimatedNumber value={currentXP} /> / {xpToNextLevel} XP
            </span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ originX: 0 }}
          >
            <Progress value={progressPercent} className="h-2.5" />
          </motion.div>
        </div>

        {nextTier && (
          <motion.div
            className="mt-3 text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm text-muted-foreground">
              {tierProgress.current}/{tierProgress.total} levels to{" "}
              <span className={cn("font-semibold", tierConfig[nextTier].colorClass)}>{tierConfig[nextTier].label}</span>
            </span>
          </motion.div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Streak</span>
            <span className="font-bold text-foreground">{currentStreak}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total XP</span>
            <AnimatedNumber value={totalXP} className={cn("font-bold", tierInfo.colorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
