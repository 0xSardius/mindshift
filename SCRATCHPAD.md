# Mindshift Development Scratchpad

> Working notes, progress tracking, and thought process for development sessions.

---

## Current Session: January 7, 2025

### What We Discovered

**Codebase Assessment (~45% complete):**
- Frontend UI is 85% built - all pages, components, animations working with mock data
- Backend is 10% built - Convex was essentially empty
- Everything runs on mock data - no persistence

### What We Built Today

#### Convex Schema (`convex/schema.ts`)
Created 5 database tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User profiles | clerkId, email, totalXP, level, currentStreak, tier |
| `affirmations` | Saved affirmations | userId, originalThought, affirmationText, timesPracticed |
| `practices` | Practice session records | userId, affirmationId, repetitions, xpEarned |
| `badges` | Earned achievements | userId, badgeType, earnedAt |
| `notifications` | Future notification support | userId, type, title, read |

#### XP Calculator (`convex/lib/xpCalculator.ts`)
- 50-level progression with exponential XP curve
- 5 tiers: Novice (1-10), Apprentice (11-20), Practitioner (21-30), Expert (31-40), Master (41-50)
- Streak multipliers: 1.0x → 1.2x → 1.5x → 1.75x → 2.0x
- Practice XP bonuses: first today, morning, full session, new affirmation

#### Badge System (`convex/lib/badgeTypes.ts`)
- 21 badges defined across categories:
  - Milestone badges (First Steps, Week Warrior, Century Club, etc.)
  - Tier completion badges (Novice Graduate → Master)
  - Special badges (Early Bird, Night Owl, Variety Seeker)
- Criteria checking function for badge eligibility

---

## Next Steps

### Immediate (Backend Foundation)
1. **Queries** - Read operations
   - `getCurrentUser` - Get user by Clerk ID
   - `getAffirmations` - Get user's affirmations (with filters)
   - `getAffirmation` - Get single affirmation by ID
   - `getUserStats` - Aggregate practice stats
   - `getLeaderboard` - Ranked users by XP or reps
   - `getBadges` - User's earned badges
   - `getPracticeHistory` - For heatmap data

2. **Mutations** - Write operations
   - `syncUser` - Create/update user from Clerk
   - `createAffirmation` - Save new affirmation
   - `completePractice` - Record practice, update XP/streak
   - `updateUserSettings` - Change reminder, goal, anonymous mode
   - `archiveAffirmation` - Soft delete

3. **Wire Up Frontend**
   - Replace mock data imports with Convex useQuery hooks
   - Connect mutations to UI actions
   - Handle loading/error states

### Then (AI & Polish)
4. **AI Integration**
   - Wire `/api/generate` to actual Claude API
   - Use Vercel AI SDK with `@ai-sdk/anthropic`
   - Implement Self-Talk Solution system prompt

5. **Clerk Webhook**
   - Auto-create user on first sign-in
   - Sync profile updates

---

## Architecture Decisions

### Why Convex?
- Real-time reactive queries (leaderboard updates live)
- TypeScript-first with generated types
- Serverless functions included
- Good free tier for MVP

### Why Clerk + Convex Together?
- Clerk handles auth UI/flow
- Convex stores user data
- `clerkId` links the two
- `ConvexProviderWithClerk` handles token passing

### XP Formula Rationale
- ~42 XP/day average with streak → ~343 days to level 50
- Encourages daily practice (streak multipliers)
- Morning bonus rewards healthy habits
- New affirmation bonus encourages variety

---

## Files Reference

```
convex/
├── schema.ts           # Database tables
├── lib/
│   ├── xpCalculator.ts # XP/level logic
│   └── badgeTypes.ts   # Badge definitions
├── queries.ts          # TODO
└── mutations.ts        # TODO

lib/
├── types.ts            # TypeScript interfaces
├── mock-data.ts        # Temporary mock data
└── utils.ts            # cn() helper

app/
├── (dashboard)/        # Protected routes
├── api/generate/       # AI endpoint (mock)
└── providers.tsx       # Clerk + Convex wrapper
```

---

## Questions/Decisions Pending

- [ ] Should we implement Clerk webhook or sync on first dashboard load?
- [ ] Rate limiting strategy for AI generation (free tier: 5/month)
- [ ] How to handle streak timezone issues?

---

## Session Log

| Date | Work Done | Commit |
|------|-----------|--------|
| Jan 7, 2025 | Created Convex schema, XP calculator, badge types | `ed1e4a9` |

---

## Revenue Model Decision (January 7, 2025)

