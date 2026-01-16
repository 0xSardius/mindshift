"use client"

import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900"
    if (count <= 4) return "bg-emerald-400 dark:bg-emerald-700"
    return "bg-emerald-600 dark:bg-emerald-500"
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day)
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

// Helper to format date as YYYY-MM-DD without timezone issues
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const PracticeHeatmap = memo(function PracticeHeatmap({ practiceData, onDateClick }: PracticeHeatmapProps) {
  const [yearOffset, setYearOffset] = useState(0) // 0 = current year, -1 = last year, etc.

  const { weeks, monthLabels, todayStr, displayYear, totalPractices, canGoNext } = useMemo(() => {
    const today = new Date()
    const todayStr = formatDateString(today)
    const currentYear = today.getFullYear()
    const displayYear = currentYear + yearOffset

    // Create a map for quick lookup
    const dataMap = new Map(practiceData.map((d) => [d.date, d.count]))

    // Determine date range for the selected year
    let startDate: Date
    let endDate: Date

    if (yearOffset === 0) {
      // Current year: show from Jan 1 to today
      endDate = new Date(today)
      startDate = new Date(displayYear, 0, 1) // Jan 1 of current year
    } else {
      // Previous years: show full year
      startDate = new Date(displayYear, 0, 1) // Jan 1
      endDate = new Date(displayYear, 11, 31) // Dec 31
    }

    // Align start to Sunday (start of week)
    const startDayOfWeek = startDate.getDay()
    if (startDayOfWeek !== 0) {
      startDate.setDate(startDate.getDate() - startDayOfWeek)
    }

    // Generate all dates
    const weeks: { date: string; count: number; isPlaceholder: boolean }[][] = []
    let currentWeek: { date: string; count: number; isPlaceholder: boolean }[] = []

    const current = new Date(startDate)

    // Track months for labels
    const monthPositions: { month: string; weekIndex: number }[] = []
    let lastMonth = -1
    let weekIndex = 0

    // Calculate total practices for the period
    let totalPractices = 0

    while (current <= endDate) {
      const dateStr = formatDateString(current)
      const count = dataMap.get(dateStr) ?? 0
      const isInDisplayYear = current.getFullYear() === displayYear

      if (isInDisplayYear) {
        totalPractices += count
      }

      // Track month changes (only for dates in the display year)
      if (isInDisplayYear && current.getMonth() !== lastMonth) {
        monthPositions.push({
          month: current.toLocaleDateString("en-US", { month: "short" }),
          weekIndex: weekIndex,
        })
        lastMonth = current.getMonth()
      }

      // Mark as placeholder if outside display year (for alignment)
      currentWeek.push({
        date: dateStr,
        count: isInDisplayYear ? count : 0,
        isPlaceholder: !isInDisplayYear,
      })

      // Start a new week after Saturday (day 6)
      if (current.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
        weekIndex++
      }

      current.setDate(current.getDate() + 1)
    }

    // Push remaining days in the last week
    if (currentWeek.length > 0) {
      // Pad the last week with empty cells if needed
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: "",
          count: 0,
          isPlaceholder: true,
        })
      }
      weeks.push(currentWeek)
    }

    return {
      weeks,
      monthLabels: monthPositions,
      todayStr,
      displayYear,
      totalPractices,
      canGoNext: yearOffset < 0,
    }
  }, [practiceData, yearOffset])

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {totalPractices} practice{totalPractices !== 1 ? "s" : ""} in {displayYear}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setYearOffset((prev) => prev - 1)}
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{displayYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setYearOffset((prev) => prev + 1)}
              disabled={!canGoNext}
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Month labels */}
            <div className="mb-1 flex pl-8 text-xs text-muted-foreground">
              {monthLabels.map((m, i) => {
                const nextWeekIndex = i < monthLabels.length - 1 ? monthLabels[i + 1].weekIndex : weeks.length
                const width = (nextWeekIndex - m.weekIndex) * 14
                return (
                  <div
                    key={`${m.month}-${i}`}
                    style={{ width: `${width}px` }}
                    className="shrink-0"
                  >
                    {m.month}
                  </div>
                )
              })}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[2px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] pr-1">
                {dayLabels.map((label, i) => (
                  <div
                    key={i}
                    className="flex h-[10px] md:h-[12px] items-center justify-end text-[9px] text-muted-foreground w-6"
                  >
                    {i % 2 === 1 ? label.slice(0, 1) : ""}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    day.isPlaceholder ? (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="h-[10px] w-[10px] md:h-[12px] md:w-[12px]"
                      />
                    ) : (
                      <HeatmapCell
                        key={day.date}
                        date={day.date}
                        count={day.count}
                        isToday={day.date === todayStr}
                        onClick={onDateClick ? () => onDateClick(day.date) : undefined}
                      />
                    )
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-[2px]">
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-muted" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-400 dark:bg-emerald-700" />
                <div className="h-[10px] w-[10px] md:h-[12px] md:w-[12px] rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
