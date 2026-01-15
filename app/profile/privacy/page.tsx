"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function PrivacySettingsPage() {
  const user = useQuery(api.queries.getCurrentUser)
  const updateSettings = useMutation(api.mutations.updateUserSettings)
  const [isSaving, setIsSaving] = useState(false)

  if (user === undefined) {
    return (
      <main className="min-h-screen bg-background pb-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view settings</p>
      </main>
    )
  }

  const handleAnonymousModeToggle = async (checked: boolean) => {
    setIsSaving(true)
    try {
      await updateSettings({ anonymousMode: checked })
    } catch (error) {
      console.error("Failed to update anonymous mode:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground">Privacy Settings</h1>
        </div>

        {/* Privacy Options */}
        <Card className="border-0 shadow-sm">
          <CardContent className="divide-y divide-border p-0">
            {/* Anonymous Mode */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {user.anonymousMode ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Anonymous mode</p>
                  <p className="text-sm text-muted-foreground">
                    Hide your name on the leaderboard
                  </p>
                </div>
              </div>
              <Switch
                checked={user.anonymousMode}
                onCheckedChange={handleAnonymousModeToggle}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 border-0 bg-muted/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              When anonymous mode is enabled, your name will appear as &quot;Anonymous&quot; on the public leaderboard. Your stats and progress will still be tracked normally.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
