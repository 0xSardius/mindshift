"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Search, Check, Pencil, Archive, ArchiveRestore, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type FilterTab = "recent" | "practiced" | "archived"

interface Affirmation {
  _id: Id<"affirmations">
  affirmationText: string
  timesPracticed: number
  lastPracticedAt?: number
  archived: boolean
  createdAt: number
}

function formatLastPracticed(timestamp: number | undefined): string {
  if (!timestamp) return "Never practiced"
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 24) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return `${Math.floor(diffDays / 7)} weeks ago`
}

function isPracticedToday(timestamp: number | undefined): boolean {
  if (!timestamp) return false
  const date = new Date(timestamp)
  const now = new Date()
  return (
    date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  )
}

export function AffirmationLibrary() {
  const affirmations = useQuery(api.queries.getAffirmations, {})
  const archiveAffirmation = useMutation(api.mutations.archiveAffirmation)
  const restoreAffirmation = useMutation(api.mutations.restoreAffirmation)
  const updateAffirmation = useMutation(api.mutations.updateAffirmation)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("recent")
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null)
  const [editText, setEditText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const counts = useMemo(() => {
    if (!affirmations) return { recent: 0, practiced: 0, archived: 0 }
    const active = affirmations.filter((a) => !a.archived)
    const archived = affirmations.filter((a) => a.archived)
    return {
      recent: active.length,
      practiced: active.length,
      archived: archived.length,
    }
  }, [affirmations])

  const filteredAffirmations = useMemo(() => {
    if (!affirmations) return []
    let filtered = [...affirmations]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((a) => a.affirmationText.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by tab
    switch (activeTab) {
      case "recent":
        filtered = filtered.filter((a) => !a.archived).sort((a, b) => b.createdAt - a.createdAt)
        break
      case "practiced":
        filtered = filtered.filter((a) => !a.archived).sort((a, b) => b.timesPracticed - a.timesPracticed)
        break
      case "archived":
        filtered = filtered.filter((a) => a.archived)
        break
    }

    return filtered
  }, [affirmations, searchQuery, activeTab])

  const handleArchive = async (id: Id<"affirmations">) => {
    try {
      await archiveAffirmation({ affirmationId: id })
    } catch (error) {
      console.error("Failed to archive:", error)
    }
  }

  const handleRestore = async (id: Id<"affirmations">) => {
    try {
      await restoreAffirmation({ affirmationId: id })
    } catch (error) {
      console.error("Failed to restore:", error)
    }
  }

  const handleEditOpen = (affirmation: Affirmation) => {
    setEditingAffirmation(affirmation)
    setEditText(affirmation.affirmationText)
  }

  const handleEditSave = async () => {
    if (!editingAffirmation || !editText.trim()) return
    setIsSaving(true)
    try {
      await updateAffirmation({
        affirmationId: editingAffirmation._id,
        affirmationText: editText.trim(),
      })
      setEditingAffirmation(null)
      setEditText("")
    } catch (error) {
      console.error("Failed to update:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderEmptyState = () => {
    if (activeTab === "archived") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-muted-foreground text-lg mb-2">No archived affirmations</p>
          <p className="text-muted-foreground text-sm">Affirmations you archive will appear here</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <p className="text-muted-foreground text-lg mb-4">No affirmations yet</p>
        <Button asChild>
          <Link href="/transform">Create Affirmation</Link>
        </Button>
      </div>
    )
  }

  // Loading state
  if (affirmations === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky header with search */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your Affirmations</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search affirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList className="w-full justify-start px-4 bg-transparent h-auto pb-3 gap-2">
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
            >
              Recent ({counts.recent})
            </TabsTrigger>
            <TabsTrigger
              value="practiced"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
            >
              Most Practiced
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
            >
              Archived ({counts.archived})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Affirmation list */}
      <div className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {filteredAffirmations.length === 0 ? (
          renderEmptyState()
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {filteredAffirmations.map((affirmation) => (
                <motion.div
                  key={affirmation._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Practiced today indicator */}
                      <div className="pt-1">
                        {isPracticedToday(affirmation.lastPracticedAt) ? (
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Affirmation text */}
                        <p className="text-foreground leading-relaxed mb-2">{affirmation.affirmationText}</p>

                        {/* Stats */}
                        <p className="text-sm text-muted-foreground mb-3">
                          Practiced {affirmation.timesPracticed} times • Last:{" "}
                          {formatLastPracticed(affirmation.lastPracticedAt)}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/practice/${affirmation._id}`}>Practice</Link>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditOpen(affirmation)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          {affirmation.archived ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => handleRestore(affirmation._id)}
                            >
                              <ArchiveRestore className="h-3.5 w-3.5 mr-1" />
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => handleArchive(affirmation._id)}
                            >
                              <Archive className="h-3.5 w-3.5 mr-1" />
                              Archive
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingAffirmation} onOpenChange={() => setEditingAffirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Affirmation</DialogTitle>
          </DialogHeader>
          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} className="resize-none" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAffirmation(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editText.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
