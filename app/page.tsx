import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TierCard } from "@/components/tier-card";
import { QuickPractice } from "@/components/quick-practice";
import { TodayProgress } from "@/components/today-progress";
import { BottomNav } from "@/components/bottom-nav";
import { mockUser, mockAffirmations, mockTodayProgress } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 py-6">
        <header className="mb-6">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">
            {mockUser.name}
          </h1>
        </header>

        <div className="space-y-5">
          <TierCard
            level={mockUser.level}
            totalXP={mockUser.totalXP}
            currentStreak={mockUser.currentStreak}
          />
          <TodayProgress progress={mockTodayProgress} />
          <QuickPractice affirmations={mockAffirmations} />

          <Button asChild size="lg" className="w-full gap-2 shadow-md">
            <Link href="/transform">
              <Plus className="h-5 w-5" />
              Create New Affirmation
            </Link>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
