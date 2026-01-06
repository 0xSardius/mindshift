# Practice Heatmap Feature - Added to Mindshift

**Date:** November 22, 2024  
**Feature:** GitHub-style contribution heatmap  
**Phase:** Week 5, Day 3-4  
**Effort:** 4-6 hours

---

## What Was Added

A **GitHub-style contribution heatmap** showing daily practice activity over the last 365 days.

### Visual Example

```
Activity This Year

    Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
Mon ⬜ 🟩 🟩 🟩 ⬜ 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...
Tue 🟩 🟩 🟩 ⬜ 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...
Wed 🟩 🟩 🟩 🟩 🟩 🟩 ⬜ 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...
Thu 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ⬜ 🟩 🟩 ...
Fri 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...
Sat ⬜ 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...
Sun 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 🟩 ...

Less ⬜ 🟩 🟩 🟩 More
```

---

## Why This Feature

✅ **Proven pattern** - GitHub, Duolingo, Streaks all use it  
✅ **Visual motivation** - See consistency at a glance  
✅ **Streak reinforcement** - Green squares feel rewarding  
✅ **Pattern insights** - "I always skip weekends" → awareness  
✅ **Shareable** - Users screenshot and share progress  
✅ **Not complex** - Simple grid colored by practice count

---

## Where It Lives

**Location:** Profile screen (after TierCard, before Badges section)

**Profile Layout:**

```
[Avatar & Name]          [Edit]

[Stats Grid: Streak, XP, Practices, Reps]

[TierCard: EXPERT ⚡ Level 32]

┌─────────────────────────────┐
│  Activity This Year          │ ← NEW
│  [GitHub-style grid]         │
│  Less ⬜ 🟩 🟩 🟩 More       │
└─────────────────────────────┘

[Badges Section]

[Settings Section]
```

---

## Technical Implementation

### 1. Convex Query

```typescript
// convex/queries.ts

export const getPracticeHeatmap = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get authenticated user
    // 2. Query practices from last 365 days
    // 3. Group by date (YYYY-MM-DD)
    // 4. Count practices per day
    // 5. Return array of { date, count }
  },
});

// Returns:
[
  { date: "2024-11-22", count: 3 },
  { date: "2024-11-21", count: 1 },
  { date: "2024-11-20", count: 0 },
  // ... 365 days
];
```

### 2. React Component

```typescript
// components/profile/practice-heatmap.tsx

export function PracticeHeatmap() {
  const data = useQuery(api.queries.getPracticeHeatmap);

  // Generate 365 days
  // Fill missing dates with count: 0
  // Group into weeks (7 days each)
  // Render grid of squares
  // Color by threshold
  // Show tooltips on hover

  return (
    <div>
      <h3>Activity This Year</h3>
      <div className="heatmap-grid">
        {weeks.map(week => (
          <div className="week">
            {week.map(cell => (
              <Tooltip>
                <div
                  className="cell"
                  style={{ backgroundColor: getColor(cell.count) }}
                />
                <TooltipContent>
                  {cell.count} practices on {formatDate(cell.date)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
      <Legend />
    </div>
  );
}
```

### 3. Color Thresholds

```typescript
function getColor(count: number): string {
  if (count === 0) return "#ebedf0"; // Light gray
  if (count <= 2) return "#9be9a8"; // Light blue
  if (count <= 4) return "#40c463"; // Medium blue
  return "#30a14e"; // Dark blue (5+)
}
```

---

## Data Structure

### Input (from Convex)

```typescript
Array<{ date: string; count: number }>;

Example: [
  { date: "2024-11-22", count: 3 },
  { date: "2024-11-21", count: 1 },
  { date: "2024-11-20", count: 0 },
];
```

### Processed (in Component)

```typescript
interface HeatmapCell {
  date: string; // '2024-11-22'
  count: number; // 0-N practices
  color: string; // Hex color code
}

// Grouped into weeks
Array<Array<HeatmapCell>>; // 52 weeks × 7 days
```

---

## UI/UX Details

### Desktop View

- Grid: 52 columns (weeks) × 7 rows (days)
- Cell size: 12×12px
- Spacing: 2px gap
- Hover: Tooltip with date and count
- Total width: ~700px

### Mobile View

- Grid: Same structure
- Cell size: 10×10px (smaller)
- Horizontal scroll if needed
- Tap: Tooltip appears
- Total width: ~600px (scrollable)

### Color Scheme (Mindshift Blue)

- 0 practices: `#ebedf0` (gray)
- 1-2 practices: `#9be9a8` (light blue)
- 3-4 practices: `#40c463` (medium blue)
- 5+ practices: `#30a14e` (dark blue)

_(Can swap to green for classic GitHub look)_

### Interactions

- **Hover:** Tooltip shows "3 practices on Nov 22, 2024"
- **Click:** Optional - filter practices by date (deferred to V2)
- **Current day:** Subtle border highlight
- **Today's practices:** Updates in real-time (Convex reactivity)

---

## Build Order Integration

### Phase 5, Day 3-4: Practice Heatmap & Mobile Optimization (8 hours)

**Tasks:**

1. ✅ Build heatmap component (v0 or custom)
2. ✅ Create getPracticeHeatmap query
3. ✅ Add to Profile screen
4. ✅ Test with various data patterns
5. ✅ Mobile optimization

**Time Breakdown:**

