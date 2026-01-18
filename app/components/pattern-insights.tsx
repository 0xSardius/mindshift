"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Lightbulb, Lock, TrendingUp } from "lucide-react"
import Link from "next/link"

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

interface PatternInsightsProps {
  patterns: PatternData | null
}

// Map cognitive distortion types to friendly names and colors
const DISTORTION_INFO: Record<string, { label: string; color: string }> = {
  "catastrophizing": { label: "Catastrophizing", color: "bg-red-500" },
  "all-or-nothing": { label: "All-or-Nothing", color: "bg-orange-500" },
  "all-or-nothing thinking": { label: "All-or-Nothing", color: "bg-orange-500" },
  "mind-reading": { label: "Mind Reading", color: "bg-purple-500" },
  "mind reading": { label: "Mind Reading", color: "bg-purple-500" },
  "fortune-telling": { label: "Fortune Telling", color: "bg-blue-500" },
  "fortune telling": { label: "Fortune Telling", color: "bg-blue-500" },
  "emotional reasoning": { label: "Emotional Reasoning", color: "bg-pink-500" },
  "should statements": { label: "Should Statements", color: "bg-yellow-500" },
  "labeling": { label: "Labeling", color: "bg-indigo-500" },
  "personalization": { label: "Personalization", color: "bg-teal-500" },
  "overgeneralization": { label: "Overgeneralization", color: "bg-green-500" },
  "mental filter": { label: "Mental Filter", color: "bg-cyan-500" },
  "disqualifying the positive": { label: "Disqualifying Positives", color: "bg-amber-500" },
  "magnification": { label: "Magnification", color: "bg-rose-500" },
  "minimization": { label: "Minimization", color: "bg-slate-500" },
}

// Map themes to icons
const THEME_ICONS: Record<string, string> = {
  "work": "💼",
  "career": "💼",
  "self-worth": "💪",
  "self worth": "💪",
  "confidence": "💪",
  "relationships": "👥",
  "social": "👥",
  "health": "🏥",
  "finances": "💰",
  "money": "💰",
  "family": "👨‍👩‍👧‍👦",
  "future": "🔮",
  "performance": "🎯",
  "appearance": "🪞",
  "intelligence": "🧠",
  "success": "🏆",
}

function getDistortionInfo(type: string) {
  const key = type.toLowerCase()
  return DISTORTION_INFO[key] || { label: type, color: "bg-gray-500" }
}

function getThemeIcon(theme: string) {
  const key = theme.toLowerCase()
  return THEME_ICONS[key] || "📝"
}

export function PatternInsights({ patterns }: PatternInsightsProps) {
  // No data yet
  if (!patterns || patterns.totalTransformations === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Your Thought Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Transform a few negative thoughts to see your patterns emerge.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/create">Create Affirmation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Free user teaser
  if (!patterns.isPro) {
    return (
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Your Thought Patterns
            <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Blurred preview */}
            <div className="blur-sm pointer-events-none select-none">
              <p className="text-sm text-muted-foreground mb-3">
                Based on {patterns.totalTransformations} transformations
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Catastrophizing</span>
                  <span>40%</span>
                </div>
                <Progress value={40} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>All-or-Nothing</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </div>
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
              <Lock className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">Unlock Pattern Insights</p>
              <p className="text-xs text-muted-foreground mb-3">See which thought patterns hold you back</p>
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full Pro view
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Your Thought Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Based on {patterns.totalTransformations} transformation{patterns.totalTransformations !== 1 ? "s" : ""}
        </p>

        {/* Cognitive Distortions */}
        {patterns.topDistortions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Top Cognitive Distortions</h3>
            </div>
            <div className="space-y-3">
              {patterns.topDistortions.map((distortion) => {
                const info = getDistortionInfo(distortion.type)
                return (
                  <div key={distortion.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{info.label}</span>
                      <span className="text-muted-foreground">{distortion.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${info.color} transition-all duration-500`}
                        style={{ width: `${distortion.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Themes */}
        {patterns.topThemes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Common Themes</h3>
            <div className="flex flex-wrap gap-2">
              {patterns.topThemes.map((theme) => (
                <div
                  key={theme.theme}
                  className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm"
                >
                  <span>{getThemeIcon(theme.theme)}</span>
                  <span className="capitalize">{theme.theme}</span>
                  <span className="text-muted-foreground">({theme.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty states */}
        {patterns.topDistortions.length === 0 && patterns.topThemes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Pattern data is still being collected. Keep transforming thoughts!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
