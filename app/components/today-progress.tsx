import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Circle } from "lucide-react"
import type { TodayProgress as TodayProgressType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TodayProgressProps {
  progress: TodayProgressType
}

export function TodayProgress({ progress }: TodayProgressProps) {
  const tasks = [
    { label: "Practice goal", completed: progress.practiceGoalMet },
    { label: "Maintain streak", completed: progress.streakMaintained },
  ]

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.label} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                task.completed ? "bg-primary" : "border-2 border-muted-foreground/30",
              )}
            >
              {task.completed ? (
                <Check className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Circle className="h-3 w-3 text-transparent" />
              )}
            </div>
            <span className={cn("text-sm", task.completed ? "text-foreground" : "text-muted-foreground")}>
              {task.label}
            </span>
          </div>
        ))}
        <p className="pt-1 text-xs text-muted-foreground">
          {progress.practiceCount} / {progress.dailyGoal} practices completed
        </p>
      </CardContent>
    </Card>
  )
}
