import { AffirmationCreator } from "@/components/affirmation-creator"
import { BottomNav } from "@/components/bottom-nav"

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-background pb-24">
      <AffirmationCreator />
      <BottomNav />
    </main>
  )
}
