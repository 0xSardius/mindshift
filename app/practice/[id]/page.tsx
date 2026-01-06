"use client"

import { useRouter, useParams } from "next/navigation"
import { Suspense } from "react"
import { PracticeSession } from "@/components/practice-session"
import { mockAffirmations } from "@/lib/mock-data"

function PracticeContent() {
  const router = useRouter()
  const params = useParams()

  const affirmationId = params.id as string
  const affirmation = mockAffirmations.find((a) => a.id === affirmationId) || mockAffirmations[0]

  const handleComplete = (xpEarned: number) => {
    // In a real app, this would update the user's XP and streak
    console.log(`Practice complete! Earned ${xpEarned} XP`)
    router.push("/")
  }

  const handleBack = () => {
    router.push("/")
  }

  if (!affirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Affirmation not found</p>
      </div>
    )
  }

  return <PracticeSession affirmationText={affirmation.text} onComplete={handleComplete} onBack={handleBack} />
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  )
}
