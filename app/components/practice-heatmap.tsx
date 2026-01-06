"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PracticeDay {
  date: string
  count: number
}

interface PracticeHeatmapProps {
  practiceData: PracticeDay[]
  onDateClick?: (date: string) => void
}

// Memoized cell component for performance
const HeatmapCell = memo(function HeatmapCell({
  date,
  count,
  isToday,
  onClick,
}: {
  date: string
  count: number
  isToday: boolean
  onClick?: () => void
}) {
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted"
    if (count <= 2) return "bg-emerald-200"
    if (count <= 4) return "bg-emerald-400"
    return "bg-emerald-600"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] transition-all",
              getColorClass(count),
              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              onClick && "hover:scale-125 cursor-pointer",
            )}
            aria-label={`${count} practices on ${formatDate(date)}`}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <span className="font-medium">
            {count} practice{count !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground"> on {formatDate(date)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export const PracticeHeatmap = memo(function PracticeHeatmap({ practiceData, onDateClick }: PracticeHeatmapProps) {
  const { weeks, monthLabels, todayStr } = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    // Create a map for quick lookup
    const dataMap = new Map(practiceData.map((d) => [d.date, d.count]))

    // Get start date (52 weeks ago, aligned to Sunday)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)
    // Align to Sunday
    const startDayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - startDayOfWeek)

    // Generate all dates
    const weeks: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []

    const current = new Date(startDate)
    const endDate = new Date(today)

    // Track months for labels
    const monthPositions: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0]
      const count = dataMap.get(dateStr) ?? 0

      // Track month changes
      if (current.getMonth() !== lastMonth) {
        monthPositions.push({
          month: current.toLocaleDateString("en-US", { month: "short" }),
          weekIndex: weeks.length,
        })
        lastMonth = current.getMonth()
      }

      currentWeek.push({ date: dateStr, count })

      // Start a new week on Sunday
      if (current.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      current.setDate(current.getDate() + 1)
    }

    // Push remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return { weeks, monthLabels: monthPositions, todayStr }
  }, [practiceData])

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activity This Year</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Month labels */}
            <div className="mb-1 flex pl-8">
              {monthLabels.map((m, i) => (
                <div
                  key={`${m.month}-${i}`}
                  className="text-xs text-muted-foreground"
                  style={{
                    marginLeft: i === 0 ? `${m.weekIndex * 14}px` : undefined,
                    width:
                      i < monthLabels.length - 1 ? `${(monthLabels[i + 1].weekIndex - m.weekIndex) * 14}px` : "auto",
                  }}
                >
                  {m.month}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[2px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] pr-1">
                {dayLabels.map((label, i) => (
                  <div key={i} className="flex h-[10px] md:h-[12px] items-center text-[10px] text-muted-foreground">
                    {label}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {/* Fill empty days at start of first week */}
                  {weekIndex === 0 &&
                    week.length < 7 &&
                    Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-[10px] w-[10px] md:h-[12px] md:w-[12px]" />
                    ))}
                  {week.map((day) => (
                    <HeatmapCell
                      key={day.date}
                      date={day.date}
                      count={day.count}
                      isToday={day.date === todayStr}
                      onClick={onDateClick ? () => onDateClick(day.date) : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-[2px]">
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-muted" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-200" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-400" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-600" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
