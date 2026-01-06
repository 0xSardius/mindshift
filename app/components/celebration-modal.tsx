"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import ConfettiExplosion from "react-confetti-explosion"
import type { CelebrationData, Tier } from "@/lib/types"

interface CelebrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CelebrationData
  onPracticeAnother: () => void
  onGoHome: () => void
}

const TIER_CONFIG: Record<Tier, { icon: string; name: string; color: string }> = {
  NOVICE: { icon: "🌱", name: "Novice", color: "var(--tier-novice)" },
  APPRENTICE: { icon: "📘", name: "Apprentice", color: "var(--tier-apprentice)" },
  PRACTITIONER: { icon: "🎯", name: "Practitioner", color: "var(--tier-practitioner)" },
  EXPERT: { icon: "⚡", name: "Expert", color: "var(--tier-expert)" },
  MASTER: { icon: "👑", name: "Master", color: "var(--tier-master)" },
}

export function CelebrationModal({ open, onOpenChange, data, onPracticeAnother, onGoHome }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  // Trigger confetti for tier changes and milestones
  useEffect(() => {
    if (open && (data.type === "tierChange" || data.type === "milestone")) {
      setShowConfetti(true)
    } else {
      setShowConfetti(false)
    }
  }, [open, data.type])

  const getTitle = () => {
    switch (data.type) {
      case "tierChange":
        return `Welcome to ${TIER_CONFIG[data.newTier!].name}!`
      case "levelUp":
        return "Level Up!"
      case "milestone":
        return `${data.milestone} Levels Achieved!`
      default:
        return "Practice Complete!"
    }
  }

  const getEmoji = () => {
    switch (data.type) {
      case "tierChange":
        return TIER_CONFIG[data.newTier!].icon
      case "levelUp":
        return "🆙"
      case "milestone":
        return "🏆"
      default:
        return "🎉"
    }
  }

  const isMajorCelebration = data.type === "tierChange" || data.type === "milestone"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-sm text-center ${isMajorCelebration ? "border-2" : ""}`}
        style={isMajorCelebration && data.newTier ? { borderColor: TIER_CONFIG[data.newTier].color } : undefined}
      >
        {/* Confetti for major celebrations */}
        <AnimatePresence>
          {showConfetti && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ConfettiExplosion force={0.8} duration={3000} particleCount={100} width={400} />
            </div>
          )}
        </AnimatePresence>

        <DialogHeader className="items-center">
          {/* Animated emoji */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`mb-2 ${isMajorCelebration ? "text-7xl" : "text-6xl"}`}
          >
            {getEmoji()}
          </motion.div>

          <DialogTitle className={`${isMajorCelebration ? "text-3xl" : "text-2xl"}`}>{getTitle()}</DialogTitle>
          <DialogDescription className="sr-only">Celebration modal showing your achievements</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tier change announcement */}
          {data.type === "tierChange" && data.oldTier && data.newTier && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 text-lg"
            >
              <span className="text-2xl">{TIER_CONFIG[data.oldTier].icon}</span>
              <span className="text-muted-foreground">→</span>
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-3xl"
              >
                {TIER_CONFIG[data.newTier].icon}
              </motion.span>
            </motion.div>
          )}

          {/* Level up display */}
          {data.type === "levelUp" && data.newLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center"
            >
              <span className="text-muted-foreground">Level</span>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-primary"
              >
                {data.newLevel}
              </motion.div>
            </motion.div>
          )}

          {/* XP earned - animated counter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-primary"
          >
            <AnimatedXP value={data.xpEarned} />
          </motion.div>

          {/* Streak status */}
          {data.streakMaintained && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-lg"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.3, delay: 0.5 }}>
                🔥
              </motion.span>
              <span className="font-medium">{data.currentStreak}-day streak!</span>
            </motion.div>
          )}

          {/* Milestone bonus */}
          {data.type === "milestone" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-lg bg-primary/10 p-3"
            >
              <p className="text-sm font-medium text-primary">Milestone Bonus: +{data.milestone! * 10} XP</p>
            </motion.div>
          )}

          {/* New badges earned */}
          {data.newBadges && data.newBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <p className="text-sm text-muted-foreground">New badges earned!</p>
              <div className="flex justify-center gap-3">
                {data.newBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-2"
        >
          <Button onClick={onPracticeAnother} className="w-full">
            Practice Another
          </Button>
          <Button variant="outline" onClick={onGoHome} className="w-full bg-transparent">
            Back to Home
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Animated XP counter component
function AnimatedXP({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 20
    const increment = value / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  return <span>+{displayValue} XP</span>
}
