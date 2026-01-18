"use client";

import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Brain, Trophy, ArrowRight, Check } from "lucide-react";
import { TransformationDemo } from "@/app/components/transformation-demo";
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
    <div className="flex flex-col py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          AI-Powered Mental Wellness
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">
          Quit Negative Thinking.<br />
          <span className="text-primary">Build a Better Mindset.</span>
        </h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Transform your inner critic into your biggest supporter with personalized affirmations and gamified practice.
        </p>
      </div>

      {/* Transformation Demo */}
      <div className="mb-8">
        <TransformationDemo />
      </div>

      {/* Benefits */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Science-backed methodology</p>
            <p className="text-sm text-muted-foreground">Based on Self-Talk Solution by Dr. Shad Helmstetter</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">AI-personalized affirmations</p>
            <p className="text-sm text-muted-foreground">Tailored to your specific thought patterns</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Gamified daily practice</p>
            <p className="text-sm text-muted-foreground">Earn XP, maintain streaks, unlock badges</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <SignInButton mode="modal">
          <Button size="lg" className="w-full gap-2">
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </SignInButton>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            10 free transforms
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            No credit card
          </span>
          <span className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            30-day money back
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="mt-8 flex justify-center gap-6">
        <Link href="/how-it-works" className="text-sm text-primary hover:underline font-medium">
          How it works
        </Link>
        <Link href="/pricing" className="text-sm text-primary hover:underline font-medium">
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
