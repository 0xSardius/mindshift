"use client"

import { useRouter, useParams } from "next/navigation"
import { Suspense } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { PracticeSession } from "@/components/practice-session"
import { Loader2 } from "lucide-react"

function PracticeContent() {
  const router = useRouter()
  const params = useParams()

  const affirmationId = params.id as Id<"affirmations">
  const affirmation = useQuery(api.queries.getAffirmation, { affirmationId })

  const handleComplete = () => {
    router.push("/")
  }

  const handleBack = () => {
    router.push("/")
  }

  // Loading state
  if (affirmation === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not found state
  if (affirmation === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Affirmation not found</p>
      </div>
    )
  }

  return (
    <PracticeSession
      affirmationId={affirmationId}
      affirmationText={affirmation.affirmationText}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  )
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
