# Mindshift: Build Order & Implementation Guide

**Version:** 1.0  
**Date:** November 22, 2024  
**Target:** 8-week MVP launch

---

## Table of Contents

1. [Build Philosophy](#build-philosophy)
2. [Phase 1: Foundation (Week 1)](#phase-1-foundation-week-1)
3. [Phase 2: Core Features (Week 2)](#phase-2-core-features-week-2)
4. [Phase 3: Gamification (Week 3)](#phase-3-gamification-week-3)
5. [Phase 4: Social Features (Week 4)](#phase-4-social-features-week-4)
6. [Phase 5: Polish & Animations (Week 5)](#phase-5-polish--animations-week-5)
7. [Phase 6: Monetization (Week 6)](#phase-6-monetization-week-6)
8. [Phase 7: Analytics & Email (Week 7)](#phase-7-analytics--email-week-7)
9. [Phase 8: Launch Prep (Week 8)](#phase-8-launch-prep-week-8)
10. [v0 Prompt Library](#v0-prompt-library)
11. [Cursor Prompt Library](#cursor-prompt-library)

---

## Build Philosophy

### Core Principles

**1. Vertical Slices Over Horizontal Layers**

- Build complete features end-to-end (UI → API → DB)
- Each phase delivers working functionality
- Test as you go, don't wait for "integration"

**2. MVP = Minimum _Viable_ Product**

- Every feature must be usable, not just present
- "Working but ugly" beats "beautiful but broken"
- Ship quickly, polish iteratively

**3. Data Flow First, UI Polish Later**

- Get data flowing correctly (Convex → React)
- Validate backend logic works
- Then make it pretty with animations

**4. Use Tools Efficiently**

- v0 for UI components (fast iteration)
- Cursor for backend logic (AI-assisted coding)
- Manual for critical paths (auth, payments)

**5. Test in Production Early**

- Deploy to Vercel from day 1
- Use real Clerk auth (not mocks)
- Real Anthropic API calls
- Catch issues early

---

## Phase 1: Foundation (Week 1)

**Goal:** Project setup, auth working, basic data flow established

### Day 1: Project Scaffolding (4 hours)

**Tasks:**

1. ✅ Create Next.js 14 project with TypeScript
2. ✅ Install core dependencies
3. ✅ Set up Convex project
4. ✅ Configure Clerk
5. ✅ Set up file structure
6. ✅ Initialize Git + GitHub repo
7. ✅ Deploy to Vercel (skeleton)

**Commands:**

```bash
# Create Next.js project
npx create-next-app@latest mindshift --typescript --tailwind --app --eslint

# Install dependencies
npm install convex @clerk/nextjs framer-motion class-variance-authority clsx tailwind-merge ai @ai-sdk/anthropic

# Initialize Convex
npx convex dev

# Initialize Shadcn
npx shadcn-ui@latest init

# Git setup
git init
git add .
git commit -m "Initial commit"
gh repo create mindshift --public --source=. --remote=origin
git push -u origin main

# Connect to Vercel
vercel
```

**File Structure Setup:**

```bash
mkdir -p app/\(auth\)/{login,signup}
mkdir -p app/\(dashboard\)/{transform,practice,library,leaderboard,profile}
mkdir -p components/{ui,affirmations,practice,leaderboard,profile,layout,shared}
mkdir -p convex/lib
mkdir -p lib/hooks
mkdir -p emails
```

**Cursor Prompt:**

```
Set up a Next.js 14 project with the following structure:
- App Router with (auth) and (dashboard) route groups
- Clerk auth configured with middleware
- Convex provider wrapping the app
- Basic layout.tsx with ClerkProvider and ConvexProviderWithClerk
- Create a simple landing page at app/page.tsx with a "Get Started" button

Use these exact dependencies:
- @clerk/nextjs@^5.0.0
- convex@^1.16.0
- next@^14.2.0

Create the middleware.ts file with proper Clerk configuration for protecting /dashboard routes.
```

**Verification:**

- [ ] `npm run dev` works
- [ ] Can navigate to landing page
- [ ] Clerk auth modal appears when clicking "Get Started"
- [ ] Convex dashboard shows project

---

### Day 2: Clerk Auth Integration (4 hours)

**Tasks:**

1. ✅ Configure Clerk providers
2. ✅ Set up sign-in/sign-up pages
3. ✅ Create protected route middleware
4. ✅ Build basic dashboard shell
5. ✅ Test auth flow end-to-end

**v0 Prompt for Login Page:**

```
Create a modern, mobile-first login page for a mental health app called Mindshift.

Design requirements:
- Centered card on a gradient background (blue to purple)
- App logo and tagline: "Quit negative thinking through practice"
- "Sign in to continue" heading
- Two large buttons:
  - "Continue with Google" (with Google icon)
  - "Continue with Email" (with email icon)
- Footer text: "By continuing, you agree to our Terms and Privacy Policy"
- Use Shadcn UI components (Card, Button)
- Mobile-optimized (safe area, large tap targets)
- Calm, professional aesthetic

Color palette:
- Primary: #3b82f6 (blue)
- Success: #10b981 (green)
- Background gradient: from-blue-50 to-purple-50

Export as a Next.js page component.
```

**Cursor Prompt for Auth Integration:**

```
Integrate Clerk authentication with this Next.js app:

1. Create middleware.ts that protects all /dashboard routes
2. Create app/(auth)/login/page.tsx that uses Clerk's <SignIn /> component
3. Create app/(auth)/signup/page.tsx that uses Clerk's <SignUp /> component
4. Create app/(dashboard)/layout.tsx with:
   - Auth check (redirect to /login if not authenticated)
   - Basic shell with user button in header
   - Placeholder for bottom navigation (mobile)

After sign in, redirect to /dashboard

Use Clerk's Next.js SDK properly with:
- ClerkProvider in root layout
- authMiddleware for route protection
- useUser() hook in dashboard layout
```

**Verification:**

- [ ] Can sign up with Google
- [ ] Can sign up with email
- [ ] Redirects to /dashboard after auth
- [ ] Can sign out
- [ ] Protected routes redirect to /login

---

### Day 3-4: Convex Schema & Queries (6 hours)

**Tasks:**

1. ✅ Define Convex schema
2. ✅ Write basic queries (getUser, getAffirmations)
3. ✅ Write basic mutations (createUser, createAffirmation)
4. ✅ Set up Clerk → Convex user sync
5. ✅ Test queries in Convex dashboard

**Cursor Prompt for Convex Schema:**

```
Create the Convex schema for Mindshift app in convex/schema.ts

Define these tables:

1. users table:
   - email, name, imageUrl (from Clerk)
   - username (optional, for leaderboard)
   - anonymousMode (boolean, default true)
   - currentStreak, longestStreak, lastPracticeDate
   - totalXP, level (number)
   - dailyPracticeGoal, reminderTime, reminderEnabled
   - tier (string: "free" | "pro" | "elite")
   - stripeCustomerId, stripeSubscriptionId, subscriptionStatus
   - createdAt, updatedAt (timestamps)

Indexes: by_email, by_username, by_stripe_customer

2. affirmations table:
   - userId (reference to users)
   - originalThought (string)
   - detectedLevel (optional number 1-5)
   - cognitiveDistortions (optional array of strings)
   - themeCategory (optional string)
   - affirmationText (string)
   - chosenLevel (optional number 3-5)
   - userEdited (boolean)
   - timesPracticed, totalRepetitions (numbers)
   - lastPracticedAt (optional timestamp)
   - archived (boolean)
   - createdAt, updatedAt (timestamps)

Indexes: by_user, by_user_archived, by_theme

3. practices table:
   - userId, affirmationId (references)
   - repetitions, xpEarned, durationSeconds
   - practicedAt (timestamp)

Indexes: by_user, by_affirmation, by_date

4. badges table:
   - userId (reference)
   - badgeType (string)
   - earnedAt (timestamp)

Indexes: by_user, by_user_type

Use Convex's defineSchema and defineTable with proper v (validators).
```

**Cursor Prompt for Basic Queries:**

```
Create convex/queries.ts with these queries:

1. getCurrentUser - Gets current user from Clerk identity
   - Use ctx.auth.getUserIdentity()
   - Query users table by email
   - Return user object or null

2. getAffirmations - Gets user's affirmations (not archived)
   - Takes optional { archived: boolean } arg
   - Returns list sorted by createdAt desc
   - Only returns current user's affirmations

3. getAffirmation - Gets single affirmation by ID
   - Takes { id: v.id("affirmations") }
   - Returns affirmation object

Use Convex query() helper and proper TypeScript types.
Handle auth checking (throw if not authenticated).
```

**Cursor Prompt for User Sync:**

```
Create a Convex mutation that syncs Clerk users to the users table.

When a user signs in for the first time via Clerk:
1. Check if user exists in Convex (by email)
2. If not, create user with:
   - email, name, imageUrl from Clerk
   - Default values: anonymousMode: true, tier: "free", totalXP: 0, level: 1, currentStreak: 0
3. Return the user object

This should be called from a Clerk webhook or on first dashboard load.

File: convex/mutations.ts - function name: syncUser
```

**Verification:**

- [ ] Can query users table from Convex dashboard
- [ ] Can create test affirmation via dashboard
- [ ] User is created on first sign-in
- [ ] Queries return data correctly

---

### Day 5-7: XP Calculator & Test Data (6 hours)

**Tasks:**

1. ✅ Implement XP calculator (50-level system)
2. ✅ Implement badge checker
3. ✅ Implement streak tracker
4. ✅ Seed test data
5. ✅ Manual testing of calculations

**Cursor Prompt for XP System:**

```
Create convex/lib/xp-calculator.ts implementing the 50-level XP system.

Export these constants:
- XP_COMPLETE_PRACTICE = 15
- XP_FIRST_TODAY = 10
- XP_FULL_SESSION_10 = 5
- XP_FULL_SESSION_20 = 15
- XP_NEW_AFFIRMATION = 25
- XP_MORNING_PRACTICE = 10

Export function getStreakMultiplier(streak: number): number
- Returns 1.0, 1.2, 1.5, 1.75, or 2.0 based on streak length
- 0-1 days: 1.0x
- 2-6 days: 1.2x
- 7-13 days: 1.5x
- 14-29 days: 1.75x
- 30+ days: 2.0x

Export LEVEL_THRESHOLDS array with 50 levels:
- Each entry: { level: number, xpRequired: number }
- Use the exponential curve from the PRD
- Level 1: 0 XP, Level 2: 25 XP, Level 50: 14,405 XP

Export LEVEL_TIERS object with 5 tiers (Novice, Apprentice, Practitioner, Expert, Master):
- Each tier: { levels: number[], name: string, color: string, icon: string, description: string }

Export function calculateLevel(totalXP: number): number
Export function getLevelTier(level: number)
Export function calculateXPForNextLevel(currentXP, currentLevel)
Export function calculatePracticeXP({ repetitions, streak, isFirstToday, isNewAffirmation, isMorningPractice })

Include full TypeScript types.
```

**Cursor Prompt for Badge System:**

```
Create convex/lib/badge-checker.ts

Export BADGE_TYPES object with all badge definitions from the PRD:
- FIRST_STEPS, WEEK_WARRIOR, MONTH_MASTER, etc.
- Include tier completion badges (NOVICE_COMPLETE through MASTER_COMPLETE)
- Each badge: { id, name, description, icon, criteria }

Export async function checkBadgeEligibility(ctx, userId, userStats)
- Takes user stats: { practices, totalReps, affirmations, streak, level }
- Checks which badges user is eligible for
- Returns array of badge IDs for newly earned badges (not already awarded)
- Queries existing badges from database to avoid duplicates

Use Convex database queries properly.
```

**Cursor Prompt for Test Data:**

```
Create a Convex mutation for seeding test data: convex/seed.ts

Create a test user with:
- Level 32 (Expert tier)
- 8,465 total XP
- 45-day streak
- 10 affirmations (various themes)
- 50 practice sessions
- Several badges earned

This is for development testing only. Include a check to prevent running in production.

Export as mutation named seedTestData.
```

**Verification:**

- [ ] XP calculations match expected values
- [ ] Level progression works correctly
- [ ] Badge eligibility logic works
- [ ] Streak tracking logic works
- [ ] Test data loads successfully

---

**Phase 1 Deliverable:**

- ✅ Auth working (Clerk + Convex)
- ✅ Database schema defined
- ✅ Basic queries/mutations working
- ✅ XP/badge/streak logic implemented
- ✅ Test data available
- ✅ Deployed to Vercel (can sign in)

**Checkpoint:** Can sign in, user is created in Convex, can view test data in dashboard

---

## Phase 2: Core Features (Week 2)

**Goal:** Full create → practice → dashboard flow working

### Day 1-2: Transform Screen (6 hours)

**Tasks:**

1. ✅ Build transform screen UI
2. ✅ Integrate Anthropic API
3. ✅ Create affirmation generation action
4. ✅ Handle loading/error states
5. ✅ Test transformation flow

**v0 Prompt for Transform Screen:**

```
Create a mobile-first "Create Affirmation" screen for a mental health app.

Layout:
- Header: "← Create Affirmation" (back button)
- Large heading: "What negative thought do you want to quit?"
- Textarea (tall, 150px min-height):
  - Placeholder: "e.g., I'm terrible at public speaking"
  - Auto-focus on mount
  - Character counter (0/500)
- Primary button: "Generate Affirmations →" (disabled until 10+ chars)
- Helper text below: "Our AI will create personalized affirmations based on proven CBT principles"

After generation (replace content):
- Header: "← Choose Your Affirmation"
- Subheading: "Select the one that resonates most with you"
- Radio button list (3-5 options):
  - Each option: full affirmation text in readable font
  - Radio button on left
- Text input at bottom: "Or write your own" (optional customization)
- Two buttons:
  - "Save & Practice" (primary)
  - "Save to Library" (secondary)

Loading state:
- Spinner with text: "Creating your personalized affirmations..."
- Subtle animation

Error state:
- Friendly error message
- "Try Again" button

Use Shadcn UI components (Textarea, Button, RadioGroup, Card).
Mobile-first, large tap targets, calm colors.
```

**Cursor Prompt for API Route (Vercel AI SDK):**

```
Create app/api/generate/route.ts for AI affirmation generation using Vercel AI SDK.

Implementation:
1. Import { anthropic } from '@ai-sdk/anthropic' and { generateText } from 'ai'
2. Use Clerk auth() to verify user is authenticated
3. Get user tier from Convex query to determine suggestion count (3 for free, 5 for pro)
4. Call generateText with:
   - model: anthropic('claude-sonnet-4-20250514')
   - system: Self-Talk Solution methodology prompt (from PRD)
   - prompt: "Transform this negative thought into {count} affirmations: {negativeThought}"
   - temperature: 0.7
   - maxTokens: 1500
5. Parse JSON response (strip markdown code blocks if present)
6. Validate response structure
7. Return { analysis, affirmations }

Error handling:
- 401 if not authenticated
- 400 if input too short (<10 chars)
- 429 if rate limited
- 500 for other errors with user-friendly messages

Use ConvexHttpClient to query user data from API route.
Full TypeScript types for request/response.
```

**Cursor Prompt for Transform Flow:**

```
Create the full transform flow in app/(dashboard)/transform/page.tsx

State management:
- inputText (string)
- isLoading (boolean)
- error (string | null)
- result (GenerateResponse | null)
- selectedIndex (number)
- customText (string)

Types:
interface GenerateResponse {
  analysis: {
    detected_level: number;
    distortions: string[];
    theme: string;
  };
  affirmations: Array<{
    text: string;
    level: number;
    reasoning: string;
  }>;
}

Flow:
1. User types negative thought → button enables at 10 chars
2. Click "Generate" → fetch('/api/generate', { method: 'POST', body: { negativeThought } })
3. Show loading state
4. Receive result → show selection UI with affirmations
5. User picks one (or customizes) → click "Save & Practice"
6. Call Convex mutation createAffirmation with selected text + analysis
7. Navigate to /dashboard/practice/[id]

Error handling:
- Display error message if fetch fails
- Toast notifications for errors
- Retry button

Use:
- React hooks for state (useState)
- Next.js useRouter for navigation
- Convex useMutation for saving affirmation
- Include TypeScript types for all state
```

**Verification:**

- [ ] Can type negative thought
- [ ] Button disabled until 10 chars
- [ ] API call works, suggestions appear
- [ ] Can select a suggestion
- [ ] Can customize text
- [ ] Saves to database correctly
- [ ] Navigates to practice screen

---

### Day 3-4: Practice Screen (6 hours)

**Tasks:**

1. ✅ Build practice input component
2. ✅ Implement typing validation
3. ✅ Add progress tracking
4. ✅ Complete practice mutation
5. ✅ Test practice flow

**v0 Prompt for Practice Screen:**

```
Create a mobile-first practice screen for typing affirmations.

Layout:
- Header: "← Practice Session"
- Affirmation display (large, centered):
  - Text in 24px font, semibold
  - "I speak clearly and confidently in front of groups"
- Instruction: "Type your affirmation 10 times"
- Large textarea (120px height):
  - Auto-focus
  - Placeholder: "Type the affirmation here..."
- Progress section:
  - Progress bar (0-100%)
  - Text: "Progress: 6/10" with current count
  - XP counter: "🎯 60 XP earned so far"
- Timer: "⏱️ 2:34" (running timer)
- Two small buttons at bottom:
  - "Pause" (secondary)
  - "Skip" (text button, gray)

Visual feedback:
- When text matches: green flash, clear input, increment counter
- Progress bar animates smoothly
- XP counter animates up

Completion state (modal):
- Large emoji: 🎉
- "Practice Complete!" heading
- "+100 XP" (large, primary color)
- "🔥 7-day streak maintained!" (if applicable)
- Two buttons:
  - "Practice Another" (primary)
  - "Back to Home" (secondary)

Use Shadcn components (Card, Progress, Textarea, Button, Dialog).
Calm colors, smooth animations.
```

**Cursor Prompt for Practice Logic:**

```
Create components/practice/practice-input.tsx component.

Props:
- affirmationText: string
- targetReps: number (default 10)
- onComplete: (data: { repetitions: number, durationSeconds: number }) => void

Implementation:
1. Track currentInput (string) and completedReps (number)
2. Start timer on mount
3. On each keystroke:
   - Compare input to affirmation (case-insensitive, trimmed)
   - If match:
     - Increment completedReps
     - Clear input
     - Haptic feedback (navigator.vibrate)
     - Show brief success animation
4. When completedReps === targetReps:
   - Calculate duration
   - Call onComplete callback
5. Show progress bar and XP counter (10 XP per rep)

Use React hooks (useState, useEffect for timer).
Add TypeScript types.
Include accessibility (aria labels).
```

**Cursor Prompt for Complete Practice Mutation:**

```
Create completePractice mutation in convex/mutations.ts

Args:
- affirmationId: v.id("affirmations")
- repetitions: number
- durationSeconds: number

Logic:
1. Get current user
2. Get today's date (YYYY-MM-DD format)
3. Check if this is first practice today (for XP bonus)
4. Check if it's morning (before 10am for bonus)
5. Get current streak:
   - If lastPracticeDate is yesterday: increment streak
   - If lastPracticeDate is today: keep same
   - Otherwise: reset to 1
6. Calculate XP using xp-calculator functions
7. Update user:
   - totalXP += xpEarned
   - level = calculateLevel(newTotalXP)
   - currentStreak, longestStreak
   - lastPracticeDate = today
8. Create practice record
9. Update affirmation stats (timesPracticed++, totalRepetitions += reps)
10. Check for new badges
11. Return: { xpEarned, newLevel, leveledUp, streakMaintained, currentStreak, newBadges, celebrationType }

Use Convex mutations properly, handle all edge cases.
```

**Verification:**

- [ ] Can type affirmation repeatedly
- [ ] Progress bar updates correctly
- [ ] Timer runs
- [ ] XP calculates correctly
- [ ] Streak logic works
- [ ] Affirmation stats update
- [ ] Shows completion (even if no modal yet)

---

### Day 5-6: Dashboard Home (6 hours)

**Tasks:**

1. ✅ Build dashboard layout
2. ✅ Create TierCard component
3. ✅ Show recent affirmations
4. ✅ Add quick practice buttons
5. ✅ Test full flow

**v0 Prompt for Dashboard:**

```
Create a mobile-first dashboard home screen for Mindshift app.

Layout:
- Header: "Welcome back, Justin! 👋" (personalized with user name)
- TierCard (prominent):
  - Tier name with icon: "EXPERT ⚡"
  - Level number: "Level 32"
  - Progress bar showing tier progress
  - Text below: "2/10 to Master"
  - Streak and XP stats row:
    - "🔥 45 days"
    - "⚡ 8,465 XP"
  - Background color tinted to tier color (gold for Expert)
- Large primary button:
  - "[+] Create New Affirmation"
  - Full width, prominent
- Section: "Quick Practice"
  - Heading with count: "Quick Practice (3)"
  - 3 affirmation cards:
    - Affirmation text (truncated to 2 lines)
    - "Practiced 12 times"
    - "Last: Today"
    - Button: "Practice →" (on right)
  - Link at bottom: "View All Affirmations →"
- Section: "Today's Progress"
  - Checklist:
    - "☐ Practice Goal (0/1 completed today)"
    - "☐ Maintain Streak"

Bottom Navigation (fixed):
- 5 icons: Home, Create (+), Library, Leaderboard, Profile
- Current tab highlighted

Use Shadcn components (Card, Button, Progress, Badge).
Calm colors, card-based design, plenty of white space.
Mobile-optimized spacing and tap targets.
```

**Cursor Prompt for Dashboard Data:**

```
Create app/(dashboard)/page.tsx that loads and displays user data.

Queries needed:
1. getCurrentUser - for tier, level, streak, XP
2. getAffirmations - get 3 most recent (not archived)
3. getTodaysPractices - check if practiced today

Display:
- TierCard with user stats
- Recent affirmations with "Practice" buttons
- Today's progress checklist (checkmarks if conditions met)

Handle loading state (skeleton components).
Handle error state (error boundary).

Use Convex useQuery hooks.
Use Next.js Link for navigation.
Use React components for modularity.

Make it type-safe with TypeScript.
```

**Cursor Prompt for TierCard Component:**

```
Create components/profile/tier-card.tsx

Props:
- level: number
- totalXP: number
- currentStreak: number

Display:
- Get tier from getLevelTier(level)
- Show tier icon and name (large, prominent)
- Show level number (secondary)
- Show progress bar with calculateXPForNextLevel()
- Show tier progress text ("2/10 to Master")
- Show streak and XP in a row at bottom
- Style card background with tier.color (20% opacity)

Use Shadcn Card component.
Use Framer Motion for smooth value changes.
Fully typed with TypeScript.
```

**Verification:**

- [ ] Dashboard loads with real data
- [ ] TierCard displays correctly
- [ ] Can see recent affirmations
- [ ] "Practice" buttons work
- [ ] Navigation works
- [ ] Full flow: Create → Practice → Dashboard (see new stats)

---

**Phase 2 Deliverable:**

- ✅ Can create affirmations (AI generation works)
- ✅ Can practice affirmations (typing validation works)
- ✅ Dashboard shows real user data
- ✅ XP and streak update correctly
- ✅ Full vertical slice working end-to-end

**Checkpoint:** You can use the app yourself daily!

---

## Phase 3: Gamification (Week 3)

**Goal:** Make it fun and motivating

### Day 1-2: Badge System (6 hours)

**Tasks:**

1. ✅ Implement badge awarding logic
2. ✅ Create badge display component
3. ✅ Show badge notifications
4. ✅ Build badge showcase page
5. ✅ Test badge unlocks

**Cursor Prompt for Badge Awards:**

```
Update completePractice mutation to award badges.

After updating user stats:
1. Get user's current stats:
   - Total practices (count from practices table)
   - Total reps (sum from practices table)
   - Total affirmations created
   - Current streak
   - Current level
2. Call checkBadgeEligibility with these stats
3. For each newly earned badge:
   - Create badge record in badges table
   - Add to newBadges array in return value
4. Return badge details (id, name, icon) for display

Import BADGE_TYPES from lib/badge-types.ts for badge info.
```

**v0 Prompt for Badge Display:**

```
Create a badge showcase component for displaying earned badges.

Layout:
- Grid of badge cards (2 columns on mobile, 4 on desktop)
- Each badge:
  - Large icon (emoji) 48px
  - Badge name (semibold)
  - Description (small text, gray)
  - If earned: full color, earned date
  - If locked: grayscale, "🔒 Locked"
- Filter tabs at top:
  - "All (15)"
  - "Earned (5)"
  - "Locked (10)"

Badge card (earned):
- White background, border
- Icon in color
- Name and description
- Small badge: "Earned Nov 20"

Badge card (locked):
- Gray background
- Icon grayscale/dimmed
- Lock icon overlay
- Criteria text: "Complete 100 reps to unlock"

Use Shadcn Card, Badge, Tabs components.
Responsive grid, smooth hover effects.
```

**Cursor Prompt for Badge Showcase:**

```
Create app/(dashboard)/profile/badges/page.tsx

Display all available badges:
1. Get user's earned badges from Convex
2. Load BADGE_TYPES (all possible badges)
3. For each badge:
   - Check if user has earned it
   - Display with appropriate state (earned vs locked)
4. Show filter tabs (All, Earned, Locked)
5. Implement tab filtering

Use Convex useQuery to get badges.
Import BADGE_TYPES from convex/lib/badge-types.
Create BadgeCard component (earned vs locked variants).
Use Shadcn Tabs for filtering.

Add to Profile screen with "View All Badges →" link.
```

**Verification:**

- [ ] Badges awarded correctly
- [ ] Badge showcase displays properly
- [ ] Locked badges show criteria
- [ ] Earned badges show date
- [ ] Filtering works

---

### Day 3-4: Celebration Animations (6 hours)

**Tasks:**

1. ✅ Build CelebrationModal component
2. ✅ Implement different celebration types
3. ✅ Add confetti effect
4. ✅ Test all celebration scenarios
5. ✅ Polish animations

**v0 Prompt for Celebration Modal:**

```
Create celebration modal component with multiple variants.

Variant 1: Standard Practice Complete
- Emoji: 🎉
- Title: "Practice Complete!"
- XP earned: "+100 XP" (large, primary color)
- Optional streak info: "🔥 7-day streak!"
- Two buttons: "Practice Another", "Back to Home"

Variant 2: Level Up (Tier Change)
- Emoji: tier icon (large, 80px)
- Title: "TIER UP!"
- Tier display:
  - "You are now a"
  - Tier name (huge, tier color): "EXPERT"
  - Icon and description
  - Background tinted to tier color
- Milestone reward (if level 10/20/30/40/50)
- Confetti animation
- Button: "Continue Your Journey"

Variant 3: Milestone (Every 10 Levels)
- Emoji: 🎊
- Title: milestone.title ("First Milestone!")
- Level reached: "Level 10 Reached!"
- Reward display: milestone.reward
- XP bonus: "+50 XP"
- Button: "Continue"

Variant 4: Standard Toast (Levels 1-20, 41-50)
- Small toast notification (bottom of screen)
- "🎉 Level 8!"
- "+50 XP earned"
- Auto-dismiss after 3 seconds

Use Shadcn Dialog for modals, Toast for notifications.
Use Framer Motion for animations (scale, rotate, fade).
Include confetti library (react-confetti-explosion).
```

**Cursor Prompt for Celebration Logic:**

```
Update components/practice/celebration-modal.tsx to handle all celebration types.

Props:
- open, onClose
- celebrationType: 'major' | 'standard' | 'silent' | 'tier-change'
- xpEarned, leveledUp, newLevel, oldLevel
- streakMaintained, currentStreak
- newBadges
- milestone (optional)

Logic:
1. If celebrationType === 'silent': return null
2. If 'standard' + leveledUp: show toast notification
3. If 'tier-change': show big modal with tier info
4. If 'major': show milestone modal
5. Default: practice complete modal

Use getCelebrationType() from xp-calculator to determine type.
Use getLevelTier() to get tier info.
Use checkMilestone() to get milestone data.

Implement with Framer Motion animations:
- Modal: scale from 0, rotate -180deg to 0
- Confetti: trigger on tier-change and major milestones
- Stagger animations for multiple elements
```

**Cursor Prompt for Practice Flow Update:**

```
Update app/(dashboard)/practice/[id]/page.tsx to show celebrations.

After completePractice mutation returns:
1. Get celebrationType from getCelebrationType(newLevel, oldLevel)
2. Get milestone data if applicable
3. Get tier data if tier changed
4. Show CelebrationModal with all data
5. Handle modal close:
   - If "Practice Another": clear state, show affirmation picker
   - If "Back to Home": navigate to /dashboard

Pass all necessary data to CelebrationModal.
Handle state management for modal open/close.
```

**Verification:**

- [ ] Practice complete shows basic modal
- [ ] Level up shows toast (standard levels)
- [ ] Tier change shows huge modal with confetti
- [ ] Milestones show special modal
- [ ] Animations smooth and satisfying
- [ ] Badges display in modal if earned

---

### Day 5-7: Levels & Tiers Polish (6 hours)

**Tasks:**

1. ✅ Add level progression to profile
2. ✅ Show XP progress bar everywhere
3. ✅ Add tier indicators on leaderboard
4. ✅ Polish tier card animations
5. ✅ Test all 50 levels (automated)

**v0 Prompt for Level Progress Component:**

```
Create a compact level progress component.

Display:
- Current level and tier icon: "Level 32 ⚡"
- Progress bar to next level
- Text below bar: "145 XP to Level 33"
- Percentage on right: "73%"

Variants:
- Compact (for header): just level + small progress bar
- Expanded (for profile): level + progress bar + tier info + XP details

Use Shadcn Progress component.
Smooth progress bar animation.
Tier color accent on progress bar.
```

**Cursor Prompt for Level Testing:**

```
Create a test script (convex/test-levels.ts) that validates the 50-level system.

Tests:
1. Verify all 50 levels have correct XP thresholds
2. Verify calculateLevel() works for all XP values
3. Verify tier boundaries (level 10, 20, 30, 40, 50)
4. Verify milestone detection
5. Verify celebration type for each level
6. Verify XP calculation with all multipliers
7. Verify streak multiplier ranges

Run tests and output results.
This helps catch any XP curve errors.

Use Node.js with no external test framework (just console logs).
```

**Verification:**

- [ ] Level progress shows correctly everywhere
- [ ] Tier colors apply consistently
- [ ] All 50 level thresholds validated
- [ ] Celebrations trigger at right times
- [ ] Smooth animations on level up

---

**Phase 3 Deliverable:**

- ✅ Badge system fully working
- ✅ Celebrations for all scenarios
- ✅ 50-level system validated
- ✅ Gamification feels fun and rewarding

**Checkpoint:** App is engaging, you feel motivated to maintain streak

---

## Phase 4: Social Features (Week 4)

**Goal:** Add leaderboard and community elements

### Day 1-3: Leaderboard (8 hours)

**Tasks:**

1. ✅ Build leaderboard queries
2. ✅ Create leaderboard UI
3. ✅ Add tab navigation (weekly/monthly/all-time)
4. ✅ Show user rank
5. ✅ Test real-time updates

**Cursor Prompt for Leaderboard Queries:**

```
Create leaderboard queries in convex/queries.ts

1. getWeeklyLeaderboard({ limit?: number }):
   - Get all practices from last 7 days
   - Group by userId, sum repetitions
   - Join with users table for display info
   - Respect anonymousMode (show "Anonymous User" if true)
   - Sort by totalReps descending
   - Return top 100 (or limit)

2. getMonthlyLeaderboard({ limit?: number }):
   - Same as weekly but last 30 days

3. getAllTimeLeaderboard({ limit?: number }):
   - Get all users
   - Calculate total reps from practices table
   - Sort and return

For each entry return:
- userId
- username (or "Anonymous User")
- totalReps
- level
- tierIcon

Current user's rank should be calculated separately (getUserRank query).
```

**v0 Prompt for Leaderboard Screen:**

```
Create a mobile-first leaderboard screen.

Layout:
- Header: "Leaderboard 🏆"
- Tab navigation:
  - "Weekly" (active)
  - "Monthly"
  - "All-Time"
- Leaderboard list:
  - Top 3 get medal icons (🥇 🥈 🥉)
  - Each row:
    - Rank number (or medal)
    - Tier icon (🌱 💫 💪 ⚡ 🏆)
    - Username
    - Level (small, gray)
    - Total reps (right side, bold)
  - Current user row highlighted (blue background)
- User rank card (sticky at bottom):
  - "Your Rank: #23 of 1,247 users"
  - "145 reps to reach #22! 🎯"
  - Optional: "☑ Show as Anonymous User"

LeaderboardRow variants:
- Top 3: larger, medal icon, subtle background
- Current user: blue highlight, slightly larger
- Others: standard row

Use Shadcn Card, Tabs, Switch components.
Smooth tab transitions.
Infinite scroll (load more on bottom).
```

**Cursor Prompt for Leaderboard Page:**

```
Create app/(dashboard)/leaderboard/page.tsx

State:
- activeTab: 'weekly' | 'monthly' | 'all-time'
- leaderboard data from Convex query
- currentUserRank from separate query

Implementation:
1. Load appropriate leaderboard query based on tab
2. Find current user in leaderboard (highlight their row)
3. Calculate gap to next rank
4. Show privacy toggle (anonymous mode)
5. Real-time updates via Convex reactive queries

Use Convex useQuery (subscribes to live updates).
Use Tabs component with controlled state.
Create LeaderboardRow component (props: rank, username, level, totalReps, isCurrentUser).

Handle loading state (skeleton rows).
Handle empty state (no practices yet).
```

**Cursor Prompt for Real-time Updates:**

```
Ensure leaderboard updates in real-time when any user completes practice.

Implementation:
- Convex queries are reactive by default
- When completePractice mutation runs, practices table updates
- All active leaderboard queries re-run automatically
- React components re-render with new data

Test:
1. Open leaderboard on two devices (or tabs)
2. Complete practice on one
3. Verify leaderboard updates on both within 1-2 seconds

No additional code needed - this is Convex's built-in reactivity.
Just verify it works.
```

**Verification:**

- [ ] Leaderboard shows correct rankings
- [ ] Tab switching works
- [ ] Current user highlighted
- [ ] Rank gap calculated correctly
- [ ] Real-time updates work
- [ ] Anonymous mode toggle works
- [ ] Tier icons display correctly

---

### Day 4-5: Library Screen (6 hours)

**Tasks:**

1. ✅ Build affirmation library UI
2. ✅ Add search/filter
3. ✅ Add action buttons (Practice, Edit, Archive)
4. ✅ Test library operations

**v0 Prompt for Library Screen:**

```
Create affirmations library screen.

Layout:
- Header: "Your Affirmations"
- Search bar at top:
  - Icon: 🔍
  - Placeholder: "Search affirmations..."
- Filter tabs:
  - "Recent (23)"
  - "Most Practiced"
  - "Archived"
- Affirmation list:
  - Each card:
    - Checkmark icon if practiced today
    - Affirmation text (full, wrapping)
    - Stats: "Practiced 12 times • Last: Today"
    - Three action buttons:
      - "Practice" (primary, blue)
      - "Edit" (secondary)
      - "Archive" (text, gray)
  - Cards have hover effect (subtle shadow)
- Empty state:
  - Illustration or emoji
  - "No affirmations yet"
  - "Create your first affirmation to get started"
  - Button: "Create Affirmation"

Expandable cards (click to show full text if truncated).
Smooth animations on archive (slide out).

Use Shadcn Card, Input, Tabs, Button components.
```

**Cursor Prompt for Library Implementation:**

```
Create app/(dashboard)/library/page.tsx

Features:
1. Search: filter affirmations by text (client-side)
2. Sort tabs:
   - Recent: createdAt desc
   - Most Practiced: timesPracticed desc
   - Archived: archived = true
3. Action buttons:
   - Practice: navigate to /dashboard/practice/[id]
   - Edit: inline edit or modal (update affirmationText)
   - Archive: call archiveAffirmation mutation

Use Convex queries:
- getAffirmations({ archived: false }) for active
- getAffirmations({ archived: true }) for archived tab

Implement search with useMemo (filter on affirmationText).
Create AffirmationCard component with actions.

Handle loading state.
Handle empty state per tab.
```

**Verification:**

- [ ] All affirmations display
- [ ] Search works
- [ ] Sorting works
- [ ] Practice button navigates correctly
- [ ] Edit updates affirmation
- [ ] Archive removes from active list
- [ ] Archived tab shows archived items

---

### Day 6-7: Profile Screen (4 hours)

**Tasks:**

1. ✅ Build profile screen
2. ✅ Show all stats
3. ✅ Add settings
4. ✅ Link to badge showcase

**v0 Prompt for Profile Screen:**

```
Create user profile screen.

Layout:
- Header with user avatar and name
- Edit button (top right)
- Stats grid (2x2):
  - "🔥 45 days" (Streak)
  - "⚡ 8,465 XP" (Total XP)
  - "🎯 123" (Total Practices)
  - "📊 2,456" (Total Reps)
- TierCard (compact version)
- Section: "Badges (5/15)"
  - Horizontal scroll of badge icons
  - Button: "View All Badges →"
- Section: "Settings"
  - List items:
    - "Daily reminder" (toggle switch)
    - "Practice goal" (shows current, tappable)
    - "Privacy settings"
    - "Account settings"
  - If free tier: "Upgrade to Pro ⭐" (highlighted card)
- Bottom: "Sign Out" button (red, destructive)

Use Shadcn Card, Avatar, Switch, Button components.
Clean, organized layout with clear sections.
```

**Cursor Prompt for Profile Page:**

```
Create app/(dashboard)/profile/page.tsx

Display:
1. User info from getCurrentUser
2. Calculate stats:
   - Total practices (count practices table)
   - Total reps (sum practices.repetitions)
   - Badges earned (count badges table)
3. Show TierCard
4. Show recent badges (first 6) with horizontal scroll
5. Settings list with working toggles

Settings:
- Reminder toggle: update user.reminderEnabled
- Practice goal: show current, click to edit (modal)
- Privacy: link to privacy settings page
- Account: link to Clerk account settings

Use Convex queries for data.
Use Convex mutations for settings updates.
Use Clerk's <UserButton> for account management.
```

**Verification:**

- [ ] Profile displays correct stats
- [ ] Badges link to showcase
- [ ] Settings toggles work
- [ ] Upgrade prompt shows for free users
- [ ] Sign out works

---

**Phase 4 Deliverable:**

- ✅ Leaderboard working with real-time updates
- ✅ Library screen fully functional
- ✅ Profile screen complete
- ✅ All main screens built

**Checkpoint:** App feels complete, all core features work

---

## Phase 5: Polish & Animations (Week 5)

**Goal:** Make it feel professional and delightful

### Day 1-2: Animation Polish (6 hours)

**Tasks:**

1. ✅ Add page transitions
2. ✅ Polish micro-interactions
3. ✅ Add haptic feedback
4. ✅ Improve loading states
5. ✅ Test animation performance

**Cursor Prompt for Page Transitions:**

```
Add smooth page transitions using Framer Motion.

Create app/(dashboard)/layout.tsx with AnimatePresence:
- Wrap children in motion.div
- Variants:
  - initial: { opacity: 0, x: -20 }
  - animate: { opacity: 1, x: 0 }
  - exit: { opacity: 0, x: 20 }
- Duration: 0.2s
- Apply to route changes

Add to each page for consistent transitions.
Keep transitions subtle (not distracting).
```

**Cursor Prompt for Micro-interactions:**

```
Add delightful micro-interactions throughout the app:

1. Buttons:
   - Scale: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
   - All primary and secondary buttons

2. Cards:
   - Hover shadow increase
   - Smooth transition

3. Progress bars:
   - Animated fill (spring physics)
   - Smooth value changes

4. Stats counters:
   - Animate number changes (count up)
   - Use react-spring or Framer Motion

5. Checkboxes/toggles:
   - Scale on check
   - Smooth color transition

Apply consistently across all components.
Keep animations fast (150-300ms) so they don't slow UX.
```

**v0 Prompt for Loading States:**

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

**Verification:**

- [ ] Page transitions smooth
- [ ] Buttons feel responsive
- [ ] Loading states look professional
- [ ] Animations don't lag on mobile
- [ ] Haptic feedback on key actions

---

### Day 3-4: Practice Heatmap & Mobile Optimization (8 hours)

**Tasks:**

1. ✅ Build GitHub-style practice heatmap
2. ✅ Integrate heatmap into Profile screen
3. ✅ Test on real mobile devices
4. ✅ Fix safe area issues
5. ✅ Optimize tap targets

**v0 Prompt for Practice Heatmap:**

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

**Cursor Prompt for Heatmap Data Query:**

```
Create Convex query for practice heatmap data.

File: convex/queries.ts
Function: getPracticeHeatmap

Implementation:
1. Get current authenticated user
2. Query all practices from last 365 days
3. Group practices by date (YYYY-MM-DD format)
4. Count practices per day
5. Return array of { date: string, count: number }

Example return:
[
  { date: '2024-11-22', count: 3 },
  { date: '2024-11-21', count: 1 },
  { date: '2024-11-20', count: 0 },
  // ... last 365 days
]

Use:
- practices table with by_user index
- Filter by practicedAt >= oneYearAgo
- Group by date string
- Handle missing dates (fill with 0)

Include TypeScript types.
Optimize for performance (use index properly).
```

**Cursor Prompt for Heatmap Component:**

```
Create PracticeHeatmap React component.

File: components/profile/practice-heatmap.tsx

Features:
1. Load data from getPracticeHeatmap query
2. Generate full 365-day calendar (fill missing dates with count: 0)
3. Group days into weeks (7 days per week, Sunday start)
4. Render grid of squares:
   - 52 columns (weeks)
   - 7 rows (days)
   - Color based on count (0=gray, 1-2=light blue, 3-4=medium blue, 5+=dark blue)
5. Tooltip on hover showing date and count
6. Legend at bottom showing color scale
7. Responsive: smaller squares on mobile

Use:
- Convex useQuery hook
- Shadcn Tooltip component
- Framer Motion for subtle animations
- Color functions for threshold mapping

Helper functions:
- generateLast365Days(): string[]
- groupIntoWeeks(cells): HeatmapCell[][]
- getColor(count): string
- formatDate(dateString): string

Performance:
- React.memo for cells
- useMemo for data processing
- Efficient rendering of 365 elements
```

**Integration Steps:**

1. Generate heatmap component in v0 or build manually
2. Create getPracticeHeatmap query in Convex
3. Add PracticeHeatmap to Profile screen (after TierCard, before Badges section)
4. Test with various practice patterns:
   - No data (all gray)
   - Sparse data (few blue squares)
   - Consistent data (many blue squares)
   - Current streak visible
5. Polish colors to match Mindshift brand
6. Test mobile responsiveness (horizontal scroll if needed)

**Optional Enhancements (if time permits):**

- Show longest streak stat below heatmap: "🔥 Longest streak: 45 days"
- "Perfect Week" badge if 7 consecutive days filled
- Share button to generate screenshot of heatmap
- Click cell to view practices from that date

**Cursor Prompt for Mobile Testing:**

```
Mobile optimization checklist:

1. Safe area handling:
   - Top: account for notch/camera cutout
   - Bottom: account for navigation bar
   - Use env(safe-area-inset-top) etc. in CSS

2. Tap targets:
   - All buttons minimum 44x44px
   - Adequate spacing between tappable elements
   - No accidental taps on heatmap cells (they're small)

3. Keyboard behavior:
   - Inputs don't hide behind keyboard
   - Smooth scroll when keyboard opens

4. Performance:
   - Images optimized (next/image)
   - No janky scrolling
   - Heatmap renders smoothly (365 cells)
   - Animations use transform/opacity only

5. Heatmap on mobile:
   - Horizontal scroll works smoothly
   - Cells still tappable at 10x10px
   - Tooltip positions correctly
   - Legend visible

Test on:
- iPhone (Safari)
- Android (Chrome)
- Small phones (SE) to tablets
```

**Verification:**

- [ ] Heatmap loads with real practice data
- [ ] Shows last 365 days correctly
- [ ] Colors map to practice counts correctly
- [ ] Tooltips show date and count
- [ ] Responsive on mobile (horizontal scroll)
- [ ] Performance good (no lag with 365 cells)
- [ ] Looks great on Profile screen
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] No safe area issues
- [ ] All tap targets accessible

---

### Day 5-7: PWA Configuration (6 hours)

**Tasks:**

1. ✅ Set up next-pwa
2. ✅ Create manifest.json
3. ✅ Design app icons
4. ✅ Test install prompt
5. ✅ Test offline behavior

**Cursor Prompt for PWA Setup:**

```
Configure Mindshift as a Progressive Web App.

1. Install next-pwa:
   npm install next-pwa

2. Update next.config.js:
   - Add withPWA wrapper
   - Configure offline support (basic)
   - Disable in development

3. Create public/manifest.json:
   {
     "name": "Mindshift",
     "short_name": "Mindshift",
     "description": "Quit negative thinking through practice",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#3b82f6",
     "icons": [
       // 192x192, 512x512 PNG icons
     ]
   }

4. Add meta tags to app/layout.tsx:
   - theme-color
   - apple-mobile-web-app-capable
   - apple-mobile-web-app-status-bar-style

5. Create app icons:
   - Generate 192x192 and 512x512 PNGs
   - Use Mindshift logo (or create simple icon)
   - Place in public/ directory

6. Test:
   - Deploy to Vercel
   - Open on mobile Chrome
   - Check for "Add to Home Screen" prompt
   - Verify app opens in standalone mode
```

**v0 Prompt for App Icon:**

```
Design a simple app icon for Mindshift.

Concept:
- Main element: Brain with upward arrow (growth/transformation)
- Or: Head silhouette with lightbulb (mindshift)
- Or: Simple "M" lettermark in modern style

Style:
- Minimalist
- 2-3 colors max (blue primary, maybe purple accent)
- Works at small sizes (192x192)
- Recognizable on home screen

Provide as:
- 192x192 PNG (standard)
- 512x512 PNG (high-res)
- SVG source (for editing)

Background: white or gradient (blue to purple)
```

**Verification:**

- [ ] Manifest.json valid
- [ ] Icons display correctly
- [ ] Install prompt appears on mobile
- [ ] App opens in standalone mode
- [ ] No browser chrome visible when installed
- [ ] Basic offline support works

---

**Phase 5 Deliverable:**

- ✅ App feels polished and professional
- ✅ Animations smooth and delightful
- ✅ Practice heatmap (GitHub-style contribution squares)
- ✅ Mobile-optimized
- ✅ PWA installable

**Checkpoint:** App ready for beta testing

---

## Phase 6: Monetization (Week 6)

**Goal:** Enable paid subscriptions

### Day 1-3: Stripe Integration (8 hours)

**Tasks:**

1. ✅ Set up Stripe account
2. ✅ Create products and prices
3. ✅ Build checkout flow
4. ✅ Implement webhook handler
5. ✅ Test subscription lifecycle

**Cursor Prompt for Stripe Setup:**

```
Set up Stripe integration for Mindshift subscriptions.

1. Create Stripe products:
   - Mindshift Pro - Monthly: $4.99/month
   - Mindshift Pro - Yearly: $49/year (17% discount)
   - Mindshift Elite - Monthly: $9.99/month (future)
   - Mindshift Elite - Yearly: $99/year (future)

2. Create Stripe checkout session API route:
   app/api/checkout/route.ts

   POST handler:
   - Get current user from Clerk
   - Get/create Stripe customer
   - Create checkout session with priceId
   - Return session URL

   Body: { priceId: string, successUrl: string, cancelUrl: string }
   Returns: { url: string }

3. Create webhook handler:
   convex/http.ts (already scaffolded in PRD)

   Handle events:
   - checkout.session.completed → Set user.tier = "pro"
   - customer.subscription.updated → Update status
   - customer.subscription.deleted → Revert to "free"

4. Create mutations for subscription management:
   convex/mutations.ts

   updateSubscription({ stripeCustomerId, tier?, subscriptionStatus?, subscriptionId? })
   - Find user by stripeCustomerId
   - Update tier and subscription fields

Use @stripe/stripe-js and stripe packages.
Store API keys in environment variables.
Verify webhook signature for security.
```

**Cursor Prompt for Checkout Flow:**

```
Create upgrade flow UI and logic.

1. Create components/subscription/upgrade-modal.tsx:
   Props: { open, onClose, tier: 'pro' | 'elite' }

   Display:
   - Tier name and benefits
   - Price (monthly + yearly option with discount badge)
   - Radio buttons for billing period
   - "Upgrade Now" button
   - "Free tier" comparison table

   On submit:
   - Call /api/checkout with selected priceId
   - Redirect to Stripe checkout
   - On success return, show success message

2. Add upgrade CTAs throughout app:
   - Transform screen: "Free tier limit reached. Upgrade for unlimited →"
   - Profile screen: "Upgrade to Pro" card
   - Settings: "Unlock Pro features"

3. Handle success return:
   - /dashboard?upgraded=true
   - Show success toast
   - Confetti animation
   - Highlight newly unlocked features

Use Shadcn Dialog, RadioGroup, Button components.
Handle loading states during redirect.
```

**Verification:**

- [ ] Checkout session creates correctly
- [ ] Redirects to Stripe
- [ ] Payment succeeds (test mode)
- [ ] Webhook receives event
- [ ] User tier updates in database
- [ ] Pro features unlock immediately
- [ ] Subscription shows in Stripe dashboard

---

### Day 4-5: Feature Gating (6 hours)

**Tasks:**

1. ✅ Implement free tier limits
2. ✅ Add upgrade prompts
3. ✅ Gate Pro features
4. ✅ Test upgrade/downgrade flow

**Cursor Prompt for Feature Gating:**

```
Implement free tier limits and Pro feature gating.

1. Update createAffirmation mutation:
   - Check user.tier
   - If "free":
     - Count affirmations created this month
     - If >= 5: throw error "Free tier limit reached"
     - Show upgrade modal on error
   - If "pro" or "elite":
     - No limit

2. Update generateAffirmations action:
   - If user.tier === "free": return 3 suggestions
   - If user.tier === "pro" or "elite": return 5 suggestions

3. Create helper function in lib/utils.ts:
   canAccessProFeature(user): boolean
   - Returns true if user.tier is "pro" or "elite"

4. Gate features in UI:
   - Advanced analytics: Pro only
   - Export affirmations: Pro only
   - Custom categories: Pro only
   - Premium badges: Pro only

5. Show "Pro" badges next to locked features:
   - Component: <ProBadge /> (small "PRO" chip)
   - On click: open upgrade modal

Update all relevant components to check tier and show appropriate UI.
```

**Cursor Prompt for Upgrade Prompts:**

```
Add contextual upgrade prompts throughout the app.

Triggers:
1. Hit free tier limit (5 transformations/month)
2. Click Pro feature (analytics, export, etc.)
3. View leaderboard (show Pro users have custom usernames)
4. Complete 10+ practices (show "Pro users get more insights")

UpgradePrompt variants:
- Modal (blocking action)
- Toast (gentle nudge)
- Inline card (in settings, profile)

Messaging:
- Benefit-focused: "Unlock unlimited transformations"
- Social proof: "Join 127 Pro users"
- Urgency (subtle): "Limited time offer" (if applicable)

Track upgrade prompt impressions in PostHog.
A/B test messaging (future).
```

**Verification:**

- [ ] Free tier limit enforced
- [ ] Upgrade prompts show correctly
- [ ] Pro features locked for free users
- [ ] Pro features unlock after upgrade
- [ ] Messaging is clear and compelling

---

### Day 6-7: Customer Portal & Management (4 hours)

**Tasks:**

1. ✅ Add Stripe customer portal link
2. ✅ Handle subscription cancellation
3. ✅ Show subscription status
4. ✅ Test edge cases

**Cursor Prompt for Customer Portal:**

```
Add subscription management via Stripe Customer Portal.

1. Create API route: app/api/portal/route.ts
   - Get current user
   - Find Stripe customer
   - Create portal session
   - Return portal URL

2. Add to profile settings:
   - Section: "Subscription"
   - Show current tier and status
   - If subscribed: "Manage Subscription" button → portal
   - If canceled: Show expiration date
   - If expired: "Resubscribe" button

3. Handle webhook events:
   - customer.subscription.updated
     - Update user.subscriptionStatus
     - If status = "canceled": keep tier until period ends
   - customer.subscription.deleted
     - Set user.tier = "free"

4. Grace period handling:
   - Store subscriptionEndsAt timestamp
   - Check in canAccessProFeature()
   - If subscriptionStatus = "canceled" but subscriptionEndsAt > now: still allow access

Display subscription status clearly:
- "Pro (Active)"
- "Pro (Cancels Dec 15)"
- "Free"
```

**Verification:**

- [ ] Portal link works
- [ ] Can cancel subscription
- [ ] Access maintained until period end
- [ ] Reverts to free after expiration
- [ ] Can resubscribe
- [ ] Status displays correctly

---

**Phase 6 Deliverable:**

- ✅ Stripe integration working
- ✅ Can upgrade to Pro
- ✅ Features properly gated
- ✅ Subscription management works

**Checkpoint:** Monetization validated, ready to make money

---

## Phase 7: Analytics & Email (Week 7)

**Goal:** Understand users and keep them engaged

### Day 1-3: PostHog Integration (6 hours)

**Tasks:**

1. ✅ Set up PostHog
2. ✅ Add event tracking
3. ✅ Create dashboards
4. ✅ Test event capture

**Cursor Prompt for PostHog Setup:**

```
Integrate PostHog analytics into Mindshift.

1. Install: npm install posthog-js

2. Create lib/posthog.ts:
   - Initialize PostHog with project key
   - Export tracking functions:
     - trackEvent(name, properties)
     - identifyUser(userId, traits)
     - trackPageview()

3. Add to app/layout.tsx:
   - Initialize PostHog on mount
   - Set up pageview tracking (route changes)

4. Track key events:

   Auth:
   - user_signed_up
   - user_signed_in

   Core features:
   - affirmation_created (properties: theme, level)
   - practice_started (properties: affirmationId)
   - practice_completed (properties: repetitions, duration, xpEarned)
   - streak_maintained (properties: streakLength)
   - badge_earned (properties: badgeType)
   - level_up (properties: newLevel, tier)

   Engagement:
   - leaderboard_viewed
   - library_viewed
   - profile_viewed

   Monetization:
   - upgrade_clicked
   - checkout_started
   - subscription_completed (properties: tier, billingPeriod)
   - subscription_canceled

5. Add user identification on auth:
   - Call identifyUser(userId, { email, tier, level, createdAt })

Wrap tracking in try-catch (don't break app if PostHog fails).
```

**Verification:**

- [ ] Events appear in PostHog dashboard
- [ ] User identification works
- [ ] Can filter by user properties
- [ ] Events have correct properties

---

### Day 4-5: Email System (6 hours)

**Tasks:**

1. ✅ Set up Resend
2. ✅ Create email templates (React Email)
3. ✅ Send welcome email
4. ✅ Send reminder emails
5. ✅ Test email delivery

**Cursor Prompt for Email Templates:**

```
Create email templates using React Email.

1. Install:
   npm install react-email @react-email/components resend

2. Create emails/ directory with templates:

   emails/welcome.tsx:
   - Subject: "Welcome to Mindshift! 🌱"
   - Body:
     - Greeting with user name
     - App overview (quit negative thinking)
     - CTA: "Create Your First Affirmation"
     - Tips for getting started
     - Footer with unsubscribe

   emails/daily-reminder.tsx:
   - Subject: "Time for your daily practice 🧠"
   - Body:
     - Personalized greeting
     - Streak status: "You're on a 7-day streak! 🔥"
     - CTA: "Practice Now"
     - Motivational quote (random)

   emails/streak-milestone.tsx:
   - Subject: "🎉 You've reached a [X]-day streak!"
   - Body:
     - Celebration message
     - Stats recap (total practices, XP earned)
     - Encouragement to continue
     - CTA: "Keep Going"

Use React Email components (@react-email/components).
Design mobile-responsive with inline styles.
Brand colors: primary blue (#3b82f6).
```

**Cursor Prompt for Email Sending:**

```
Create email sending service using Resend.

1. Create lib/email.ts:

   import { Resend } from 'resend';
   import WelcomeEmail from '@/emails/welcome';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendWelcomeEmail(to: string, name: string) {
     await resend.emails.send({
       from: 'Mindshift <hello@mindshift.app>',
       to,
       subject: 'Welcome to Mindshift! 🌱',
       react: WelcomeEmail({ name }),
     });
   }

   // Similar functions for other email types

2. Send welcome email after user signs up:
   - In syncUser mutation (first time user created)
   - Call email function in a try-catch (don't block sign up if fails)

3. Schedule reminder emails:
   - Use Convex scheduled functions
   - Check users with reminderEnabled = true
   - If lastPracticeDate < today, send reminder
   - Run daily at user's reminderTime

4. Send milestone emails:
   - In completePractice mutation
   - If streak hits 7, 30, 100 days: send milestone email

Test emails in Resend dashboard (test mode).
```

**Verification:**

- [ ] Welcome email sends on signup
- [ ] Daily reminder sends (test with manually set time)
- [ ] Milestone email sends on streak milestone
- [ ] Emails look good on mobile
- [ ] Unsubscribe link works

---

### Day 6-7: Sentry Error Tracking (2 hours)

**Tasks:**

1. ✅ Set up Sentry
2. ✅ Configure error boundaries
3. ✅ Test error capture

**Cursor Prompt for Sentry Setup:**

```
Integrate Sentry for error tracking.

1. Install: npx @sentry/wizard@latest -i nextjs

2. Configure sentry.client.config.ts:
   - Set DSN from environment
   - Set environment (production/development)
   - Set release (git commit hash or version)
   - Add user context (userId, email)

3. Add error boundaries:
   - Create components/shared/error-boundary.tsx
   - Wrap main app sections
   - Display friendly error message to user
   - Log error to Sentry

4. Manual error logging:
   - Import Sentry in API routes
   - Wrap mutations in try-catch
   - Call Sentry.captureException(error) on failures

5. Set up alerts:
   - Email on new errors
   - Slack integration (optional)

Test by throwing an error and checking Sentry dashboard.
```

**Verification:**

- [ ] Errors captured in Sentry
- [ ] User context attached
- [ ] Stack traces readable
- [ ] Alerts configured

---

**Phase 7 Deliverable:**

- ✅ Analytics tracking all key events
- ✅ Email system working
- ✅ Error tracking enabled

**Checkpoint:** Can measure and improve the product

---

## Phase 8: Launch Prep (Week 8)

**Goal:** Polish and ship

### Day 1-3: Landing Page (8 hours)

**Tasks:**

1. ✅ Design landing page
2. ✅ Write compelling copy
3. ✅ Add social proof
4. ✅ SEO optimization

**v0 Prompt for Landing Page:**

```
Create a modern, conversion-focused landing page for Mindshift.

Structure:

1. Hero Section:
   - Headline: "Quit Negative Thinking Through Practice"
   - Subheadline: "Transform negative self-talk into empowering affirmations with AI assistance. Practice daily, track progress, compete with others."
   - CTA: "Get Started Free" (large button)
   - Hero image/illustration (person meditating with thought bubbles transforming)

2. Problem Section:
   - Heading: "Your Mind Runs Negative Programs All Day"
   - 3 pain points:
     - "77% of self-talk is negative and counterproductive"
     - "Generic affirmations feel fake and don't work"
     - "Motivation fades without structure and accountability"

3. Solution Section:
   - Heading: "Mindshift: The First Affirmations App That Actually Works"
   - 4 features (icon + title + description):
     - 🤖 "AI-Powered Transformation" - Turn your negative thoughts into personalized affirmations
     - ✍️ "Practice Through Repetition" - Manual typing rewires neural pathways
     - 🎮 "Gamified Progress" - Streaks, levels, badges keep you motivated
     - 🏆 "Competitive Leaderboards" - Compare progress with others

4. How It Works:
   - 3 steps with screenshots:
     1. "Enter a negative thought"
     2. "Get AI-powered affirmations"
     3. "Practice daily and level up"

5. Social Proof:
   - Testimonials (if available, else placeholder)
   - Stats: "1,247 users" • "50,000+ practices completed" • "4.8★ rating"

6. Pricing:
   - Free tier features
   - Pro tier ($4.99/month) - most popular
   - Elite tier ($9.99/month) - coming soon

7. FAQ:
   - 5-7 common questions
   - Expandable accordions

8. Final CTA:
   - "Start Your Mental Transformation Today"
   - "Get Started Free" button
   - "No credit card required"

Design:
- Modern, clean aesthetic
- Gradient accents (blue to purple)
- Calm color palette
- Mobile-responsive
- Fast loading
- Clear visual hierarchy

Use Shadcn components throughout.
```

**Cursor Prompt for Landing Page:**

```
Implement the landing page at app/page.tsx

Features:
1. Hero with animated gradient background
2. Feature cards with icons (Lucide React)
3. How-it-works section with step-by-step flow
4. Pricing comparison table
5. FAQ accordion (Shadcn Accordion)
6. Smooth scroll to sections
7. CTA buttons link to /signup

Add metadata for SEO:
- Title: "Mindshift - Quit Negative Thinking Through Practice"
- Description: "Transform negative self-talk into positive affirmations with AI. Practice daily, level up, compete with others. Free to start."
- Keywords: "negative thinking, affirmations, mental health, self-talk, CBT, mindfulness"
- Open Graph tags for social sharing

Optimize for performance:
- Use next/image for all images
- Lazy load below-the-fold content
- Minimize CLS (layout shift)
```

**Verification:**

- [ ] Landing page loads fast (<2s)
- [ ] Mobile responsive
- [ ] All CTAs work
- [ ] Looks professional
- [ ] SEO metadata correct

---

### Day 4-5: Testing & Bug Fixes (6 hours)

**Tasks:**

1. ✅ Cross-browser testing
2. ✅ Mobile device testing
3. ✅ Bug fixes
4. ✅ Performance optimization

**Testing Checklist:**

```
Manual Testing Checklist:

Auth Flow:
- [ ] Sign up with Google
- [ ] Sign up with email
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Protected routes redirect

Core Features:
- [ ] Create affirmation (AI generation works)
- [ ] Practice affirmation (typing validation)
- [ ] Complete practice (XP awarded, streak updates)
- [ ] Level up (celebration shows)
- [ ] Earn badge (notification shows)

Gamification:
- [ ] Streak maintained (practiced yesterday)
- [ ] Streak broken (skipped day)
- [ ] XP calculations correct
- [ ] Levels progress correctly
- [ ] Tier changes show big celebration

Social:
- [ ] Leaderboard shows rankings
- [ ] Real-time updates work
- [ ] Current user highlighted
- [ ] Anonymous mode toggle works

Library:
- [ ] Search works
- [ ] Sorting works
- [ ] Practice button navigates
- [ ] Archive removes from list

Profile:
- [ ] Stats accurate
- [ ] Badges display
- [ ] Settings save

Monetization:
- [ ] Free tier limit enforced
- [ ] Upgrade modal shows
- [ ] Stripe checkout works
- [ ] Pro features unlock
- [ ] Subscription management works

Cross-Browser:
- [ ] Chrome (desktop & mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

Mobile:
- [ ] iPhone (various sizes)
- [ ] Android (various sizes)
- [ ] Landscape orientation
- [ ] PWA install works

Performance:
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Fast page loads
- [ ] Smooth animations
```

**Verification:**

- [ ] All tests pass
- [ ] Critical bugs fixed
- [ ] Performance acceptable

---

### Day 6: Product Hunt Prep (4 hours)

**Tasks:**

1. ✅ Create Product Hunt assets
2. ✅ Write launch post
3. ✅ Prepare demo video
4. ✅ Schedule launch

**Product Hunt Assets:**

```
Create for Product Hunt launch:

1. Product Hunt thumbnail (240x240):
   - App icon or logo
   - Clean, recognizable

2. Gallery images (4-6):
   - Dashboard screenshot
   - Practice screen in action
   - Leaderboard
   - Level up celebration
   - Before/after transformation example

3. Demo video (1-2 min):
   - Screen recording with voiceover or text overlay
   - Show: Create affirmation → Practice → Level up
   - Highlight: AI transformation, gamification, leaderboard
   - End with clear CTA

4. Launch post:
   - Catchy tagline: "Like Duolingo, but for your mind 🧠"
   - Problem statement (negative self-talk)
   - Solution (Mindshift features)
   - Call to action
   - First comment: Longer description, promo code (if applicable)

5. Launch checklist:
   - Post at 12:01am PST (optimal time)
   - Share on Twitter immediately
   - Share in communities (Indie Hackers, etc.)
   - Respond to all comments throughout day
   - Track upvotes in real-time
```

---

### Day 7: Launch! 🚀 (4 hours)

**Tasks:**

1. ✅ Deploy final version
2. ✅ Post on Product Hunt
3. ✅ Share on social media
4. ✅ Monitor and respond
5. ✅ Celebrate!

**Launch Day Schedule:**

```
12:00am PST: Post on Product Hunt
12:05am: Share on Twitter with demo video
12:10am: Share on LinkedIn
12:15am: Post in v0 Discord
12:20am: Email early access list (if any)

Throughout day:
- Respond to every Product Hunt comment within 1 hour
- Answer questions honestly
- Thank people for support
- Share updates on Twitter
- Monitor analytics (PostHog)
- Watch for bugs (Sentry)

Evening:
- Analyze first day metrics
- Write retrospective notes
- Plan tomorrow's follow-up
```

**First Day Success Metrics:**

- Product Hunt: Top 5 of the day (500+ upvotes)
- Signups: 50+ new users
- Twitter: 10,000+ impressions
- v0 post: 50+ reactions

---

**Phase 8 Deliverable:**

- ✅ Polished landing page
- ✅ All bugs fixed
- ✅ Product Hunt launch successful
- ✅ Public and available

**Checkpoint:** SHIPPED! 🎉

---

## v0 Prompt Library

Quick reference prompts for generating UI components with v0.

### Button Variants

```
Create a button component with these variants:
- Primary: Blue background, white text, hover darkens
- Secondary: White background, blue border, blue text
- Destructive: Red background, white text
- Ghost: Transparent, hover adds light background
- Text: No background, just text

All buttons:
- Rounded corners (8px)
- Padding: 12px 24px
- Font: 16px, semibold
- Include loading state (spinner)
- Include disabled state (50% opacity)

Use Shadcn Button component as base.
Export as React component with TypeScript.
```

### Card Components

```
Create a card component for [specific use case]:
- White background
- Border: 1px solid gray-200
- Border radius: 12px
- Padding: 20px
- Shadow: subtle on hover (0 4px 6px rgba(0,0,0,0.1))
- Smooth transition (0.2s)

Include hover effect (lift slightly).
Use Shadcn Card component.
```

### Form Components

```
Create a form for [specific purpose]:
- Input fields with labels
- Validation (show errors below field)
- Submit button (disabled until valid)
- Error state (red border, red text)
- Success state (green checkmark)

Use Shadcn Form, Input, Label components.
Add proper ARIA labels for accessibility.
```

### Modal/Dialog

```
Create a modal dialog for [specific purpose]:
- Overlay (dark, 50% opacity)
- Centered card on screen
- Close button (X in top right)
- Header, body, footer sections
- Primary and secondary action buttons
- ESC key closes
- Click outside closes

Use Shadcn Dialog component.
Animate in/out (scale + fade).
```

---

## Cursor Prompt Library

Quick reference prompts for Cursor AI assistance.

### Database Queries

```
Write a Convex query for [specific purpose]:
- Function name: [name]
- Arguments: [list args with types]
- Logic: [describe what it should do]
- Indexes to use: [list]
- Return type: [describe]

Include:
- Authentication check (throw if not authed)
- Error handling
- TypeScript types
- Comments explaining complex logic

File: convex/queries.ts
```

### Mutations

```
Write a Convex mutation for [specific purpose]:
- Function name: [name]
- Arguments: [list args with types]
- Logic:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- Return: [describe return value]

Include:
- Auth check
- Validation
- Error handling
- Database updates (patch/insert)
- Calculate side effects (XP, badges, etc.)
- TypeScript types

File: convex/mutations.ts
```

### React Components

```
Create a React component for [specific purpose]:
- Name: [ComponentName]
- Props: [list with types]
- State needed: [list]
- Behavior: [describe interactions]

Use:
- Convex useQuery/useMutation hooks
- React hooks (useState, useEffect, etc.)
- Shadcn UI components
- TypeScript
- Proper error handling

File: components/[path]/[name].tsx
```

### API Routes

```
Create a Next.js API route for [specific purpose]:
- Path: app/api/[path]/route.ts
- Method: POST/GET
- Input: [describe request body/params]
- Output: [describe response]

Logic:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Include:
- Auth check (Clerk)
- Input validation
- Error handling (try-catch)
- Proper HTTP status codes
- TypeScript types
```

---

## Tips for Using v0 and Cursor Effectively

### v0 Best Practices

**1. Be Specific About Design:**

- Include exact colors (hex codes)
- Specify spacing (px values)
- Mention component library (Shadcn)
- Reference style (modern, minimal, etc.)

**2. Describe Interactions:**

- Hover effects
- Click behavior
- Loading states
- Error states

**3. Request Mobile-First:**

- Always mention "mobile-first" or "responsive"
- Specify breakpoints if needed
- Large tap targets for mobile

**4. Iterate:**

- Generate initial component
- Request specific changes
- Refine until perfect

### Cursor Best Practices

**1. Provide Context:**

- Mention file names explicitly
- Reference existing code/functions
- Specify dependencies to use

**2. Break Down Complex Tasks:**

- Don't ask for entire features at once
- Request step-by-step implementation
- Build up complexity gradually

**3. Request Types:**

- Always ask for TypeScript types
- Request proper error handling
- Ask for comments on complex logic

**4. Test Incrementally:**

- Test each piece as you build
- Don't wait until everything is done
- Fix issues immediately

---

## Progress Tracking

Use this checklist to track your build progress:

**Week 1: Foundation**

- [ ] Project setup complete
- [ ] Clerk auth working
- [ ] Convex schema defined
- [ ] XP system implemented
- [ ] Test data seeded

**Week 2: Core Features**

- [ ] Transform screen working
- [ ] Practice screen working
- [ ] Dashboard displaying data
- [ ] Full flow end-to-end works

**Week 3: Gamification**

- [ ] Badge system working
- [ ] Celebrations implemented
- [ ] 50-level system validated
- [ ] App feels engaging

**Week 4: Social Features**

- [ ] Leaderboard working
- [ ] Library functional
- [ ] Profile complete
- [ ] All screens built

**Week 5: Polish**

- [ ] Animations smooth
- [ ] Practice heatmap built
- [ ] Mobile optimized
- [ ] PWA configured
- [ ] Professional feel

**Week 6: Monetization**

- [ ] Stripe integrated
- [ ] Can upgrade to Pro
- [ ] Features gated
- [ ] Subscription management works

**Week 7: Analytics & Email**

- [ ] PostHog tracking events
- [ ] Emails sending
- [ ] Sentry capturing errors
- [ ] Can measure success

**Week 8: Launch**

- [ ] Landing page live
- [ ] All bugs fixed
- [ ] Product Hunt posted
- [ ] SHIPPED! 🚀

---

**Total Estimated Time:** 160-200 hours over 8 weeks (20-25 hours/week)

**End Result:** A polished, functional, monetizable mental health app ready for users.

---

_Build Order Version: 1.0_  
_Last Updated: November 22, 2024_  
_Next: Start Phase 1, Day 1_
