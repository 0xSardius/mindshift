"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { ArrowLeft, Pause, Play, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CelebrationModal } from "@/components/celebration-modal"
import type { CelebrationData, CelebrationType, Badge } from "@/lib/types"

interface PracticeSessionProps {
  affirmationId: Id<"affirmations">
  affirmationText: string
  onComplete: () => void
  onBack: () => void
}

const TOTAL_REPS = 10
const XP_PER_REP = 1.5 // Matches backend calculation

function determineCelebrationType(
  oldLevel: number,
  newLevel: number,
  oldTier: string,
  newTier: string,
): CelebrationType {
  if (oldTier !== newTier) return "tierChange"
  if (newLevel % 10 === 0 && newLevel > oldLevel) return "milestone"
  if (newLevel > oldLevel) return "levelUp"
  return "standard"
}

function simulateProgression(currentXP: number, xpEarned: number) {
  const tiers = ["NOVICE", "APPRENTICE", "PRACTITIONER", "EXPERT", "MASTER"] as const
  const oldLevel = Math.floor(currentXP / 100) + 1
  const newLevel = Math.floor((currentXP + xpEarned) / 100) + 1
  const oldTierIndex = Math.min(Math.floor((oldLevel - 1) / 10), 4)
  const newTierIndex = Math.min(Math.floor((newLevel - 1) / 10), 4)

  return {
    oldLevel,
    newLevel,
    oldTier: tiers[oldTierIndex],
    newTier: tiers[newTierIndex],
  }
}

