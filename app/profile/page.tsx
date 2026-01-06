import { Profile } from "@/components/profile"
import { BottomNav } from "@/components/bottom-nav"
import { mockUser, mockBadges, mockUserSettings, mockUserStats, mockPracticeData } from "@/lib/mock-data"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-4 pt-6">
        <Profile
          user={mockUser}
          stats={mockUserStats}
          badges={mockBadges}
          settings={mockUserSettings}
          isPro={false}
          practiceData={mockPracticeData}
        />
      </div>
      <BottomNav />
    </main>
  )
}
