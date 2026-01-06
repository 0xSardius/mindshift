import { AffirmationLibrary } from "@/components/affirmation-library"
import { BottomNav } from "@/components/bottom-nav"
import { mockAffirmations } from "@/lib/mock-data"

export default function LibraryPage() {
  return (
    <>
      <AffirmationLibrary initialAffirmations={mockAffirmations} />
      <BottomNav />
    </>
  )
}
