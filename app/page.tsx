"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TierCard } from "@/components/tier-card";
import { QuickPractice } from "@/components/quick-practice";
import { TodayProgress } from "@/components/today-progress";
import { BottomNav } from "@/components/bottom-nav";
import { useSyncUser } from "@/hooks/use-sync-user";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-20" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function AuthenticatedDashboard() {
  const { user, isLoading: isUserLoading, isAuthenticated } = useSyncUser();

  // Only query when authenticated
  const affirmations = useQuery(
    api.queries.getAffirmations,
    isAuthenticated ? { archived: false, limit: 3 } : "skip"
  );
  const todayProgress = useQuery(
    api.queries.getTodayProgress,
    isAuthenticated ? {} : "skip"
  );

  const isLoading = isUserLoading || affirmations === undefined || todayProgress === undefined;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  // Transform affirmations to match component expected format
  const formattedAffirmations = affirmations.map((a) => ({
    id: a._id,
    text: a.affirmationText,
    timesPracticed: a.timesPracticed,
    lastPracticedAt: a.lastPracticedAt ? new Date(a.lastPracticedAt) : null,
    archived: a.archived,
    createdAt: new Date(a.createdAt),
  }));

  // Format today progress
  const formattedProgress = todayProgress ? {
    practiceGoalMet: todayProgress.practiceGoalMet,
    streakMaintained: todayProgress.streakMaintained,
    practiceCount: todayProgress.practiceCount,
    dailyGoal: todayProgress.dailyGoal,
  } : {
    practiceGoalMet: false,
    streakMaintained: false,
    practiceCount: 0,
    dailyGoal: 1,
  };

  return (
    <>
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user.name || "Mindshifter"}
        </h1>
      </header>

      <div className="space-y-5">
        <TierCard
          level={user.level}
          totalXP={user.totalXP}
          currentStreak={user.currentStreak}
        />
        <TodayProgress progress={formattedProgress} />

        {formattedAffirmations.length > 0 ? (
          <QuickPractice affirmations={formattedAffirmations} />
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No affirmations yet. Create your first one!
              </p>
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Affirmation
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Button asChild size="lg" className="w-full gap-2 shadow-md">
          <Link href="/create">
            <Plus className="h-5 w-5" />
            Create New Affirmation
          </Link>
        </Button>
      </div>
    </>
  );
}

function UnauthenticatedHome() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Welcome to Mindshift
      </h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Transform negative self-talk into empowering affirmations through AI-powered practice.
      </p>
      <SignInButton mode="modal">
        <Button size="lg">Get Started</Button>
      </SignInButton>
      <div className="mt-6 space-x-4">
        <Link href="/how-it-works" className="text-sm text-primary hover:underline">
          How it works
        </Link>
        <Link href="/pricing" className="text-sm text-primary hover:underline">
          Pricing
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-md px-4 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 py-6">
        <SignedIn>
          <AuthenticatedDashboard />
        </SignedIn>
        <SignedOut>
          <UnauthenticatedHome />
        </SignedOut>
      </div>

      <SignedIn>
        <BottomNav />
      </SignedIn>
    </div>
  );
}
