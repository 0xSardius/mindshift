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
