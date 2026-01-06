import { DashboardSkeleton } from "@/components/skeletons";
import { BottomNav } from "@/components/bottom-nav";

export default function Loading() {
  return (
    <>
      <DashboardSkeleton />
      <BottomNav />
    </>
  );
}