export function PracticeSession({ affirmationId, affirmationText, onComplete, onBack }: PracticeSessionProps) {
  const completePractice = useMutation(api.mutations.completePractice)

  const [currentInput, setCurrentInput] = useState("")
  const [completedReps, setCompletedReps] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingPartial, setIsSavingPartial] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Save partial progress when leaving with some reps completed
  const handleSaveAndExit = useCallback(async () => {
    if (completedReps === 0 || isSavingPartial) {
      onBack()
      return
    }

    setIsSavingPartial(true)
    try {
      await completePractice({
        affirmationId,
        repetitions: completedReps,
        durationSeconds: elapsedSeconds,
      })
      onBack()
    } catch (error) {
      console.error("Failed to save partial progress:", error)
      onBack() // Still exit even if save fails
    } finally {
      setIsSavingPartial(false)
    }
  }, [affirmationId, completedReps, completePractice, elapsedSeconds, isSavingPartial, onBack])

  useEffect(() => {
    if (!isPaused && !showCelebration) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, showCelebration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Normalize text for comparison (handle smart quotes, apostrophes, etc.)
  const normalizeText = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      // Normalize smart quotes to straight quotes
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Single quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Double quotes
      // Normalize dashes
      .replace(/[\u2013\u2014]/g, "-")
      // Normalize ellipsis
      .replace(/\u2026/g, "...")
      // Normalize multiple spaces to single space
      .replace(/\s+/g, " ")
  }

  const handleInputChange = useCallback(
    (value: string) => {
      setCurrentInput(value)

      if (normalizeText(value) === normalizeText(affirmationText)) {
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }

        setShowFlash(true)
        setTimeout(() => setShowFlash(false), 300)

        // Calculate new rep count (using current value + 1)
        const newRepCount = completedReps + 1

        // Use functional updates to avoid stale closure issues
        setCompletedReps((prev) => {
          const newReps = prev + 1

          // Update announcement
          const announcement = document.getElementById("sr-announcement")
          if (announcement) {
            announcement.textContent = `${newReps} of ${TOTAL_REPS} completed.`
          }

          return newReps
        })
        setXpEarned((prev) => prev + XP_PER_REP)
        setCurrentInput("")

        // Check completion
        if (newRepCount >= TOTAL_REPS) {
          setTimeout(async () => {
            if (isSubmitting) return
            setIsSubmitting(true)

            try {
              const result = await completePractice({
                affirmationId,
                repetitions: newRepCount,
                durationSeconds: elapsedSeconds,
              })

              const celebrationType = result.celebrationType as CelebrationType

              // Map badge IDs to badge objects for display
              const newBadges: Badge[] = result.newBadges.map((badgeId) => ({
                id: badgeId,
                name: badgeId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                icon: "🏆",
                description: `Earned the ${badgeId} badge`,
                earnedAt: new Date(),
                requirement: "",
              }))

              setCelebrationData({
                type: celebrationType,
                xpEarned: result.xpEarned,
                xpBreakdown: result.xpBreakdown,
                newLevel: result.newLevel,
                oldLevel: result.oldLevel,
                newTier: result.newTier,
                oldTier: result.oldTier,
                streakMaintained: result.streakMaintained,
                currentStreak: result.currentStreak,
                newBadges: newBadges.length > 0 ? newBadges : undefined,
                milestone: result.milestone?.isMilestone ? result.newLevel : undefined,
              })
              setShowCelebration(true)
            } catch (error) {
              console.error("Failed to complete practice:", error)
              // Still show celebration with local data on error
              setCelebrationData({
                type: "standard",
                xpEarned: TOTAL_REPS * XP_PER_REP,
                newLevel: 1,
                oldLevel: 1,
                newTier: "NOVICE",
                oldTier: "NOVICE",
                streakMaintained: true,
                currentStreak: 1,
              })
              setShowCelebration(true)
            } finally {
              setIsSubmitting(false)
            }
          }, 400)
        } else {
          textareaRef.current?.focus()
        }
      }
    },
    [affirmationId, affirmationText, completedReps, completePractice, elapsedSeconds, isSubmitting],
  )

  const progressPercent = (completedReps / TOTAL_REPS) * 100

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div id="sr-announcement" className="sr-only" aria-live="polite" aria-atomic="true" />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleSaveAndExit} disabled={isSavingPartial} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Practice Session</h1>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="font-mono text-sm">{formatTime(elapsedSeconds)}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col gap-6 p-4">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <p className="text-center text-2xl font-semibold leading-relaxed text-card-foreground">{affirmationText}</p>
        </div>

        <p className="text-center text-sm text-muted-foreground">Type your affirmation {TOTAL_REPS} times</p>

        <div className="relative">
          <AnimatePresence>
            {showFlash && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-green-400/30"
              />
            )}
          </AnimatePresence>
          <Textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Start typing..."
            className={cn(
              "h-[120px] resize-none font-mono text-base transition-colors",
              showFlash && "border-green-500",
            )}
            autoFocus
            disabled={isPaused || showCelebration}
            aria-label="Type the affirmation here"
          />
        </div>

        <div className="space-y-3">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-0"
          />
          <Progress value={progressPercent} className="h-3" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress:{" "}
              <span className="font-semibold text-foreground">
                {completedReps}/{TOTAL_REPS}
              </span>
            </span>
            <motion.span
              key={xpEarned}
              initial={{ scale: 1.2, color: "var(--primary)" }}
              animate={{ scale: 1, color: "var(--muted-foreground)" }}
              className="font-medium"
            >
              <span className="mr-1">🎯</span>
              {xpEarned} XP earned
            </motion.span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between gap-3 pb-4">
          <Button variant="outline" onClick={() => setIsPaused(!isPaused)} className="flex-1">
            {isPaused ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleSaveAndExit} disabled={isSavingPartial} className="text-muted-foreground">
            {isSavingPartial ? "Saving..." : completedReps > 0 ? "Save & Exit" : "Skip"}
          </Button>
        </div>
      </main>

      {celebrationData && (
        <CelebrationModal
          open={showCelebration}
          onOpenChange={setShowCelebration}
          data={celebrationData}
          onPracticeAnother={() => {
            setShowCelebration(false)
            onComplete()
          }}
          onGoHome={onBack}
        />
      )}
    </div>
  )
}
