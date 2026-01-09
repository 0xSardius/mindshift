"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRight, Sparkles, AlertCircle, RefreshCw, Lock } from "lucide-react"
import type { GeneratedAffirmation, AffirmationAnalysis } from "@/lib/types"

type Phase = "input" | "loading" | "selection" | "error"

export function AffirmationCreator() {
  const router = useRouter()
  const createAffirmation = useMutation(api.mutations.createAffirmation)
  const transformCount = useQuery(api.queries.getTransformationCount)

  const [phase, setPhase] = useState<Phase>("input")
  const [negativeThought, setNegativeThought] = useState("")
  const [affirmations, setAffirmations] = useState<GeneratedAffirmation[]>([])
  const [analysis, setAnalysis] = useState<AffirmationAnalysis | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customAffirmation, setCustomAffirmation] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const characterCount = negativeThought.length
  const isInputValid = characterCount >= 10
  const hasReachedLimit = transformCount && !transformCount.unlimited && transformCount.remaining <= 0

  async function handleGenerate() {
    setPhase("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negativeThought }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate affirmations")
      }

      const data = await response.json()
      setAffirmations(data.affirmations)
      setAnalysis(data.analysis)
      setSelectedId(data.affirmations[0]?.id || null)
      setPhase("selection")
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
      setPhase("error")
    }
  }

  async function handleSaveAndPractice() {
    const selectedText = customAffirmation || affirmations.find((a) => a.id === selectedId)?.text
    if (!selectedText) return

    setIsSaving(true)
    try {
      const affirmationId = await createAffirmation({
        originalThought: negativeThought,
        affirmationText: selectedText,
        detectedLevel: analysis?.detectedLevel,
        cognitiveDistortions: analysis?.cognitiveDistortion ? [analysis.cognitiveDistortion] : undefined,
        themeCategory: analysis?.theme,
        chosenLevel: analysis?.targetLevel,
        userEdited: !!customAffirmation,
      })
      router.push(`/practice/${affirmationId}`)
    } catch (error) {
      console.error("Failed to save affirmation:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to save affirmation")
      setPhase("error")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveToLibrary() {
    const selectedText = customAffirmation || affirmations.find((a) => a.id === selectedId)?.text
    if (!selectedText) return

    setIsSaving(true)
    try {
      await createAffirmation({
        originalThought: negativeThought,
        affirmationText: selectedText,
        detectedLevel: analysis?.detectedLevel,
        cognitiveDistortions: analysis?.cognitiveDistortion ? [analysis.cognitiveDistortion] : undefined,
        themeCategory: analysis?.theme,
        chosenLevel: analysis?.targetLevel,
        userEdited: !!customAffirmation,
      })
      router.push("/library")
    } catch (error) {
      console.error("Failed to save affirmation:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to save affirmation")
      setPhase("error")
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    setPhase("input")
    setNegativeThought("")
    setAffirmations([])
    setAnalysis(null)
    setSelectedId(null)
    setCustomAffirmation("")
    setErrorMessage("")
  }

  // Phase 1: Input
  if (phase === "input") {
    // Show limit reached state
    if (hasReachedLimit) {
      return (
        <div className="flex flex-col gap-6 px-4 py-8 mx-auto max-w-[600px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Free Limit Reached
            </h1>
            <p className="text-muted-foreground">
              You&apos;ve used all 10 free transformations. Upgrade to Pro for unlimited affirmations.
            </p>
            <Button onClick={() => router.push("/pricing")} size="lg" className="gap-2">
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={() => router.push("/library")} className="text-muted-foreground">
              Practice existing affirmations
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6 px-4 py-8 mx-auto max-w-[600px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            What negative thought do you want to quit?
          </h1>
          {transformCount && !transformCount.unlimited && (
            <p className="text-sm text-muted-foreground">
              {transformCount.remaining} of {transformCount.limit} free transformations remaining
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Textarea
            value={negativeThought}
            onChange={(e) => setNegativeThought(e.target.value)}
            placeholder="e.g., I'm not good enough to succeed at this..."
            className="min-h-[150px] text-base resize-none"
            maxLength={500}
            autoFocus
          />
          <div className="flex justify-end">
            <span className="text-sm text-muted-foreground">{characterCount}/500</span>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!isInputValid} size="lg" className="w-full gap-2">
          Generate Affirmations
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          Our AI creates personalized affirmations using proven CBT principles
        </p>
      </div>
    )
  }

  // Loading state
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 mx-auto max-w-[600px]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <Loader2 className="relative w-12 h-12 text-primary animate-spin" />
        </div>
        <p className="text-lg font-medium text-foreground animate-pulse">Creating your personalized affirmations...</p>
      </div>
    )
  }

  // Error state
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-16 mx-auto max-w-[600px]">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-medium text-foreground">{errorMessage || "Something went wrong"}</p>
          <p className="text-sm text-muted-foreground">
            Don&apos;t worry, your thought is still saved. Let&apos;s try again.
          </p>
        </div>
        <Button onClick={handleGenerate} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Phase 2: Selection
  return (
    <div className="flex flex-col gap-6 px-4 py-8 mx-auto max-w-[600px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Choose Your Affirmation</h1>
        <p className="text-muted-foreground">Select the one that resonates most with you</p>
      </div>

      {analysis && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Identified pattern:</span> {analysis.cognitiveDistortion}
          </p>
        </Card>
      )}

      <RadioGroup
        value={customAffirmation ? "custom" : selectedId || undefined}
        onValueChange={(value) => {
          if (value === "custom") {
            setSelectedId(null)
          } else {
            setSelectedId(value)
            setCustomAffirmation("")
          }
        }}
        className="flex flex-col gap-3"
      >
        {affirmations.map((affirmation) => (
          <Card
            key={affirmation.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedId === affirmation.id && !customAffirmation
                ? "ring-2 ring-primary border-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => {
              setSelectedId(affirmation.id)
              setCustomAffirmation("")
            }}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value={affirmation.id} id={affirmation.id} className="mt-1" />
              <Label htmlFor={affirmation.id} className="text-base font-normal leading-relaxed cursor-pointer">
                {affirmation.text}
              </Label>
            </div>
          </Card>
        ))}

        {/* Custom affirmation option */}
        <Card
          className={`p-4 transition-all ${
            customAffirmation ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="text-base font-normal cursor-pointer">
                Or write your own
              </Label>
            </div>
            <Input
              value={customAffirmation}
              onChange={(e) => {
                setCustomAffirmation(e.target.value)
                setSelectedId(null)
              }}
              placeholder="I am..."
              className="ml-7"
            />
          </div>
        </Card>
      </RadioGroup>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={handleSaveAndPractice}
          disabled={(!selectedId && !customAffirmation) || isSaving}
          size="lg"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Practice"
          )}
        </Button>
        <Button
          onClick={handleSaveToLibrary}
          disabled={(!selectedId && !customAffirmation) || isSaving}
          variant="outline"
          size="lg"
          className="w-full bg-transparent"
        >
          Save to Library
        </Button>
      </div>

      <Button onClick={handleReset} variant="ghost" className="text-muted-foreground">
        Start over with a different thought
      </Button>
    </div>
  )
}
