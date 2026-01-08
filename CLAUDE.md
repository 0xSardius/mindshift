# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npx convex dev       # Start Convex backend (run in separate terminal alongside Next.js)
```

Both dev servers must run simultaneously during development.

## Project Overview

Mindshift is a mental wellness PWA that helps users quit negative thinking through AI-powered affirmation transformation and gamified practice. Users input negative self-talk, receive personalized affirmations based on Self-Talk Solution methodology (Shad Helmstetter), practice through manual typing, and compete on leaderboards.

**Core Flow:** Capture negative thought → AI transforms to affirmations → User types 10x → Earns XP, maintains streak → Competes on leaderboard

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** Clerk (`@clerk/nextjs`)
- **AI:** Vercel AI SDK with Anthropic Claude (`@ai-sdk/anthropic`, `ai`)
- **Payments:** Stripe (when implementing monetization)
- **UI Components:** Shadcn UI pattern with `class-variance-authority`, `clsx`, `tailwind-merge`

## Architecture

```
app/
├── (auth)/           # Login/signup routes (Clerk)
├── (dashboard)/      # Protected routes (main app)
│   ├── transform/    # Create affirmation (AI generation)
│   ├── practice/     # Typing practice sessions
│   ├── library/      # Saved affirmations
│   ├── leaderboard/  # Rankings
│   └── profile/      # User stats, badges, settings
├── api/
│   └── generate/     # AI transformation endpoint
└── documentation/    # PRD, build order, v0 prompts

convex/
├── schema.ts         # Database tables: users, affirmations, practices, badges
├── queries.ts        # Read operations
├── mutations.ts      # Write operations (createAffirmation, completePractice, etc.)
├── actions.ts        # External API calls
└── lib/              # XP calculator, badge checker, streak logic
```

## Key Concepts

### Self-Talk Levels (1-5)
- Level 1: Negative Acceptance ("I can't...")
- Level 2: Recognition ("I should...")
- Level 3: Decision to Change ("I no longer...") - target
- Level 4: The Better You ("I am...") - target
- Level 5: Universal Affirmation

AI transforms Level 1-2 input into Level 3-4 affirmations.

### Gamification System
- **XP:** +15 per practice, +10 first today, +5/+15 for 10/20 reps, +25 new affirmation
- **Streak Multipliers:** 1.0x (0-1 days) → 1.2x (2-6) → 1.5x (7-13) → 1.75x (14-29) → 2.0x (30+)
- **50 Levels** with 5 tiers: Novice (1-10), Apprentice (11-20), Practitioner (21-30), Expert (31-40), Master (41-50)
- **Celebrations:** Standard practice, level up toast, tier change modal with confetti, milestone rewards

### Tier Colors
- Novice: gray, Apprentice: blue, Practitioner: purple, Expert: gold, Master: red

## Development Patterns

### Convex Queries/Mutations
```typescript
// Client-side with hooks
const user = useQuery(api.queries.getCurrentUser);
const createAffirmation = useMutation(api.mutations.createAffirmation);

// Server-side (API routes)
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const user = await convex.query(api.queries.getCurrentUser);
```

### AI Generation (API Route)
Uses Vercel AI SDK with structured JSON output. System prompt implements Self-Talk Solution methodology. Returns `{ analysis, affirmations[] }`.

### Practice Validation
Compare typed input to affirmation (case-insensitive, trimmed). On match: increment count, clear input, add XP. At 10 reps: call `completePractice` mutation.

## Documentation Reference

Detailed specs are in `app/documentation/`:
- `mindshift-prd.md` - Full technical requirements, database schema, API design
- `mindshift-build-order.md` - 8-week phased implementation with v0/Cursor prompts
- `mindshift-concept.md` - Product vision, methodology, competitive analysis
- `ui-screens.md` - v0 prompts for all UI components
- `mindshift-practice-heatmap.md` - GitHub-style activity visualization spec

## Build Phases Summary

1. **Foundation:** Auth, Convex schema, XP system
2. **Core Features:** Transform, Practice, Dashboard
3. **Gamification:** Badges, celebrations, 50-level system
4. **Social:** Leaderboard, Library, Profile
5. **Polish:** Animations, heatmap, PWA
6. **Monetization:** Stripe, feature gating
7. **Analytics:** PostHog, email (Resend), Sentry
8. **Launch:** Landing page, Product Hunt

## Revenue Model

### Pricing Tiers

| | Free | Pro |
|---|---|---|
| **Price** | $0 | $9.99/mo or $79/year |
| **AI Transforms** | 10 lifetime | Unlimited |
| **Practice Sessions** | Unlimited | Unlimited |
| **Gamification** | Full (50 levels, basic badges) | Full + exclusive Pro badges |
| **Leaderboard** | View only | Custom username, compete |
| **Insights** | Basic stats | Weekly AI insight email |
| **Extras** | - | Streak Shield (1 miss/week), export, dark mode |

### Why This Model

1. **10 lifetime transforms** (not monthly) - Users experience full value with core negative thoughts, upgrade when they want more
2. **$9.99 price point** - Mental wellness commands premium pricing; $4.99 signals "cheap app"
3. **Annual push at $79/year** - 34% discount, better LTV, "2 months free" positioning
4. **No Elite tier** - Focus on Free→Pro conversion first, add tiers later

### Conversion Strategy

- 7-day Pro trial (no credit card required)
- Contextual upgrade prompts ("8 of 10 transforms used")
- Streak Shield as key Pro differentiator
- Push annual plans for better retention
