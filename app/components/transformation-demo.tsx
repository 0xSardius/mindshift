"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const examples = [
  {
    negative: "I'm not good enough for this job",
    positive: "I am capable and growing every day. My skills make me valuable.",
  },
  {
    negative: "Nobody likes me",
    positive: "I am worthy of meaningful connections. I attract positive relationships.",
  },
  {
    negative: "I always mess everything up",
    positive: "I learn from every experience. Each attempt brings me closer to success.",
  },
]

export function TransformationDemo() {
  const [exampleIndex, setExampleIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "transforming" | "revealed">("typing")
  const [displayedText, setDisplayedText] = useState("")

  const currentExample = examples[exampleIndex]

  // Typing effect for negative thought
  useEffect(() => {
    if (phase !== "typing") return

    const text = currentExample.negative
    let index = 0
    setDisplayedText("")

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        // Pause after typing, then transform
        setTimeout(() => setPhase("transforming"), 800)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [phase, currentExample.negative])

  // Transformation phase
  useEffect(() => {
    if (phase !== "transforming") return

    const timeout = setTimeout(() => {
      setPhase("revealed")
    }, 1500)

    return () => clearTimeout(timeout)
  }, [phase])

  // Cycle to next example
  useEffect(() => {
    if (phase !== "revealed") return

    const timeout = setTimeout(() => {
      setExampleIndex((prev) => (prev + 1) % examples.length)
      setPhase("typing")
    }, 4000)

    return () => clearTimeout(timeout)
  }, [phase])

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-b from-card to-muted/30">
      <CardContent className="p-0">
        {/* Negative thought section */}
        <div className="bg-red-50 dark:bg-red-950/30 p-4 border-b border-red-100 dark:border-red-900/50 min-h-[88px]">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Negative thought
          </p>
          <p className="text-foreground italic">
            "{displayedText}
            {phase === "typing" && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-foreground ml-0.5 align-middle"
              />
            )}
            "
          </p>
        </div>

        {/* Transformation indicator */}
        <div className="flex items-center justify-center py-3 bg-muted/50 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "transforming" ? (
              <motion.div
                key="transforming"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 text-primary"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <span className="text-sm font-medium">Transforming...</span>
              </motion.div>
            ) : (
              <motion.div
                key="arrow"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <ArrowDown className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sparkle particles during transformation */}
          {phase === "transforming" && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 40,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Affirmation section */}
        <div className="bg-green-50 dark:bg-green-950/30 p-4 min-h-[88px]">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-powered affirmation
          </p>
          <AnimatePresence mode="wait">
            {phase === "revealed" ? (
              <motion.p
                key={currentExample.positive}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-foreground font-medium"
              >
                "{currentExample.positive}"
              </motion.p>
            ) : (
              <motion.div
                key="placeholder"
                className="flex items-center gap-2"
              >
                {phase === "transforming" ? (
                  <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <span className="text-muted-foreground italic text-sm">
                    Waiting for input...
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-3 bg-muted/30">
          {examples.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setExampleIndex(i)
                setPhase("typing")
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === exampleIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-label={`View example ${i + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