### Problem with Original Model
- 5 transforms/month gated the wrong action
- Users have ~5-7 core negative thoughts - could use free tier forever
- Practice (the habit) is infinite, creation is finite

### New Model

| | Free | Pro |
|---|---|---|
| **Price** | $0 | $9.99/mo or $79/year |
| **AI Transforms** | 10 lifetime | Unlimited |
| **Practice** | Unlimited | Unlimited |
| **Gamification** | Full | Full + Pro badges |
| **Leaderboard** | View only | Custom username |
| **Extras** | - | Streak Shield, analytics, export, dark mode |

### Key Changes
1. **10 lifetime** (not monthly) - real scarcity, not artificial reset
2. **$9.99** (not $4.99) - mental wellness commands premium pricing
3. **$79/year** - 34% discount, "4 months free" positioning
4. **Streak Shield** - key Pro differentiator (miss 1 day/week)
5. **No Elite tier** - focus on Free→Pro conversion first

### Revenue Projections
- Year 1 @ 10K MAU, 5% conversion: ~$60K ARR
- Year 2 @ 40K MAU, 6% conversion: ~$290K ARR
- 96%+ gross margin after infrastructure costs

---

## Backend Complete (January 7, 2025)

### Convex Implementation Summary

**Schema** (`convex/schema.ts`):
- 5 tables: users, affirmations, practices, badges, notifications
- Proper indexes for all query patterns

**Queries** (`convex/queries.ts`) - 12 queries:
- User: getCurrentUser, getUser
- Affirmations: getAffirmations, getAffirmation
- Stats: getUserStats, getTodayProgress, getTransformationCount
- Social: getLeaderboard, getUserRankInfo
- Badges: getBadges, hasBadge
- Heatmap: getPracticeHistory

**Mutations** (`convex/mutations.ts`) - 12 mutations:
- User: syncUser, updateUserSettings, updateUserProfile, updateSubscription
- Affirmations: createAffirmation, archiveAffirmation, restoreAffirmation, updateAffirmation, deleteAffirmation
- Practice: completePractice (core - handles XP, streaks, badges, celebrations)
- Badges: awardBadge

**Libs** (`convex/lib/`):
- xpCalculator.ts - 50 levels, 5 tiers, streak multipliers
- badgeTypes.ts - 21 badges with criteria checking

### Next Steps
1. Wire frontend to Convex (replace mock data)
2. Implement AI generation endpoint (Claude API)
3. Add Clerk webhook for user sync
4. Test end-to-end flow

### Commits Today
| Commit | Description |
|--------|-------------|
| `ed1e4a9` | Convex schema, XP calculator, badge types |
| `4e3f1c9` | Add SCRATCHPAD.md |
| `a37968f` | Update revenue model ($9.99, 10 lifetime) |
| `346222e` | Add queries and mutations |

---

## Frontend Wired to Convex (January 8, 2025)

### What We Built

**New Hook** (`hooks/use-sync-user.ts`):
- Syncs Clerk user to Convex on authentication
- Creates user in Convex if not exists
- Returns user data, loading state, auth status

**Pages Updated**:
- `app/page.tsx` - Home page with real affirmations and progress
- `app/practice/[id]/page.tsx` - Fetches affirmation by ID
- `app/library/page.tsx` - Real-time library with Convex
- `app/leaderboard/page.tsx` - Live leaderboard data
- `app/profile/page.tsx` - User stats and settings
- `app/profile/badges/page.tsx` - Earned/locked badges display

**Components Updated**:
- `affirmation-creator.tsx` - createAffirmation mutation, free tier limit check
- `practice-session.tsx` - completePractice mutation, real XP/badges
- `affirmation-library.tsx` - archive/restore/edit mutations
- `leaderboard.tsx` - Real rankings, anonymous mode toggle
- `profile.tsx` - Settings persistence, Clerk sign out

### Key Features Now Working
1. User sync between Clerk and Convex
2. Creating affirmations with 10 lifetime limit for free tier
3. Practice sessions that update XP, streaks, award badges
4. Real-time leaderboard with anonymous mode
5. Library with search, filter, archive/restore/edit
6. Profile settings persistence
7. Sign out functionality

### Commits
| Commit | Description |
|--------|-------------|
| `d80d3ab` | Wire frontend to Convex backend |

### Next Steps
1. **AI Integration** - Wire `/api/generate` to Claude API
2. **Test E2E** - Full user flow testing
3. **PWA Setup** - Service worker, manifest
4. **Polish** - Error states, loading skeletons
