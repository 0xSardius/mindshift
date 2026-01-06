# Mindshift - v0 Prompt Library

**Version:** 1.0  
**Date:** November 22, 2024  
**Purpose:** Complete collection of v0 prompts for building Mindshift UI

---

## Table of Contents

1. [Core Screens](#core-screens)
   - Dashboard
   - Transform Screen
   - Practice Screen
   - Library Screen
   - Leaderboard Screen
   - Profile Screen
2. [Shared Components](#shared-components)
   - TierCard
   - CelebrationModal
   - Practice Heatmap
   - Loading States
3. [Marketing Pages](#marketing-pages)
   - How It Works
   - Pricing Page

---

## Core Screens

### 1. Dashboard (Home Screen)

```
Build Dashboard home screen with tier progress card, quick practice list, and stats.

Used by daily users,
in the moment they open the app,
to see their progress, maintain their streak, and quickly practice an affirmation.

Components:
- TierCard: Shows current tier (EXPERT ⚡), level (32), XP progress bar, streak (45 days), total XP (8,465)
- QuickPractice section: List of 3 recent affirmations with "Practice →" buttons
- TodayProgress: Checklist (Practice goal, Maintain streak)
- Primary CTA: "Create New Affirmation" button (large, prominent)
- Bottom navigation: Home, Create, Library, Leaderboard, Profile icons

Data displayed:
- user.level, user.tier (NOVICE/APPRENTICE/PRACTITIONER/EXPERT/MASTER)
- user.currentStreak, user.totalXP
- Recent 3 affirmations (text, timesPracticed, lastPracticedAt)
- Today's practice count

Actions:
- Navigate to /transform (Create button)
- Navigate to /practice/[id] (Practice buttons)
- Navigate to /library (View all link)

Constraints:
- Platform: Mobile-first PWA (iOS/Android browsers)
- Visual tone: Calm, encouraging, minimal. Tier color accents (gold for Expert). Clean cards with subtle shadows.
- Layout: Vertical scroll, fixed bottom nav, tier card most prominent at top
- Tier colors: Novice=gray, Apprentice=blue, Practitioner=purple, Expert=gold, Master=red
- Use Shadcn UI components: Card, Button, Progress, Badge
```

---

### 2. Transform Screen (Create Affirmation)

```
Build affirmation creation flow with AI generation.

Used by users experiencing negative self-talk,
in the moment they want to transform a negative thought,
to receive personalized affirmation options and save one to practice.

Components:
Phase 1 - Input:
- Large heading: "What negative thought do you want to quit?"
- Tall textarea (150px min-height, auto-focus)
- Character counter (0/500)
- Primary button: "Generate Affirmations →" (disabled until 10+ chars)
- Helper text: "Our AI creates personalized affirmations using proven CBT principles"

Phase 2 - Selection (after API call):
- Heading: "Choose Your Affirmation"
- Subheading: "Select the one that resonates most"
- Radio button list showing 3-5 AI-generated affirmations
- Each option: full affirmation text, radio on left
- Optional text input: "Or write your own" (for customization)
- Two buttons: "Save & Practice" (primary), "Save to Library" (secondary)

Loading state:
- Spinner with text: "Creating your personalized affirmations..."
- Subtle pulse animation

Error state:
- Friendly error message
- "Try Again" button

Data:
- Input: negativeThought (string)
- Output from /api/generate: { analysis, affirmations[] }
- Selected: affirmationText, analysis data

Actions:
- POST /api/generate with negativeThought
- Create affirmation in Convex with selected text + analysis
- Navigate to /dashboard/practice/[id]

Constraints:
- Platform: Mobile-first PWA, works offline (service worker caches UI)
- Visual tone: Supportive, calm. Blue primary color (#3b82f6). Generous white space.
- Layout: Single column, full-width on mobile, max-width 600px on desktop
- Typography: Large readable fonts (16px base, 24px for affirmations)
- Use Shadcn: Textarea, Button, RadioGroup, Card, Spinner
```

---

### 3. Practice Screen

```
Build typing practice session with progress tracking.

Used by users ready to practice,
in the moment they want to reinforce an affirmation,
to type it 10 times, earn XP, and maintain their streak.

Components:
- Header: "Practice Session" with back button
- Affirmation display: Large text (24px, semibold, centered) showing affirmation to type
- Instruction: "Type your affirmation 10 times"
- Large textarea (120px height, auto-focus, monospace font for typing)
- Progress section:
  - Progress bar (0-100%, animates on each completion)
  - Text: "Progress: 6/10"
  - XP counter: "🎯 60 XP earned so far" (increments +10 per rep)
- Timer: "⏱️ 2:34" (running timer, top-right)
- Bottom actions: "Pause" (secondary), "Skip" (text, gray)

Visual feedback on match:
- Green flash animation on input
- Haptic vibration (navigator.vibrate)
- Clear input immediately
- Progress bar fills smoothly
- XP counter animates up

Completion state (modal):
- Large emoji: 🎉
- Heading: "Practice Complete!"
- XP earned: "+100 XP" (large, primary color)
- Streak status: "🔥 7-day streak maintained!" (if applicable)
- Badge notifications if earned
- Two buttons: "Practice Another" (primary), "Back to Home" (secondary)

Data:
- affirmationText (string to match against)
- currentInput (user typing)
- completedReps (0-10)
- startTime, elapsedSeconds
- xpEarned (calculated)

Actions:
- Track each keystroke, compare to affirmationText (case-insensitive, trimmed)
- On match: increment reps, clear input, update progress
- On complete: call completePractice mutation
- Show celebration modal with results

Constraints:
- Platform: Mobile-first, keyboard handling crucial
- Visual tone: Encouraging, game-like. Progress bar fills with smooth spring animation.
- Layout: Affirmation prominent at top, input centered, progress always visible
- Performance: No lag between typing and validation
- Accessibility: Screen reader announces progress updates
- Use Shadcn: Textarea, Progress, Button, Dialog
- Use Framer Motion for progress animations
```

---

### 4. Library Screen

```
Build affirmation library with search and filtering.

Used by users managing their affirmations,
in the moment they want to find, practice, or organize affirmations,
to search, filter, and take actions on their collection.

Components:
- Header: "Your Affirmations"
- Search bar: Icon 🔍, placeholder "Search affirmations..."
- Filter tabs: "Recent (23)", "Most Practiced", "Archived"
- Affirmation list (vertical scroll):
  - Each card shows:
    - Checkmark icon if practiced today (✓, green)
    - Full affirmation text (wrapping, readable)
    - Stats: "Practiced 12 times • Last: Today" (gray, small)
    - Three buttons:
      - "Practice" (primary, blue)
      - "Edit" (secondary, outline)
      - "Archive" (text, gray)
  - Cards have hover shadow effect
  - Spacing between cards for tap targets

Empty state (if no affirmations in filter):
- Illustration or emoji (🌱)
- Text: "No affirmations yet" or "No archived affirmations"
- Button: "Create Affirmation" (if Recent tab)

Data:
- affirmations[] filtered by: search text, sort order, archived status
- Each affirmation: id, text, timesPracticed, lastPracticedAt, archived

Actions:
- Search: filter affirmations client-side by text
- Sort tabs: Recent (createdAt desc), Most Practiced (timesPracticed desc), Archived (archived=true)
- Practice button: navigate to /practice/[id]
- Edit button: inline edit or modal to update affirmationText
- Archive button: call archiveAffirmation mutation, slide-out animation

Constraints:
- Platform: Mobile-first, smooth scrolling for long lists
- Visual tone: Organized, clean. Cards with subtle borders.
- Layout: Search sticky at top, tabs below, scrollable list
- Tap targets: Buttons spaced 8px apart minimum
- Animations: Slide-out on archive (Framer Motion)
- Use Shadcn: Input (search), Tabs, Card, Button
```

---

### 5. Leaderboard Screen

```
Build competitive leaderboard with real-time rankings.

Used by motivated users,
in the moment they want to see how they compare to others,
to view rankings, find their position, and get motivated to practice more.

Components:
- Header: "Leaderboard 🏆"
- Tab navigation: "Weekly" (active), "Monthly", "All-Time"
- Leaderboard list (scrollable):
  - Top 3 get medals: 🥇 🥈 🥉 (larger, special styling)
  - Each row shows:
    - Rank number (or medal for top 3)
    - Tier icon: 🌱 💫 💪 ⚡ 🏆
    - Username (or "Anonymous User")
    - Level (small, gray text)
    - Total reps (right-aligned, bold)
  - Current user row: Highlighted with blue background, slightly larger
  - Rows have subtle hover effect

User rank card (sticky at bottom):
- Shows: "Your Rank: #23 of 1,247 users"
- Gap to next: "145 reps to reach #22! 🎯"
- Privacy toggle: "☑ Show as Anonymous User" (Switch)

Loading state:
- Skeleton rows (10 rows with shimmer animation)

Data:
- leaderboard[] from Convex query (weekly/monthly/all-time)
- Each entry: userId, username, totalReps, level, tierIcon
- currentUserRank from separate query
- realTimeUpdates: Convex reactive query updates automatically

Actions:
- Tab switch: load different leaderboard query
- Privacy toggle: update user.anonymousMode
- Auto-refresh: Convex subscription provides real-time updates

Constraints:
- Platform: Mobile-first, infinite scroll for long lists
- Visual tone: Competitive but friendly. Gold accents for top 3.
- Layout: Tabs at top, sticky bottom card, scrollable middle
- Performance: Virtualized list if >100 entries
- Real-time: Updates within 1-2 seconds of practice completion
- Use Shadcn: Tabs, Card, Switch, ScrollArea
```

---

### 6. Profile Screen

```
Build user profile with stats, badges, and settings.

Used by users checking their progress,
in the moment they want to see achievements or update settings,
to view stats, manage badges, and configure app preferences.

Components:
- Header: User avatar (Clerk) and name, Edit button (top-right)
- Stats grid (2x2 cards):
  - "🔥 45 days" (Current Streak)
  - "⚡ 8,465 XP" (Total XP)
  - "🎯 123" (Total Practices)
  - "📊 2,456" (Total Reps)
- TierCard (compact): Shows tier, level, progress to next level
- Badges section:
  - Heading: "Badges (5/15)"
  - Horizontal scroll of badge icons (48px each)
  - Link: "View All Badges →" (navigates to /profile/badges)
- Settings section (list items):
  - "Daily reminder" (toggle switch, shows time if enabled)
  - "Practice goal" (shows current, e.g. "1 per day", tappable)
  - "Privacy settings" (chevron right)
  - "Account settings" (chevron right, links to Clerk)
- Upgrade card (if free tier):
  - Highlighted card with gradient
  - "Upgrade to Pro ⭐"
  - Benefits list
  - CTA button
- Bottom: "Sign Out" button (red, destructive variant)

Data:
- user: level, tier, totalXP, currentStreak
- stats: totalPractices (count), totalReps (sum)
- badges: earned badges (array)
- settings: reminderEnabled, reminderTime, dailyPracticeGoal

Actions:
- Edit profile: Opens Clerk user profile
- Toggle reminder: Update user.reminderEnabled
- Tap practice goal: Modal to change dailyPracticeGoal
- Privacy settings: Navigate to privacy page
- View badges: Navigate to /profile/badges
- Upgrade: Navigate to /upgrade
- Sign out: Clerk signOut()

Constraints:
- Platform: Mobile-first, vertical scroll
- Visual tone: Personal, achievement-focused. Use tier colors for accents.
- Layout: Sections with clear dividers, cards for stats
- Settings: iOS-style list with switches/chevrons
- Badge scroll: Horizontal scroll with momentum
- Use Shadcn: Card, Avatar, Switch, Button, ScrollArea
```

---

## Shared Components

### 7. TierCard Component

```
Build a tier progress card component.

Used by users on dashboard and profile,
in the moment they want to see their level progress,
to understand their current tier and progress to next tier.

Shows:
- Tier name and icon (EXPERT ⚡)
- Current level (32)
- Progress bar to next level
- Tier progress text ("2/10 to Master")
- Streak and total XP in bottom row

Props: level (number), totalXP (number), currentStreak (number)

Constraints:
- Platform: Reusable component
- Visual tone: Card background tinted to tier color (20% opacity)
- Use Shadcn: Card, Progress
- Framer Motion for smooth value changes
```

---

### 8. CelebrationModal Component

```
Build celebration modal for practice completion.

Used by users completing practice,
in the moment they finish typing 10 reps,
to celebrate their achievement and see what they earned.

Variants:
1. Standard: Practice complete, show XP, streak status
2. Level up: Show new level, tier icon
3. Tier change: HUGE modal with confetti, new tier announcement
4. Milestone: Every 10 levels, special rewards

Shows:
- Emoji (🎉 standard, tier icon for tier change)
- Title
- XP earned (large, animated)
- Streak status if maintained
- New badges if earned
- Action buttons

Props: celebrationType, xpEarned, newLevel, oldLevel, streakMaintained, currentStreak, newBadges, milestone

Constraints:
- Platform: Modal overlay
- Visual tone: Celebratory, confetti for major milestones
- Animations: Framer Motion (scale, rotate, fade)
- Use Shadcn: Dialog, Button
- Include react-confetti-explosion for tier changes
```

---

### 9. Practice Heatmap (GitHub-style)

```
Build a GitHub-style contribution activity heatmap component.

Used by users viewing their profile,
in the moment they want to see their practice consistency over time,
to visualize daily practice patterns and stay motivated.

Components:
- Title: "Activity This Year"
- Heatmap grid:
  - 52 columns (weeks)
  - 7 rows (days, Mon-Sun)
  - Each cell is a small square (12x12px)
  - Cells colored by practice count:
    - 0 practices: light gray (#ebedf0)
    - 1-2 practices: light blue (#9be9a8)
    - 3-4 practices: medium blue (#40c463)
    - 5+ practices: dark blue (#30a14e)
  - Hover tooltip: "3 practices on Nov 22, 2024"
  - Current date highlighted with border
- Month labels: Jan, Feb, Mar... (at top)
- Legend at bottom:
  - "Less" ⬜ 🟩 🟩 🟩 🟩 "More"
  - Shows color scale

Interactions:
- Hover over cell: tooltip with date and count
- Click cell: optional filter by date
- Responsive: smaller cells on mobile (10x10px)

Data props:
- practiceData: Array<{ date: string, count: number }>
  - Example: [{ date: '2024-11-22', count: 3 }, ...]
  - Covers last 365 days

Logic:
- Fill in missing dates with count: 0
- Sort chronologically
- Group by week (Sunday start)
- Determine color based on count thresholds

Constraints:
- Platform: Desktop and mobile responsive
- Visual tone: Clean, GitHub-inspired. Blue gradient matches Mindshift brand.
- Layout: Horizontal scroll on mobile if needed
- Accessibility: Tooltip text for screen readers
- Performance: Render 365 cells efficiently (React.memo)
- Use Shadcn: Tooltip, Card
```

---

### 10. Loading States (Skeletons)

```
Create skeleton loading components for each screen.

DashboardSkeleton:
- TierCard skeleton (rectangle, animated shimmer)
- 3 affirmation card skeletons
- Progress section skeletons

LeaderboardSkeleton:
- 10 rows with shimmer effect
- Rank + name + stats placeholder

LibrarySkeleton:
- Search bar skeleton
- 5 card skeletons

Use Shadcn Skeleton component.
Shimmer animation (gradient moving left to right).
Match actual component dimensions.
```

---

## Marketing Pages

### 11. How It Works Page

```
Build a "How It Works" educational page for a mental health app.

Used by potential and new users,
in the moment they want to understand if this will work for them,
to learn the methodology and decide to commit to daily practice.

Layout:

1. Hero Section:
   - Heading: "How Mindshift Works"
   - Subheading: "The science-backed approach to transforming negative self-talk"
   - Illustration: Brain with transformation visual

2. The Problem Section:
   - Heading: "Your Mind Runs 77,000 Thoughts Per Day"
   - 3 stat cards:
     - "77% are negative" (red tint)
     - "95% are repetitive" (gray tint)
     - "Most go unnoticed" (blue tint)
   - Body text: "These automatic negative thoughts shape your reality, relationships, and self-image. But you can reprogram them."

3. The Science Section:
   - Heading: "Why Manual Typing Works"
   - Timeline/steps visual:
     Step 1: "Neural Pathways"
       - Body: "Your brain has grooves for negative thoughts. Like paths in a forest from repeated walking."
     Step 2: "Active Engagement"
       - Body: "Manual typing forces full attention. You can't type 'I am capable' while thinking 'I'm worthless.'"
     Step 3: "Repetition Rewires"
       - Body: "New neural pathways form through repetition. 10 reps creates the new groove."
     Step 4: "Pattern Replacement"
       - Body: "Over 30 days, the positive pattern becomes automatic. The old pathway weakens."
   - Citation: "Based on Self-Talk Solution by Shad Helmstetter, PhD and Cognitive Behavioral Therapy principles"

4. The Method Section:
   - Heading: "How Mindshift Works"
   - 4 cards with icons:
     Card 1: "🤖 AI Transformation"
       - "Enter your negative thought"
       - "Get personalized affirmations based on CBT principles"
       - "Choose the one that resonates"
     Card 2: "✍️ Active Practice"
       - "Type your affirmation 10 times"
       - "Manual typing engages brain fully"
       - "Takes 2-3 minutes"
     Card 3: "🎮 Build Consistency"
       - "Earn XP and maintain your streak"
       - "Level up through 50 levels"
       - "Compete on leaderboards"
     Card 4: "📈 Track Progress"
       - "See your practice patterns"
       - "Unlock achievement badges"
       - "Watch neural pathways strengthen"

5. The Benefits Section:
   - Heading: "What You'll Experience"
   - 2-column grid:
     Left: Timeline
       - "Week 1: Awareness increases"
       - "Week 2: Automatic thoughts slow"
       - "Week 3: New patterns emerge"
       - "Week 4: Positive self-talk becomes natural"
     Right: Benefits list
       - "✓ Reduced negative self-talk"
       - "✓ Increased self-confidence"
       - "✓ Better stress management"
       - "✓ Improved relationships"
       - "✓ Greater emotional resilience"

6. Why Different Section:
   - Heading: "Why Mindshift vs Other Apps?"
   - Comparison table:
     Feature | Other Apps | Mindshift
     Affirmations | Generic | AI-personalized
     Method | Passive reading | Active typing
     Motivation | None | Gamification
     Accountability | Solo | Community leaderboard
     Progress | Unclear | Visual (GitHub-style heatmap)

7. Get Started Section:
   - Heading: "Start Your Transformation Today"
   - Two paths:
     Path 1: "Free Forever"
       - "5 transformations/month"
       - "Practice unlimited"
       - "Basic leaderboard"
       - Button: "Start Free"
     Path 2: "Go Pro - $4.99/mo"
       - "Unlimited transformations"
       - "Advanced analytics"
       - "Custom categories"
       - Button: "Start Free Trial"

8. FAQ Section (accordion):
   - "How long does it take to see results?" (2-4 weeks)
   - "Why typing instead of reading?" (Active vs passive)
   - "Is the science proven?" (Yes, CBT + neuroscience)
   - "What if I miss a day?" (Streak resets but progress saved)
   - "Can I cancel anytime?" (Yes, keep free tier)

Design Constraints:
- Platform: Responsive web (mobile-first)
- Visual tone: Educational, trustworthy, calm. Use diagrams and visuals.
- Layout: Long-form content, scannable sections, generous spacing
- Colors: Blue primary (#3b82f6), use success green for benefits
- Typography: Readable (18px body), clear headings
- CTAs: Multiple "Start Free" buttons throughout
- Use Shadcn: Card, Accordion, Button, Badge components
```

---

### 12. Pricing Page

```
Build a pricing comparison page with three tiers.

Used by users evaluating the app,
in the moment they're deciding whether to upgrade,
to understand value and choose the right plan.

Layout:

1. Header:
   - Heading: "Simple, Transparent Pricing"
   - Subheading: "Start free. Upgrade when you're ready."
   - Toggle: "Monthly" / "Annual" (Annual shows "Save 17%")

2. Three-tier comparison (cards side-by-side on desktop, stacked on mobile):

   FREE Card:
   - Badge: "Forever Free"
   - Price: "$0"
   - Description: "Perfect for getting started"
   - Features list (checkmarks):
     ✓ 5 transformations per month
     ✓ Unlimited practice sessions
     ✓ Full gamification
     ✓ Leaderboard access
     ✓ Activity heatmap
     ✓ Basic stats
   - Button: "Start Free" (secondary style)

   PRO Card (highlighted, slightly elevated):
   - Badge: "⭐ Most Popular"
   - Price: "$4.99/mo" (or "$49/yr" if annual selected)
   - Description: "For serious practitioners"
   - Features list:
     ✓ Everything in Free
     ✓ Unlimited transformations
     ✓ Advanced analytics
     ✓ Custom categories
     ✓ Export affirmations
     ✓ Priority support
     ✓ Dark mode
   - Button: "Start 7-Day Free Trial" (primary style)
   - Note: "No credit card required"

   ELITE Card (grayed out):
   - Badge: "Coming Soon"
   - Price: "$9.99/mo"
   - Description: "For coaches & power users"
   - Features list:
     ✓ Everything in Pro
     ✓ AI coaching insights
     ✓ Pattern analysis
     ✓ Team sharing
     ✓ Coach dashboard
     ✓ API access
   - Button: "Join Waitlist" (ghost style)

3. Feature Comparison Table:
   - Expandable section: "Compare all features"
   - Table with checkmarks showing feature availability
   - Rows: All features from above
   - Columns: Free | Pro | Elite

4. FAQ Section (accordion):
   - "Can I upgrade or downgrade anytime?" (Yes, immediately)
   - "What happens if I downgrade?" (Keep data, lose Pro features)
   - "Do you offer refunds?" (7-day money-back guarantee)
   - "Is my payment secure?" (Stripe, industry standard)
   - "What payment methods?" (Credit card, Apple Pay, Google Pay)

5. Trust Signals:
   - Icons with text:
     - "💳 Secure payment via Stripe"
     - "🔒 Cancel anytime"
     - "💯 7-day money-back guarantee"
     - "🎯 No hidden fees"

6. Bottom CTA:
   - Heading: "Still not sure? Start free."
   - Text: "Try Mindshift free forever. Upgrade only when you're ready."
   - Button: "Create Free Account"

Design Constraints:
- Platform: Responsive (mobile-first)
- Visual tone: Trustworthy, clear, no tricks. Highlight Pro card.
- Layout: Cards side-by-side on desktop (max 1200px), stacked on mobile
- Colors: Pro card has blue accent border, slight shadow elevation
- Typography: Clear pricing ($4.99 in large font), features readable
- CTAs: Primary blue for Pro, secondary for Free, ghost for Elite
- Use Shadcn: Card, Button, Badge, Accordion, Switch (monthly/annual)
- Animations: Hover effect on cards (lift slightly)
```

---

## Usage Instructions

### How to Use These Prompts

1. **Copy the prompt** for the screen/component you want to build
2. **Open v0.dev** in your browser
3. **Paste the entire prompt** into v0
4. **Generate** and review the output
5. **Download code** when satisfied
6. **Integrate** into your Next.js app

### Tips for Best Results

**Before generating:**

- Read the full prompt to understand what will be generated
- Modify colors/styles if you want different branding
- Add specific requirements if needed

**After generating:**

- Download the code immediately
- Test in your local environment
- Wire up Convex data connections
- Add real actions/mutations

**If output isn't right:**

- Regenerate with small tweaks to prompt
- Or edit the downloaded code manually
- v0 is a starting point, not final code

### Build Order

**Recommended generation order:**

1. Dashboard (see the whole app vision)
2. Transform Screen (core creation flow)
3. Practice Screen (core mechanic)
4. TierCard + CelebrationModal (shared components)
5. Library Screen
6. Leaderboard Screen
7. Profile Screen
8. Practice Heatmap (Week 5 polish)
9. How It Works (Week 8 launch)
10. Pricing Page (Week 8 launch)

---

## Design System Reference

### Colors

**Tier Colors:**

- Novice: `#94a3b8` (Gray)
- Apprentice: `#3b82f6` (Blue)
- Practitioner: `#8b5cf6` (Purple)
- Expert: `#f59e0b` (Gold)
- Master: `#ef4444` (Red)

**Semantic Colors:**

- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Warning: `#eab308` (Yellow)

### Typography

- Base: 16px
- Headings: Semibold, larger sizes
- Small text: 14px for secondary info
- Affirmations: 24px, readable

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Components

All prompts use **Shadcn UI** components:

- Card, Button, Input, Textarea
- Dialog, Sheet, Tabs
- Progress, Badge, Avatar
- Tooltip, Accordion, Switch

---

## Notes

- All prompts are mobile-first
- All prompts specify Shadcn UI
- Tier colors are consistent across all screens
- Bottom nav appears on all main screens
- Loading states use skeleton components

**Last Updated:** November 22, 2024  
**Ready to use:** Copy/paste into v0.dev  
**Next:** Start with Dashboard screen