- Query creation: 1 hour
- Component development: 2-3 hours
- Integration & styling: 1-2 hours
- Testing & polish: 1-2 hours
- **Total: 5-8 hours**

---

## Future Enhancements (V2)

### 1. Streak Stats

```
Activity This Year

[Heatmap grid]

🔥 Longest streak: 45 days (Oct 1 - Nov 14)
⚡ Current streak: 7 days
📊 Total practices: 234
```

### 2. Month View Toggle

```
[Button: Show Last 30 Days]

Larger squares (16×16px)
More detail visible
Less scrolling
```

### 3. Share Feature

```
[Share Button]

Generates image:
┌────────────────────────────┐
│ @username's 2024           │
│ [Full heatmap]             │
│ 234 practices • 45-day peak│
└────────────────────────────┘

Post to Twitter/Farcaster
```

### 4. Click to Filter

```
Click a square → Show practices from that date:

Nov 22, 2024
• "I am capable..." (practiced 2x)
• "I speak clearly..." (practiced 1x)
```

### 5. Achievement Badges

```
New badges triggered by patterns:
- "Perfect Week" - 7 green squares
- "Perfect Month" - 30 green squares
- "Consistency Champion" - 90 days no gaps
- "Weekend Warrior" - Every Sat/Sun for month
```

---

## Testing Plan

### Test Cases

**1. Empty State (New User)**

- Shows 365 gray squares
- Tooltip: "0 practices on [date]"

**2. Sparse Data**

- Few blue squares scattered
- Most squares gray
- Pattern shows inconsistency

**3. Consistent User**

- Many blue squares
- Current streak visible
- Motivating to maintain

**4. Edge Cases**

- Today updates in real-time
- Leap years handled (366 days)
- Timezone consistency
- Missing dates filled with 0

**5. Mobile**

- Horizontal scroll works
- Squares tappable at 10×10px
- Tooltip positions correctly
- No layout breaks

---

## Performance Considerations

### Optimization Strategies

**1. Data Processing**

```typescript
// Use useMemo to avoid recalculating
const cells = useMemo(() => {
  return generateLast365Days().map((date) => ({
    date,
    count: practiceMap.get(date) || 0,
  }));
}, [data]);
```

**2. Render Optimization**

```typescript
// Memo individual cells
const HeatmapCell = React.memo(({ date, count }) => {
  return <div style={{ backgroundColor: getColor(count) }} />;
});
```

**3. Query Optimization**

- Index on `userId` + `practicedAt`
- Query once on mount
- Convex reactivity updates automatically
- Cache results for 1 hour (optional)

**4. Bundle Size**

- ~5KB for component code
- Minimal deps (uses existing Shadcn)
- No heavy libraries

---

## Success Metrics

### Engagement

- % of users who view Profile screen (heatmap visible)
- Average time on Profile screen (increases?)
- Screenshots shared on social media

### Motivation

- Does seeing gaps motivate practice?
- Do users with >50% filled squares have higher retention?
- Correlation between visual consistency and actual consistency

### Feedback

- User requests for month view
- User requests for share feature
- User requests for more stats

---

## Implementation Checklist

**Convex Backend:**

- [ ] Create `getPracticeHeatmap` query
- [ ] Test query with various user data
- [ ] Add index for performance
- [ ] Handle timezone edge cases

**React Component:**

- [ ] Build heatmap grid component
- [ ] Add tooltips with dates
- [ ] Implement color thresholds
- [ ] Add legend
- [ ] Responsive mobile view
- [ ] Loading state
- [ ] Empty state

**Integration:**

- [ ] Add to Profile screen
- [ ] Test with real data
- [ ] Test on mobile devices
- [ ] Polish styling
- [ ] Add to v0 Ambassador content

**Testing:**

- [ ] Empty state (new user)
- [ ] Sparse data
- [ ] Consistent data
- [ ] Current day updates
- [ ] Mobile responsive
- [ ] Performance (365 cells)

---

## Why This is Worth It

**Effort:** 5-8 hours  
**Value:** High

**Benefits:**

1. ✅ Visual motivation (proven to work)
2. ✅ Shareable content (organic marketing)
3. ✅ Pattern awareness (helps users improve)
4. ✅ Differentiation (competitors don't have this)
5. ✅ Low maintenance (build once, works forever)

**Cost-Benefit:**

- One day of work
- Permanent feature
- High user engagement
- Unique to Mindshift

**Verdict:** Definitely worth building in Phase 5.

---

## Resources

**Inspiration:**

- GitHub contribution graph
- Duolingo streak calendar
- Streaks app heatmap
- Apple Watch activity rings

**Libraries (if needed):**

- react-calendar-heatmap (optional, can build custom)
- recharts (overkill for this)
- Custom implementation (recommended)

**Tutorials:**

- Building a GitHub-style heatmap in React
- D3.js heatmap examples (for reference)

---

## Summary

**What:** GitHub-style contribution heatmap showing 365 days of practice activity  
**Where:** Profile screen, after TierCard  
**When:** Phase 5, Day 3-4 (Week 5 of build)  
**Why:** Visual motivation, proven pattern, high engagement  
**How:** Convex query + React component + color thresholds  
**Effort:** 5-8 hours  
**Value:** High (unique differentiator, motivational, shareable)

**Status:** ✅ Added to Build Order v3

---

**Created:** November 22, 2024  
**Updated Build Order:** mindshift-build-order-v3-final.md  
**Next:** Follow Phase 5, Day 3-4 to implement
