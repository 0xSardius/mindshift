"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, Save, Check, Brain, Target, Lightbulb } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface MetaAffirmation {
  id: string
  text: string
  targetPattern: string
  explanation: string
}

interface Insights {
  primaryPattern: string
  rootCause: string
  recommendation: string
}

interface RootPatternsProps {
  isPro: boolean
  totalTransformations: number
}

export function RootPatterns({ isPro, totalTransformations }: RootPatternsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [metaAffirmations, setMetaAffirmations] = useState<MetaAffirmation[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const createAffirmation = useMutation(api.mutations.createAffirmation)

  const minRequired = 5
  const canGenerate = isPro && totalTransformations >= minRequired

  const handleGenerate = async () => {
    setIsGenerating(true)
    setInsights(null)
    setMetaAffirmations([])

    try {
      const response = await fetch("/api/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate")
      }

      const data = await response.json()
      setInsights(data.insights)
      setMetaAffirmations(data.metaAffirmations)
    } catch (error) {
      console.error("Error generating meta-affirmations:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate meta-affirmations")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (affirmation: MetaAffirmation) => {
    try {
      await createAffirmation({
        affirmationText: affirmation.text,
        originalThought: `Root pattern: ${affirmation.targetPattern}`,
        cognitiveDistortions: [affirmation.targetPattern],
        themeCategory: "root-pattern",
      })

      setSavedIds((prev) => new Set([...prev, affirmation.id]))
      toast.success("Meta-affirmation saved to your library!")
    } catch (error) {
      console.error("Error saving affirmation:", error)
      toast.error("Failed to save affirmation")
    }
  }

  // Not enough data yet
  if (!canGenerate) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Root Patterns</CardTitle>
            {!isPro && <Badge variant="secondary">Pro</Badge>}
          </div>
          <CardDescription>
            {!isPro
              ? "Upgrade to Pro to unlock AI-powered root cause analysis"
              : `Complete ${minRequired - totalTransformations} more transformations to unlock`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {!isPro ? (
                "Meta-affirmations analyze ALL your thought patterns to address root causes, not just surface symptoms."
              ) : (
                <>
                  <span className="font-medium text-foreground">{totalTransformations}/{minRequired}</span> transformations completed
                </>
              )}
            </p>
            {isPro && (
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (totalTransformations / minRequired) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Root Patterns</CardTitle>
            <Badge variant="default" className="bg-primary">Pro</Badge>
          </div>
        </div>
        <CardDescription>
          Generate powerful affirmations that address the root causes behind your thought patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Button */}
        {!insights && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing {totalTransformations} patterns...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Meta-Affirmations
              </>
            )}
          </Button>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Insights Card */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Primary Pattern</p>
                    <p className="text-sm text-muted-foreground">{insights.primaryPattern}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Root Cause</p>
                    <p className="text-sm text-muted-foreground">{insights.rootCause}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-primary/20">
                  <p className="text-sm italic text-muted-foreground">{insights.recommendation}</p>
                </div>
              </div>

              {/* Meta-Affirmations */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Your Meta-Affirmations</p>
                {metaAffirmations.map((aff, index) => (
                  <motion.div
                    key={aff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg border bg-card p-4 space-y-2"
                  >
                    <p className="font-medium text-foreground">"{aff.text}"</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Targets:</span> {aff.targetPattern}
                    </p>
                    <p className="text-xs text-muted-foreground">{aff.explanation}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-2"
                      onClick={() => handleSave(aff)}
                      disabled={savedIds.has(aff.id)}
                    >
                      {savedIds.has(aff.id) ? (
                        <>
                          <Check className="h-3 w-3" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3" />
                          Save to Library
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Regenerate Button */}
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate New
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
