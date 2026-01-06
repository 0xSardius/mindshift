import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// TierCard Skeleton - matches the full TierCard dimensions
export function TierCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Top colored bar */}
      <Skeleton className="h-1.5 w-full rounded-none" />
      <CardContent className="p-5">
        {/* Header row: icon + tier/level + streak badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Progress section */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2.5 w-full" />
        </div>

        {/* Tier progress text */}
        <div className="mt-3 flex justify-center">
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Bottom stats row */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-px" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Affirmation Card Skeleton
export function AffirmationCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox circle */}
        <Skeleton className="mt-1 h-5 w-5 rounded-full" />
        <div className="flex-1 space-y-3">
          {/* Affirmation text - 2 lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* Stats line */}
          <Skeleton className="h-3 w-48" />
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
}

// Today Progress Skeleton
export function TodayProgressSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Practice Skeleton
export function QuickPracticeSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-full max-w-[200px]" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Full Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-7 w-32" />
        </header>

        <div className="space-y-5">
          <TierCardSkeleton />
          <TodayProgressSkeleton />
          <QuickPracticeSkeleton />
          {/* CTA Button */}
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Leaderboard Row Skeleton
export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card p-3">
      {/* Rank */}
      <Skeleton className="h-7 w-7 rounded-full" />
      {/* Tier icon */}
      <Skeleton className="h-6 w-6 rounded" />
      {/* User info */}
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      {/* Reps */}
      <Skeleton className="h-5 w-14" />
    </div>
  )
}

// Full Leaderboard Skeleton
export function LeaderboardSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <Skeleton className="h-6 w-36" />
      </div>

      {/* Tabs */}
      <div className="border-b bg-card px-4 py-2">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-48">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Sticky User Rank Card Skeleton */}
      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-md px-4">
        <Card className="border-t shadow-lg">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Library Search Skeleton
export function LibrarySearchSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

// Full Library Skeleton
export function LibrarySkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky header with search */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 pt-6 pb-4">
          <Skeleton className="h-7 w-48 mb-4" />
          <LibrarySearchSkeleton />
        </div>

        {/* Filter tabs */}
        <div className="px-4 pb-3 flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      {/* Affirmation list */}
      <div className="flex-1 px-4 py-4 pb-24">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AffirmationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Avatar and name */}
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="h-20 w-20 rounded-full mb-3" />
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>

        {/* Tier card skeleton compact */}
        <Card className="overflow-hidden border-0 shadow-md mb-6">
          <Skeleton className="h-1 w-full rounded-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="mt-3 h-2 w-full" />
          </CardContent>
        </Card>

        {/* Badges section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg shrink-0" />
            ))}
          </div>
        </div>

        {/* Settings list */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
