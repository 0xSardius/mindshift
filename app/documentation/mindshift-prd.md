# Mindshift: Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** November 22, 2024  
**Owner:** Justin Melton  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [UI/UX Specifications](#uiux-specifications)
7. [Component Architecture](#component-architecture)
8. [Feature Specifications](#feature-specifications)
9. [Implementation Phases](#implementation-phases)
10. [Testing Strategy](#testing-strategy)
11. [Launch Checklist](#launch-checklist)

---

## Executive Summary

### Product Overview

Mindshift is a mobile-first web application (PWA) that helps users quit negative thinking through AI-powered affirmation transformation and gamified practice. Users input negative self-talk, receive personalized affirmations based on Self-Talk Solution methodology, practice through manual typing, and compete on leaderboards.

### Core User Flow

```
1. User inputs negative thought: "I'm terrible at public speaking"
2. AI generates 3-5 personalized affirmations
3. User selects one and practices (types 10x)
4. Earns XP, maintains streak, sees leaderboard rank
5. Repeats daily, building consistency and neural pathways
```

### Success Metrics

- **30-day retention:** >40% (target)
- **Daily active practice:** 5+ days/week
- **Conversion to paid:** 10-15% within 60 days
- **Practice completion rate:** >70%

---

## Technical Stack

### Frontend Framework

**Next.js 14.2+ (App Router)**

- File-based routing with app directory
- Server Components for initial load performance
- Client Components for interactive elements
- Built-in API routes (minimal, Convex handles most)
- Optimized for mobile-first responsive design

**Why Next.js:**

- Best-in-class React framework for 2024
- Excellent PWA support with next-pwa
- Server-side rendering for SEO (landing page)
- Vercel deployment integration
- Strong TypeScript support

### UI Framework & Styling

**Shadcn UI + Tailwind CSS**

**Shadcn Components to Use:**

- Button, Input, Textarea (forms)
- Card, Badge, Avatar (content display)
- Dialog, Sheet, Tabs (navigation/modals)
- Progress, Skeleton (loading states)
- Toast (notifications)
- Select, Switch, RadioGroup (settings)
- ScrollArea (long lists)

**Custom Components to Build:**

- PracticeInput (typing tracker)
- StreakCounter (flame animation)
- XPProgressBar (level progression)
- LeaderboardRow (rank display)
- AffirmationCard (library items)
- CelebrationModal (completion animation)

**Tailwind Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mental health brand colors
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#3b82f6", // Calm blue
          600: "#2563eb",
          700: "#1d4ed8",
        },
        success: {
          500: "#10b981", // Green for completion
        },
        warning: {
          500: "#f59e0b", // Orange for streaks
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Animation Library

**Framer Motion 11+**

- Celebration animations (confetti, scale, fade)
- Progress bar fills
- Badge unlock animations
- Smooth page transitions
- Gesture interactions (swipe, drag)

**Key Animations:**

```typescript
// Celebration on practice completion
const celebrationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200 },
  },
};

// XP gain animation
const xpGainVariants = {
  initial: { y: 0, opacity: 1 },
  animate: { y: -50, opacity: 0 },
};

// Streak flame pulse
const flameVariants = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.2, 1],
    transition: { repeat: Infinity, duration: 2 },
  },
};
```

### Backend & Database

**Convex (convex.dev)**

**Why Convex:**

- Real-time reactive queries (leaderboards update live)
- Built-in authentication
- TypeScript-first
- Serverless functions included
- File storage (future: images)
- Excellent DX for rapid development
- Free tier: 1GB storage, 1M function calls/month

**Convex Functions We'll Write:**

- `mutations.ts`: createAffirmation, completePractice, updateStreak
- `queries.ts`: getAffirmations, getLeaderboard, getUserStats
- `actions.ts`: generateAffirmations (calls Anthropic API)
- `http.ts`: Webhook handlers (Stripe)

### AI Integration

**Anthropic Claude API via Vercel AI SDK**

**Model Choice:**

- **Primary:** Claude 3.5 Sonnet (`claude-sonnet-4-20250514`)
  - Best quality for transformation
  - ~$3 per 1M input tokens
  - Use for all transformations

**Alternative for Cost Optimization (Future):**

- **Claude 3.5 Haiku** for simple requests
- Switch if costs exceed $50/month at scale

**Vercel AI SDK Benefits:**

- Streaming responses (better UX)
- React hooks (useChat, useCompletion)
- Built-in error handling
- Token counting
- TypeScript support
- Provider-agnostic (easy to switch models)
- Edge runtime compatible

**Implementation Architecture:**

```
User Input → Next.js API Route → Vercel AI SDK → Anthropic → Stream Response
                                                              ↓
                                                        React Component
```

**API Route Implementation:**

````typescript
// app/api/generate/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Self-Talk Solution methodology prompt
const SYSTEM_PROMPT = `You are an expert in Cognitive Behavioral Therapy (CBT) and the Self-Talk Solution methodology by Shad Helmstetter.

Your task is to analyze negative self-talk and transform it into empowering affirmations.

ANALYSIS PHASE:
1. Identify the Self-Talk Level (1-5):
   - Level 1: Negative Acceptance ("I can't...", "I'll never...")
   - Level 2: Recognition ("I should...", "I need to...")
   - Level 3: Decision to Change ("I no longer...", "I am learning...")
   - Level 4: The Better You ("I am...", present tense identity)
   - Level 5: Universal Affirmation (highest spiritual level)

2. Identify cognitive distortions:
   - All-or-nothing thinking
   - Overgeneralization
   - Mental filtering
   - Catastrophizing
   - Personalization
   - Should statements

3. Identify theme: Self-worth, Competence, Relationships, Health, Career, etc.

TRANSFORMATION RULES:
Generate affirmations that are:
- Present tense ("I am" not "I will")
- Positive (what they ARE, not what they're NOT)
- Personal (first person "I")
- Believable (bridge current state to desired state)
- Specific (address the exact fear or pattern)
- Level 3-4 focused (Decision to Change or Better You)

RESPONSE FORMAT (JSON only, no markdown):
{
  "analysis": {
    "detected_level": 1-5,
    "distortions": ["distortion1", "distortion2"],
    "theme": "category name"
  },
  "affirmations": [
    {
      "text": "The affirmation text",
      "level": 3 or 4,
      "reasoning": "Brief explanation why this helps"
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { negativeThought } = await req.json();

    if (!negativeThought || negativeThought.length < 10) {
      return Response.json(
        { error: "Negative thought must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Get user tier from Convex (determines suggestion count)
    const user = await convex.query(api.queries.getCurrentUser);
    const suggestionCount = user?.tier === "free" ? 3 : 5;

    // Generate with Vercel AI SDK
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: `Transform this negative thought into ${suggestionCount} empowering affirmations:\n\n"${negativeThought}"`,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Parse JSON response
    let result;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return Response.json(
        { error: "Failed to generate affirmations. Please try again." },
        { status: 500 }
      );
    }

    // Validate response structure
    if (
      !result.analysis ||
      !result.affirmations ||
      !Array.isArray(result.affirmations)
    ) {
      return Response.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    // Limit to tier-appropriate count
    result.affirmations = result.affirmations.slice(0, suggestionCount);

    return Response.json(result);
  } catch (error) {
    console.error("Error generating affirmations:", error);

    if (error instanceof Error && error.message.includes("rate_limit")) {
      return Response.json(
        { error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Failed to generate affirmations. Please try again." },
      { status: 500 }
    );
  }
}
````

**Client-Side Usage (Non-Streaming):**

```typescript
// app/(dashboard)/transform/page.tsx
'use client';

import { useState } from 'react';

interface Affirmation {
  text: string;
  level: number;
  reasoning: string;
}

interface GenerateResponse {
  analysis: {
    detected_level: number;
    distortions: string[];
    theme: string;
  };
  affirmations: Affirmation[];
}

export default function TransformPage() {
  const [negativeThought, setNegativeThought] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negativeThought }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1>Create Affirmation</h1>

      <textarea
        value={negativeThought}
        onChange={(e) => setNegativeThought(e.target.value)}
        placeholder="What negative thought do you want to quit?"
        className="w-full h-32 p-4 border rounded"
      />

      <button
        onClick={handleGenerate}
        disabled={isLoading || negativeThought.length < 10}
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Generating...' : 'Generate Affirmations'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {result.affirmations.map((aff, i) => (
            <div key={i} className="p-4 border rounded">
              <p className="font-semibold">{aff.text}</p>
              <p className="text-sm text-gray-600 mt-2">{aff.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Alternative: Streaming Version (Better UX - Optional)**

```typescript
// app/api/generate/stream/route.ts
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { negativeThought } = await req.json();

  const result = await streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    prompt: `Transform: "${negativeThought}"`,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}

// Client usage with streaming
import { useCompletion } from "ai/react";

export default function TransformPage() {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/generate/stream",
  });

  // completion updates in real-time as AI generates
  // Parse JSON when complete
}
```

**Why This Architecture:**

✅ **Next.js API Route + Vercel AI SDK:**

- Better DX than Convex actions for AI
- Can use Clerk auth middleware
- Streaming support out of the box
- Edge runtime compatible
- Query Convex for user tier before generating

✅ **Cost Control:**

- Check user tier before API call
- Free: 3 suggestions (~500 tokens)
- Pro: 5 suggestions (~750 tokens)
- Estimate: ~$0.002 per transformation

✅ **Error Handling:**

- Rate limiting (429)
- JSON parsing fallback
- User-friendly error messages
- Sentry logging (Phase 7)

### Authentication

**Clerk**

**Why Clerk over Convex Auth/NextAuth:**

- Best-in-class auth UX (polished, mobile-optimized)
- Multiple social providers (Google, GitHub, Apple)
- User management dashboard included
- Webhooks for user lifecycle events
- Session management + middleware
- Excellent mobile experience
- Better developer experience

**Auth Providers:**

- Google OAuth (primary - one-click signup)
- Email + Password (secondary)
- GitHub (optional)

**Clerk + Convex Integration:**

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut } = convexAuth({
  providers: [
    {
      id: "clerk",
      async getUserIdentity(ctx) {
        // Clerk user info is automatically synced
        return ctx.auth.getUserIdentity();
      },
    },
  ],
});
```

**Cost:** Free up to 10,000 MAUs (more than enough for MVP)

### Payment Processing

**Stripe**

**Why Stripe:**

- Industry standard
- Excellent docs
- React/Next.js libraries
- Subscription management
- Customer portal included
- Free to start (2.9% + 30¢)

**Products:**

- Mindshift Pro: $4.99/month or $49/year
- Mindshift Elite: $9.99/month or $99/year (future)

**Stripe Integration:**

```typescript
// Using @stripe/stripe-js + stripe webhook to Convex
// Convex HTTP endpoint handles webhook events
```

### Analytics

**PostHog (Chosen)**

**Why PostHog over Mixpanel:**

- Open source option available
- Generous free tier (1M events/month)
- Session replay included
- Feature flags (useful for A/B testing)
- Self-hostable if needed
- Better privacy controls

**Events to Track:**

- `affirmation_created`
- `practice_started`
- `practice_completed`
- `streak_maintained`
- `badge_earned`
- `leaderboard_viewed`
- `upgrade_clicked`
- `subscription_started`

### Email Service

**Resend (Chosen)**

**Why Resend over SendGrid:**

- Modern API (better DX)
- Free tier: 3,000 emails/month
- React Email integration
- Better deliverability
- Simpler pricing

**Email Templates:**

- Welcome email
- Daily practice reminder
- Streak milestone (7, 30, 100 days)
- Weekly progress report (optional)
- Upgrade prompts

### Error Tracking

**Sentry**

**Free Tier:** 5K errors/month
**Integration:** Next.js SDK
**Captures:** JS errors, API failures, performance issues

### PWA Configuration

**next-pwa plugin**

```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  // ... other config
});
```

**PWA Features:**

- Add to home screen prompt
- Offline support (basic)
- Push notifications (practice reminders)
- App-like navigation

### Hosting & Deployment

**Vercel**

**Why Vercel:**

- Built for Next.js
- Zero-config deployment
- Automatic HTTPS
- Preview deployments
- Edge functions
- Free hobby tier

**Domains:**

- Primary: mindshift.app (or .ai/.io)
- Staging: staging.mindshift.app

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 14 App (PWA)                                 │  │
│  │  - App Router (file-based routing)                    │  │
│  │  - React Server Components                            │  │
│  │  - Shadcn UI + Tailwind                              │  │
│  │  - Framer Motion                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Backend Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Convex Backend                                       │  │
│  │  ├─ Queries (read operations)                        │  │
│  │  ├─ Mutations (write operations)                     │  │
│  │  ├─ Actions (external API calls)                     │  │
│  │  └─ HTTP Endpoints (webhooks)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Convex Database │  │  External APIs   │
         │  - Users         │  │  - Anthropic     │
         │  - Affirmations  │  │  - Stripe        │
         │  - Practices     │  │  - Resend        │
         │  - Badges        │  │  - PostHog       │
         └──────────────────┘  └──────────────────┘
```

### Data Flow Examples

**Creating an Affirmation:**

```
1. User enters negative thought in UI
2. Client calls Convex action: generateAffirmations
3. Action calls Anthropic API with Self-Talk Solution prompt
4. AI returns 3-5 affirmations with analysis
5. Action stores analysis, returns affirmations to client
6. User selects one
7. Client calls Convex mutation: createAffirmation
8. Mutation stores affirmation in database
9. Reactive query updates UI with new affirmation
```

**Completing a Practice:**

```
1. User completes typing 10 repetitions
2. Client calls Convex mutation: completePractice
3. Mutation:
   - Creates practice record
   - Updates affirmation stats (times_practiced++)
   - Calculates XP earned
   - Updates user XP and level
   - Checks for streak continuation
   - Checks for badge eligibility
4. Mutation returns updated user data + any new badges
5. Client shows celebration animation
6. Real-time query updates leaderboard
```

**Viewing Leaderboard:**

```
1. User navigates to leaderboard screen
2. Client subscribes to Convex query: getWeeklyLeaderboard
3. Query returns top 100 users by rep count this week
4. When any user completes practice, query automatically re-runs
5. UI updates in real-time (no polling needed)
6. User sees their rank update live
```

### File Structure

```
mindshift/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/              # Main app routes (require auth)
│   │   ├── layout.tsx            # Bottom nav + shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── transform/
│   │   │   └── page.tsx
│   │   ├── practice/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── library/
│   │   │   └── page.tsx
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/                      # Next.js API routes (minimal)
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── affirmations/
│   │   ├── affirmation-card.tsx
│   │   ├── affirmation-generator.tsx
│   │   └── affirmation-list.tsx
│   ├── practice/
│   │   ├── practice-input.tsx
│   │   ├── practice-progress.tsx
│   │   └── celebration-modal.tsx
│   ├── leaderboard/
│   │   ├── leaderboard-table.tsx
│   │   └── leaderboard-row.tsx
│   ├── profile/
│   │   ├── stats-card.tsx
│   │   ├── badge-display.tsx
│   │   └── streak-counter.tsx
│   ├── layout/
│   │   ├── bottom-nav.tsx
│   │   ├── header.tsx
│   │   └── mobile-shell.tsx
│   └── shared/
│       ├── loading.tsx
│       └── error-boundary.tsx
│
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── auth.config.ts            # Auth configuration
│   ├── queries.ts                # Read operations
│   ├── mutations.ts              # Write operations
│   ├── actions.ts                # External API calls
│   ├── http.ts                   # HTTP endpoints
│   ├── lib/
│   │   ├── ai-prompts.ts         # Self-Talk Solution prompts
│   │   ├── xp-calculator.ts      # Gamification logic
│   │   ├── badge-checker.ts      # Badge eligibility
│   │   └── streak-tracker.ts     # Streak logic
│   └── types.ts                  # Shared types
│
├── lib/                          # Client-side utilities
│   ├── utils.ts                  # General utilities
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-affirmations.ts
│   │   └── use-leaderboard.ts
│   └── constants.ts              # App constants
│
├── public/                       # Static assets
│   ├── icons/
│   ├── images/
│   └── manifest.json             # PWA manifest
│
├── emails/                       # Email templates (React Email)
│   ├── welcome.tsx
│   ├── daily-reminder.tsx
│   └── streak-milestone.tsx
│
├── .env.local                    # Environment variables
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## Database Schema

### Convex Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Auth
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    authProvider: v.string(), // "google" | "email"

    // Profile
    username: v.optional(v.string()), // For leaderboard
    anonymousMode: v.boolean(), // Default: true

    // Gamification
    currentStreak: v.number(), // Days in a row
    longestStreak: v.number(),
    lastPracticeDate: v.optional(v.string()), // ISO date for streak tracking
    totalXP: v.number(),
    level: v.number(),

    // Settings
    dailyPracticeGoal: v.number(), // Default: 1 practice per day
    reminderTime: v.optional(v.string()), // "09:00" format
    reminderEnabled: v.boolean(),

    // Subscription
    tier: v.string(), // "free" | "pro" | "elite"
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionEndsAt: v.optional(v.number()), // Timestamp

    // Metadata
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  affirmations: defineTable({
    userId: v.id("users"),

    // User input
    originalThought: v.string(), // The negative self-talk

    // AI analysis (hidden from user, for future coaching)
    detectedLevel: v.optional(v.number()), // 1-5 (Self-Talk Solution)
    cognitiveDistortions: v.optional(v.array(v.string())),
    themeCategory: v.optional(v.string()), // "confidence", "capability", etc.

    // Selected affirmation
    affirmationText: v.string(),
    chosenLevel: v.optional(v.number()), // 3, 4, or 5
    userEdited: v.boolean(), // Did they customize AI suggestion?

    // Practice stats
    timesPracticed: v.number(), // Number of practice sessions
    totalRepetitions: v.number(), // Sum of all reps
    lastPracticedAt: v.optional(v.number()), // Timestamp

    // Status
    archived: v.boolean(),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "archived"])
    .index("by_theme", ["themeCategory"]),

  practices: defineTable({
    userId: v.id("users"),
    affirmationId: v.id("affirmations"),

    // Practice details
    repetitions: v.number(), // How many times typed this session
    xpEarned: v.number(),
    durationSeconds: v.number(), // Time spent in practice

    // Metadata
    practicedAt: v.number(), // Timestamp
  })
    .index("by_user", ["userId"])
    .index("by_affirmation", ["affirmationId"])
    .index("by_date", ["practicedAt"]),

  badges: defineTable({
    userId: v.id("users"),
    badgeType: v.string(), // "first_steps", "week_warrior", etc.
    earnedAt: v.number(), // Timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "badgeType"]),

  // For future features
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "practice_reminder", "streak_milestone", etc.
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
```

### Badge Types Reference

```typescript
// convex/lib/badge-types.ts
export const BADGE_TYPES = {
  // Milestone badges (core progression)
  FIRST_STEPS: {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first practice session",
    icon: "🌱",
    criteria: { practices: 1 },
  },
  WEEK_WARRIOR: {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    criteria: { streak: 7 },
  },
  MONTH_MASTER: {
    id: "month_master",
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "💪",
    criteria: { streak: 30 },
  },
  CENTURY_CLUB: {
    id: "century_club",
    name: "Century Club",
    description: "Complete 100 total repetitions",
    icon: "💯",
    criteria: { totalReps: 100 },
  },
  POWER_USER: {
    id: "power_user",
    name: "Power User",
    description: "Complete 500 total repetitions",
    icon: "⚡",
    criteria: { totalReps: 500 },
  },
  TRANSFORMER: {
    id: "transformer",
    name: "Transformer",
    description: "Create 50 affirmations",
    icon: "🎯",
    criteria: { affirmations: 50 },
  },
  GRAND_MASTER: {
    id: "grand_master",
    name: "Grand Master",
    description: "Complete 1,000 total repetitions",
    icon: "👑",
    criteria: { totalReps: 1000 },
  },
  LEGEND: {
    id: "legend",
    name: "Legend",
    description: "Maintain a 100-day streak",
    icon: "🌟",
    criteria: { streak: 100 },
  },
  ELITE: {
    id: "elite",
    name: "Elite",
    description: "Complete 5,000 total repetitions",
    icon: "💎",
    criteria: { totalReps: 5000 },
  },

  // Tier progression badges (unlock at tier completion)
  NOVICE_COMPLETE: {
    id: "novice_complete",
    name: "Novice Graduate",
    description: "Reached Level 10",
    icon: "🎓",
    criteria: { level: 10 },
  },
  APPRENTICE_COMPLETE: {
    id: "apprentice_complete",
    name: "Apprentice Graduate",
    description: "Reached Level 20",
    icon: "📚",
    criteria: { level: 20 },
  },
  PRACTITIONER_COMPLETE: {
    id: "practitioner_complete",
    name: "Practitioner Graduate",
    description: "Reached Level 30",
    icon: "🥋",
    criteria: { level: 30 },
  },
  EXPERT_COMPLETE: {
    id: "expert_complete",
    name: "Expert Graduate",
    description: "Reached Level 40",
    icon: "🏅",
    criteria: { level: 40 },
  },
  MASTER_COMPLETE: {
    id: "master_complete",
    name: "Master",
    description: "Reached Level 50",
    icon: "🏆",
    criteria: { level: 50 },
  },

  // Special achievement badges
  EARLY_BIRD: {
    id: "early_bird",
    name: "Early Bird",
    description: "Practice before 7am 10 times",
    icon: "🌅",
    criteria: { earlyPractices: 10 },
  },
  NIGHT_OWL: {
    id: "night_owl",
    name: "Night Owl",
    description: "Practice after 10pm 10 times",
    icon: "🦉",
    criteria: { latePractices: 10 },
  },
  VARIETY_SEEKER: {
    id: "variety_seeker",
    name: "Variety Seeker",
    description: "Practice 20 different affirmations",
    icon: "🎨",
    criteria: { uniqueAffirmations: 20 },
  },
} as const;
```

### XP & Level System

```typescript
// convex/lib/xp-calculator.ts

// Base XP values
export const XP_COMPLETE_PRACTICE = 15;
export const XP_FIRST_TODAY = 10;
export const XP_FULL_SESSION_10 = 5;
export const XP_FULL_SESSION_20 = 15;
export const XP_NEW_AFFIRMATION = 25;
export const XP_MORNING_PRACTICE = 10; // Before 10am
export const XP_CONSISTENCY_BONUS = 20; // 5 days this week

// Streak multipliers (smooth progression)
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0; // 2x at 30+ days
  if (streak >= 14) return 1.75; // 1.75x at 14+ days
  if (streak >= 7) return 1.5; // 1.5x at 7+ days
  if (streak >= 2) return 1.2; // 1.2x at 2+ days
  return 1.0; // Base rate
}

// 50-Level thresholds (smooth exponential curve)
// Formula: 20 × (1.11^N) for level N
// Average ~42 XP/day with streak = ~343 days to level 50
export const LEVEL_THRESHOLDS = [
  // NOVICE (Levels 1-10) - First 2 weeks
  { level: 1, xpRequired: 0 }, // Start
  { level: 2, xpRequired: 25 }, // ~1 day
  { level: 3, xpRequired: 55 }, // ~1.5 days
  { level: 4, xpRequired: 90 }, // ~2 days
  { level: 5, xpRequired: 130 }, // ~3 days
  { level: 6, xpRequired: 175 }, // ~4 days
  { level: 7, xpRequired: 225 }, // ~5 days
  { level: 8, xpRequired: 280 }, // ~7 days
  { level: 9, xpRequired: 340 }, // ~8 days
  { level: 10, xpRequired: 405 }, // ~10 days 🎉

  // APPRENTICE (Levels 11-20) - Weeks 2-4
  { level: 11, xpRequired: 475 }, // ~11 days
  { level: 12, xpRequired: 550 }, // ~13 days
  { level: 13, xpRequired: 630 }, // ~15 days
  { level: 14, xpRequired: 715 }, // ~17 days
  { level: 15, xpRequired: 805 }, // ~19 days
  { level: 16, xpRequired: 900 }, // ~21 days
  { level: 17, xpRequired: 1000 }, // ~24 days
  { level: 18, xpRequired: 1105 }, // ~26 days
  { level: 19, xpRequired: 1215 }, // ~29 days
  { level: 20, xpRequired: 1330 }, // ~32 days 🎉

  // PRACTITIONER (Levels 21-30) - Months 2-3
  { level: 21, xpRequired: 1460 }, // ~35 days
  { level: 22, xpRequired: 1605 }, // ~38 days
  { level: 23, xpRequired: 1765 }, // ~42 days
  { level: 24, xpRequired: 1940 }, // ~46 days
  { level: 25, xpRequired: 2130 }, // ~51 days
  { level: 26, xpRequired: 2335 }, // ~56 days
  { level: 27, xpRequired: 2555 }, // ~61 days
  { level: 28, xpRequired: 2790 }, // ~66 days
  { level: 29, xpRequired: 3040 }, // ~72 days
  { level: 30, xpRequired: 3305 }, // ~79 days 🎉

  // EXPERT (Levels 31-40) - Months 3-6
  { level: 31, xpRequired: 3595 }, // ~86 days
  { level: 32, xpRequired: 3910 }, // ~93 days
  { level: 33, xpRequired: 4250 }, // ~101 days
  { level: 34, xpRequired: 4615 }, // ~110 days
  { level: 35, xpRequired: 5005 }, // ~119 days
  { level: 36, xpRequired: 5420 }, // ~129 days
  { level: 37, xpRequired: 5860 }, // ~139 days
  { level: 38, xpRequired: 6325 }, // ~151 days
  { level: 39, xpRequired: 6815 }, // ~162 days
  { level: 40, xpRequired: 7330 }, // ~175 days 🎉

  // MASTER (Levels 41-50) - Months 6-12
  { level: 41, xpRequired: 7880 }, // ~188 days
  { level: 42, xpRequired: 8465 }, // ~202 days
  { level: 43, xpRequired: 9085 }, // ~216 days
  { level: 44, xpRequired: 9740 }, // ~232 days
  { level: 45, xpRequired: 10430 }, // ~248 days
  { level: 46, xpRequired: 11155 }, // ~266 days
  { level: 47, xpRequired: 11915 }, // ~284 days
  { level: 48, xpRequired: 12710 }, // ~303 days
  { level: 49, xpRequired: 13540 }, // ~323 days
  { level: 50, xpRequired: 14405 }, // ~343 days (~1 year) 🏆
];

// Tier system (visual identity and progression)
export const LEVEL_TIERS = {
  NOVICE: {
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    name: "Novice",
    color: "#94a3b8", // Gray
    icon: "🌱",
    description: "Beginning your journey",
  },
  APPRENTICE: {
    levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    name: "Apprentice",
    color: "#3b82f6", // Blue
    icon: "💫",
    description: "Learning the practice",
  },
  PRACTITIONER: {
    levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    name: "Practitioner",
    color: "#8b5cf6", // Purple
    icon: "💪",
    description: "Building mastery",
  },
  EXPERT: {
    levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    name: "Expert",
    color: "#f59e0b", // Gold
    icon: "⚡",
    description: "Advanced transformation",
  },
  MASTER: {
    levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    name: "Master",
    color: "#ef4444", // Red (prestige)
    icon: "🏆",
    description: "Elite mindshift master",
  },
};

// Get tier for a given level
export function getLevelTier(level: number) {
  for (const tier of Object.values(LEVEL_TIERS)) {
    if (tier.levels.includes(level)) {
      return tier;
    }
  }
  return LEVEL_TIERS.NOVICE;
}

// Milestone celebrations (every 10 levels)
export const MILESTONE_LEVELS = {
  10: {
    title: "First Milestone!",
    reward: "🎁 Unlocked: Dark mode theme",
    xpBonus: 50,
  },
  20: {
    title: "Apprentice Complete!",
    reward: "🎁 Unlocked: Custom affirmation categories",
    xpBonus: 100,
  },
  30: {
    title: "Halfway to Master!",
    reward: "🎁 Unlocked: Export affirmations (CSV)",
    xpBonus: 150,
  },
  40: {
    title: "Expert Achieved!",
    reward: "🎁 Unlocked: Advanced analytics dashboard",
    xpBonus: 200,
  },
  50: {
    title: "MASTER ACHIEVED!",
    reward: "🏆 Lifetime Pro membership + Master badge",
    xpBonus: 500,
  },
};

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

// Calculate progress to next level
export function calculateXPForNextLevel(
  currentXP: number,
  currentLevel: number
): {
  xpNeeded: number;
  xpProgress: number;
  percentProgress: number;
  tierProgress: string; // "3/10 to Apprentice"
} {
  const currentThreshold = LEVEL_THRESHOLDS.find(
    (l) => l.level === currentLevel
  );
  const nextThreshold = LEVEL_THRESHOLDS.find(
    (l) => l.level === currentLevel + 1
  );

  if (!currentThreshold || !nextThreshold) {
    return {
      xpNeeded: 0,
      xpProgress: 0,
      percentProgress: 100,
      tierProgress: "Max Level",
    };
  }

  const xpForThisLevel = nextThreshold.xpRequired - currentThreshold.xpRequired;
  const xpProgress = currentXP - currentThreshold.xpRequired;
  const percentProgress = Math.min((xpProgress / xpForThisLevel) * 100, 100);

  // Calculate tier progress
  const currentTier = getLevelTier(currentLevel);
  const nextTier = getLevelTier(currentLevel + 1);
  const levelsInCurrentTier = currentTier.levels.length;
  const currentLevelInTier = currentTier.levels.indexOf(currentLevel) + 1;

  let tierProgress = "";
  if (currentTier.name === nextTier.name) {
    // Still in same tier
    const levelsToNextTier = levelsInCurrentTier - currentLevelInTier;
    tierProgress = `${levelsToNextTier}/10 to ${nextTier.name}`;
  } else {
    // About to change tiers!
    tierProgress = `Next: ${nextTier.name} ${nextTier.icon}`;
  }

  return {
    xpNeeded: nextThreshold.xpRequired - currentXP,
    xpProgress,
    percentProgress,
    tierProgress,
  };
}

// Calculate XP for a practice session
export function calculatePracticeXP({
  repetitions,
  streak,
  isFirstToday,
  isNewAffirmation,
  isMorningPractice,
}: {
  repetitions: number;
  streak: number;
  isFirstToday: boolean;
  isNewAffirmation: boolean;
  isMorningPractice: boolean;
}): number {
  let baseXP = XP_COMPLETE_PRACTICE;

  // First practice today bonus
  if (isFirstToday) {
    baseXP += XP_FIRST_TODAY;
  }

  // Full session bonuses
  if (repetitions >= 20) {
    baseXP += XP_FULL_SESSION_20;
  } else if (repetitions >= 10) {
    baseXP += XP_FULL_SESSION_10;
  }

  // Apply streak multiplier
  const multiplier = getStreakMultiplier(streak);
  let totalXP = Math.floor(baseXP * multiplier);

  // Additional bonuses (not multiplied by streak)
  if (isNewAffirmation) {
    totalXP += XP_NEW_AFFIRMATION;
  }

  if (isMorningPractice) {
    totalXP += XP_MORNING_PRACTICE;
  }

  return totalXP;
}

// Check if level is a milestone
export function checkMilestone(level: number): {
  isMilestone: boolean;
  title?: string;
  reward?: string;
  xpBonus?: number;
} {
  const milestone = MILESTONE_LEVELS[level as keyof typeof MILESTONE_LEVELS];

  return {
    isMilestone: !!milestone,
    ...milestone,
  };
}

// Get celebration type for level (determines UI treatment)
export function getCelebrationType(
  level: number,
  previousLevel: number
): "major" | "standard" | "silent" | "tier-change" {
  const currentTier = getLevelTier(level);
  const previousTier = getLevelTier(previousLevel);

  // Tier change = major celebration
  if (currentTier.name !== previousTier.name) {
    return "tier-change";
  }

  // Milestone (every 10) = major celebration
  if (level % 10 === 0) {
    return "major";
  }

  // Levels 1-20: standard toast notification
  if (level <= 20) {
    return "standard";
  }

  // Levels 21-40: silent (just update badge)
  if (level <= 40) {
    return "silent";
  }

  // Levels 41-50: standard toast (renewed excitement for endgame)
  return "standard";
}
```

---

## API Design

### Convex Queries (Read Operations)

```typescript
// convex/queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get current user with stats
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    return user;
  },
});

// Get user's affirmations
export const getAffirmations = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db
      .query("affirmations")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", user._id).eq("archived", args.archived ?? false)
      )
      .order("desc")
      .collect();
  },
});

// Get single affirmation
export const getAffirmation = query({
  args: { id: v.id("affirmations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get weekly leaderboard
export const getWeeklyLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get all practices from last 7 days
    const practices = await ctx.db
      .query("practices")
      .withIndex("by_date", (q) => q.gte("practicedAt", weekAgo))
      .collect();

    // Group by user and sum repetitions
    const userReps = new Map<string, number>();
    practices.forEach((p) => {
      const current = userReps.get(p.userId) || 0;
      userReps.set(p.userId, current + p.repetitions);
    });

    // Get user details and sort
    const leaderboard = [];
    for (const [userId, reps] of userReps.entries()) {
      const user = await ctx.db.get(userId as any);
      if (user) {
        leaderboard.push({
          userId: user._id,
          username: user.anonymousMode
            ? "Anonymous User"
            : user.username || "Anonymous User",
          totalReps: reps,
          level: user.level,
        });
      }
    }

    return leaderboard
      .sort((a, b) => b.totalReps - a.totalReps)
      .slice(0, args.limit || 100);
  },
});

// Get user's badges
export const getUserBadges = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get practice history
export const getPracticeHistory = query({
  args: {
    affirmationId: v.optional(v.id("affirmations")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    let query = ctx.db
      .query("practices")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.affirmationId) {
      query = ctx.db
        .query("practices")
        .withIndex("by_affirmation", (q) =>
          q.eq("affirmationId", args.affirmationId!)
        );
    }

    return await query.order("desc").take(args.limit || 50);
  },
});
```

### Convex Mutations (Write Operations)

```typescript
// convex/mutations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create affirmation
export const createAffirmation = mutation({
  args: {
    originalThought: v.string(),
    affirmationText: v.string(),
    detectedLevel: v.optional(v.number()),
    cognitiveDistortions: v.optional(v.array(v.string())),
    themeCategory: v.optional(v.string()),
    chosenLevel: v.optional(v.number()),
    userEdited: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    // Check free tier limit
    if (user.tier === "free") {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const affirmationsThisMonth = await ctx.db
        .query("affirmations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.gte(q.field("createdAt"), thisMonth.getTime()))
        .collect();

      if (affirmationsThisMonth.length >= 5) {
        throw new Error(
          "Free tier limit reached. Upgrade to Pro for unlimited affirmations."
        );
      }
    }

    const now = Date.now();
    const affirmationId = await ctx.db.insert("affirmations", {
      userId: user._id,
      originalThought: args.originalThought,
      affirmationText: args.affirmationText,
      detectedLevel: args.detectedLevel,
      cognitiveDistortions: args.cognitiveDistortions,
      themeCategory: args.themeCategory,
      chosenLevel: args.chosenLevel,
      userEdited: args.userEdited,
      timesPracticed: 0,
      totalRepetitions: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });

    return affirmationId;
  },
});

// Complete practice session
export const completePractice = mutation({
  args: {
    affirmationId: v.id("affirmations"),
    repetitions: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];

    // Calculate XP
    let xpEarned = XP_PER_PRACTICE;

    // Check if maintaining streak
    const lastPractice = user.lastPracticeDate;
    let newStreak = user.currentStreak;
    let streakMaintained = false;

    if (lastPractice) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastPractice === yesterdayStr) {
        // Continuing streak
        newStreak += 1;
        xpEarned += XP_STREAK_BONUS;
        streakMaintained = true;

        // Milestone bonuses
        if (newStreak === 7) xpEarned += XP_7DAY_BONUS;
        if (newStreak === 30) xpEarned += XP_30DAY_BONUS;
      } else if (lastPractice !== today) {
        // Broke streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Update user
    const newTotalXP = user.totalXP + xpEarned;
    const newLevel = calculateLevel(newTotalXP);
    const longestStreak = Math.max(user.longestStreak, newStreak);

    await ctx.db.patch(user._id, {
      totalXP: newTotalXP,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastPracticeDate: today,
      updatedAt: now,
    });

    // Create practice record
    await ctx.db.insert("practices", {
      userId: user._id,
      affirmationId: args.affirmationId,
      repetitions: args.repetitions,
      xpEarned: xpEarned,
      durationSeconds: args.durationSeconds,
      practicedAt: now,
    });

    // Update affirmation stats
    const affirmation = await ctx.db.get(args.affirmationId);
    if (affirmation) {
      await ctx.db.patch(args.affirmationId, {
        timesPracticed: affirmation.timesPracticed + 1,
        totalRepetitions: affirmation.totalRepetitions + args.repetitions,
        lastPracticedAt: now,
        updatedAt: now,
      });
    }

    // Check for new badges
    const newBadges = await checkBadgeEligibility(ctx, user._id, {
      practices: await ctx.db
        .query("practices")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
        .then((p) => p.length),
      totalReps: await ctx.db
        .query("practices")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
        .then((p) => p.reduce((sum, pr) => sum + pr.repetitions, 0)),
      affirmations: await ctx.db
        .query("affirmations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect()
        .then((a) => a.length),
      streak: newStreak,
    });

    return {
      xpEarned,
      newLevel,
      leveledUp: newLevel > user.level,
      streakMaintained,
      currentStreak: newStreak,
      newBadges,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    anonymousMode: v.optional(v.boolean()),
    dailyPracticeGoal: v.optional(v.number()),
    reminderTime: v.optional(v.string()),
    reminderEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) throw new Error("User not found");

    // Check username uniqueness if provided
    if (args.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();

      if (existing && existing._id !== user._id) {
        throw new Error("Username already taken");
      }
    }

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Archive affirmation
export const archiveAffirmation = mutation({
  args: { id: v.id("affirmations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      archived: true,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
```

### Convex Actions (External API Calls)

```typescript
// convex/actions.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { api } from "./_generated/api";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const generateAffirmations = action({
  args: {
    negativeThought: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get user tier for suggestion count
    const user = await ctx.runQuery(api.queries.getCurrentUser);
    const suggestionCount =
      user?.tier === "pro" || user?.tier === "elite" ? 5 : 3;

    const systemPrompt = `You are an expert in the Self-Talk Solution methodology by Shad Helmstetter and cognitive behavioral therapy. Transform negative self-talk into effective affirmations.

TRANSFORMATION RULES:
- Present tense ("I am" not "I will")
- Positive (what they ARE, not what they're NOT)
- Personal (first person "I")
- Believable (bridge current → desired state)
- Specific (addresses their exact fear)

ANALYSIS:
1. Detect Self-Talk Level (1-5)
2. Identify cognitive distortions
3. Extract core theme

OUTPUT ${suggestionCount} affirmations:
- 1-2 Level 3 options (transitional, believable)
- ${suggestionCount - 2} Level 4 options (aspirational, identity-based)

Return as JSON:
{
  "analysis": {
    "detected_level": number (1-5),
    "distortions": string[],
    "theme": string
  },
  "affirmations": [
    {"text": string, "level": number (3 or 4)},
    ...
  ]
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `USER INPUT: "${args.negativeThought}"`,
          },
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const result = JSON.parse(content.text);
      return result;
    } catch (error) {
      console.error("Error generating affirmations:", error);
      throw new Error("Failed to generate affirmations");
    }
  },
});
```

### Stripe Webhook Handler

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";
import { api } from "./_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      const body = await request.text();
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Update user subscription status
        await ctx.runMutation(api.mutations.updateSubscription, {
          stripeCustomerId: session.customer as string,
          tier: "pro",
          subscriptionStatus: "active",
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(api.mutations.updateSubscription, {
          stripeCustomerId: subscription.customer as string,
          subscriptionStatus: subscription.status,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(api.mutations.updateSubscription, {
          stripeCustomerId: subscription.customer as string,
          tier: "free",
          subscriptionStatus: "canceled",
        });
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

---

## UI/UX Specifications

### Design System

**Color Palette:**

```css
/* Primary (Calm Blue) */
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-500: #3b82f6; /* Main brand color */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Success (Green) */
--success-500: #10b981;
--success-600: #059669;

/* Warning (Orange - for streaks) */
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Neutral (Gray) */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

**Typography:**

```css
/* Font Family */
font-family: "Inter", system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing:**

```css
/* Use Tailwind's spacing scale */
space-1: 0.25rem  /* 4px */
space-2: 0.5rem   /* 8px */
space-3: 0.75rem  /* 12px */
space-4: 1rem     /* 16px */
space-6: 1.5rem   /* 24px */
space-8: 2rem     /* 32px */
space-12: 3rem    /* 48px */
```

**Border Radius:**

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 1rem; /* 16px */
--radius-full: 9999px; /* Full circle */
```

### Screen Designs

#### 1. Dashboard (Home Screen)

**Layout (Tier-First Display):**

```
┌─────────────────────────────────┐
│ Welcome back, Justin! 👋        │ Header
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ EXPERT ⚡                    │ │ (Gold background)
│ │ Level 32                     │ │
│ │ ▓▓▓▓▓▓▓░░░ 2/10 to Master   │ │ (Tier progress)
│ │                              │ │
│ │ 🔥 45 days    8,465 XP       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [+ Create New Affirmation]      │ Primary CTA
├─────────────────────────────────┤
│ Quick Practice                   │ Section Title
│ ┌─────────────────────────────┐ │
│ │ "I handle challenges..."    │ │
│ │ Practiced 12 times   [Practice →]│
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ "I am capable of..."        │ │
│ │ Practiced 8 times    [Practice →]│
│ └─────────────────────────────┘ │
│                                  │
│ [View All Affirmations →]       │
├─────────────────────────────────┤
│ Today's Progress                 │
│ □ Practice Goal (0/1)           │
│ □ Maintain Streak               │
└─────────────────────────────────┘
[🏠] [➕] [📚] [🏆] [👤]           Bottom Nav
```

**Key Changes for 50-Level System:**

- **Tier name most prominent** (EXPERT ⚡)
- **Level number secondary** (Level 32)
- **Tier progress bar** (2/10 to Master) - shows big-picture goal
- **Streak and total XP** in same card
- Background color changes per tier

**Components:**

- TierCard (shows tier, level, progress)
- Stat row (streak, XP)
- Large CTA button (primary action)
- Affirmation cards (quick access to 3 most recent)
- Progress checklist
- Bottom navigation

**Interactions:**

- Tap TierCard → Navigate to Profile with level details
- Tap CTA → Navigate to Transform screen
- Tap "Practice →" → Navigate to Practice screen for that affirmation
- Tap affirmation card → View details/edit

---

#### 2. Transform Screen

**Layout:**

```
┌─────────────────────────────────┐
│ ← Create Affirmation            │ Header
├─────────────────────────────────┤
│                                  │
│ What negative thought do you    │
│ want to quit?                   │
│                                  │
│ ┌─────────────────────────────┐│
│ │                             ││
│ │ [Large textarea]            ││
│ │                             ││
│ │                             ││
│ └─────────────────────────────┘│
│                                  │
│ [Generate Affirmations →]      │
│                                  │
└─────────────────────────────────┘

/* After generation: */

┌─────────────────────────────────┐
│ ← Choose Your Affirmation       │
├─────────────────────────────────┤
│ ○ I speak clearly and           │
│   confidently in front of groups│
│                                  │
│ ○ I share my ideas with ease    │
│   when presenting               │
│                                  │
│ ○ I am becoming more comfortable│
│   speaking publicly             │
│                                  │
│ [Custom input if user wants to │
│  edit any suggestion]           │
│                                  │
│ [Save & Practice] [Save Only]  │
└─────────────────────────────────┘
```

**States:**

1. **Input State:** Empty textarea, disabled button
2. **Loading State:** Generating spinner, "Creating your affirmations..."
3. **Selection State:** Radio options, primary CTA
4. **Error State:** Friendly error message, retry button

**Validations:**

- Minimum 10 characters in textarea
- Maximum 500 characters
- Check free tier limit before generating

---

#### 3. Practice Screen

**Layout:**

```
┌─────────────────────────────────┐
│ ← Practice Session              │
├─────────────────────────────────┤
│                                  │
│ "I speak clearly and            │
│  confidently in front of groups"│
│                                  │
│ Type your affirmation 10 times  │
│                                  │
│ ┌─────────────────────────────┐│
│ │ [Large input box]           ││
│ │                             ││
│ └─────────────────────────────┘│
│                                  │
│ Progress: ██████░░░░ 6/10       │
│                                  │
│ 🎯 60 XP earned                 │
│                                  │
│ ⏱️ 2:34                          │ Timer
│                                  │
│ [Skip] [Pause]                  │
└─────────────────────────────────┘

/* On completion: */

┌─────────────────────────────────┐
│        🎉                        │
│   Practice Complete!             │
│                                  │
│   +100 XP                        │
│   🔥 7-day streak maintained!   │
│                                  │
│   [New Badge Earned: Week Warrior]│
│                                  │
│   [Practice Another]             │
│   [Back to Home]                │
└─────────────────────────────────┘
```

**Features:**

- Display affirmation text prominently
- Large input for typing
- Real-time validation (must match exactly)
- Progress bar updates with each completion
- Running timer
- XP counter updates live
- Celebration modal on completion

**Interactions:**

- Each correct typing increments counter
- Visual/haptic feedback on each completion
- Confetti animation on final completion
- Show new badges immediately

---

#### 4. Library Screen

**Layout:**

```
┌─────────────────────────────────┐
│ Your Affirmations               │
│ [Search box]                    │
├─────────────────────────────────┤
│ Recent (23)                      │
│                                  │
│ ┌─────────────────────────────┐│
│ │ ✓ I speak clearly and...    ││
│ │ Practiced: 12 times         ││
│ │ Last: Today                 ││
│ │ [Practice] [Edit] [Archive] ││
│ └─────────────────────────────┘│
│                                  │
│ ┌─────────────────────────────┐│
│ │ ✓ I handle challenges...    ││
│ │ Practiced: 8 times          ││
│ │ Last: Yesterday             ││
│ │ [Practice] [Edit] [Archive] ││
│ └─────────────────────────────┘│
│                                  │
│ [Load More]                     │
└─────────────────────────────────┘
```

**Features:**

- Search/filter affirmations
- Sort by: Recent, Most Practiced, Alphabetical
- Expandable cards showing full text
- Quick actions (Practice, Edit, Archive)
- Infinite scroll or pagination

---

#### 5. Leaderboard Screen

**Layout:**

```
┌─────────────────────────────────┐
│ Leaderboard 🏆                  │
│ [Weekly] [Monthly] [All-Time]  │
├─────────────────────────────────┤
│ 1  🥇 MindWarrior      847 reps │
│ 2  🥈 You             623 reps │
│ 3  🥉 ThinkPositive   601 reps │
│ 4     Anonymous User  445 reps │
│ 5     ZenMaster       398 reps │
│ ...                              │
│                                  │
│ ┌─────────────────────────────┐│
│ │ Your Rank: #2 of 1,247      ││
│ │ 224 reps to reach #1! 🎯   ││
│ └─────────────────────────────┘│
│                                  │
│ ☑ Show as "Anonymous User"     │
│ [ ] Show my username           │
└─────────────────────────────────┘
```

**Features:**

- Tab navigation (Weekly/Monthly/All-Time)
- Visual rank indicators (medals for top 3)
- Highlight current user
- Show gap to next rank
- Privacy toggle at bottom
- Real-time updates (Convex reactive query)

---

#### 6. Profile Screen

**Layout:**

```
┌─────────────────────────────────┐
│ Profile                          │
├─────────────────────────────────┤
│ [Avatar]                         │
│ Anonymous User                   │
│ [Edit Profile]                  │
├─────────────────────────────────┤
│ Stats                            │
│ 🔥 7 days     ⚡ 1,247 XP       │
│ 🎯 23 practices  📊 487 reps   │
│ 📅 Member since Nov 2024        │
├─────────────────────────────────┤
│ Badges (5/9)                     │
│ 🌱 🔥 💪 🏆 ⚡                 │
│ [View All Badges]               │
├─────────────────────────────────┤
│ Settings                         │
│ • Daily reminder              ✓ │
│ • Practice goal: 1 per day      │
│ • Privacy settings              │
│ • Account                       │
│ • Upgrade to Pro ⭐            │
└─────────────────────────────────┘
```

**Features:**

- Avatar/username display
- Key stats grid
- Badge showcase
- Settings list
- Upgrade CTA (if free tier)

---

### Component Specifications

#### PracticeInput Component

```typescript
// components/practice/practice-input.tsx
interface PracticeInputProps {
  affirmationText: string;
  targetReps: number;
  onComplete: (data: {
    repetitions: number;
    durationSeconds: number;
  }) => void;
}

export function PracticeInput({
  affirmationText,
  targetReps,
  onComplete
}: PracticeInputProps) {
  const [currentInput, setCurrentInput] = useState('');
  const [completedReps, setCompletedReps] = useState(0);
  const [startTime] = useState(Date.now());

  const handleInputChange = (value: string) => {
    setCurrentInput(value);

    // Check if matches affirmation
    if (value.trim().toLowerCase() === affirmationText.trim().toLowerCase()) {
      // Match! Increment counter
      setCompletedReps(prev => {
        const newCount = prev + 1;

        // Check if complete
        if (newCount >= targetReps) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          onComplete({
            repetitions: targetReps,
            durationSeconds: duration,
          });
        }

        return newCount;
      });

      // Clear input for next rep
      setCurrentInput('');

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 text-2xl font-semibold text-center">
        {affirmationText}
      </div>

      <Textarea
        value={currentInput}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Type the affirmation here..."
        className="text-lg min-h-[120px]"
        autoFocus
      />

      <Progress value={(completedReps / targetReps) * 100} className="mt-4" />

      <p className="text-center mt-2 text-gray-600">
        {completedReps} / {targetReps} completed
      </p>
    </div>
  );
}
```

#### TierCard Component

```typescript
// components/profile/tier-card.tsx
interface TierCardProps {
  level: number;
  totalXP: number;
  currentStreak: number;
}

export function TierCard({ level, totalXP, currentStreak }: TierCardProps) {
  const tier = getLevelTier(level);
  const { tierProgress, percentProgress } = calculateXPForNextLevel(totalXP, level);

  return (
    <Card
      className="p-6"
      style={{ backgroundColor: tier.color + '20' }} // Light tint
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-600 uppercase tracking-wide">
            Your Tier
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">{tier.icon}</span>
            <span
              className="text-2xl font-bold"
              style={{ color: tier.color }}
            >
              {tier.name.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Level</div>
          <div className="text-3xl font-bold">{level}</div>
        </div>
      </div>

      {/* Tier progress bar */}
      <div className="space-y-2">
        <Progress value={percentProgress} className="h-3" />
        <p className="text-sm text-gray-600 text-center">
          {tierProgress}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-sm text-gray-600">Streak</div>
            <div className="font-semibold">{currentStreak} days</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <div className="text-sm text-gray-600">Total XP</div>
            <div className="font-semibold">{totalXP.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

#### CelebrationModal Component

```typescript
// components/practice/celebration-modal.tsx
interface CelebrationModalProps {
  open: boolean;
  celebrationType: 'major' | 'standard' | 'silent' | 'tier-change';
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
  streakMaintained: boolean;
  currentStreak: number;
  newBadges?: string[];
  milestone?: {
    title: string;
    reward: string;
    xpBonus: number;
  };
  onClose: () => void;
}

export function CelebrationModal({
  open,
  celebrationType,
  xpEarned,
  leveledUp,
  newLevel,
  oldLevel,
  streakMaintained,
  currentStreak,
  newBadges,
  milestone,
  onClose
}: CelebrationModalProps) {
  // Don't show modal for silent celebrations
  if (celebrationType === 'silent') {
    return null;
  }

  // Standard toast for levels 1-20 and 41-50
  if (celebrationType === 'standard' && leveledUp) {
    return (
      <Toast open={open} onOpenChange={onClose}>
        <ToastTitle className="flex items-center gap-2">
          🎉 Level {newLevel}!
        </ToastTitle>
        <ToastDescription>
          +{xpEarned} XP earned
        </ToastDescription>
      </Toast>
    );
  }

  // Tier change = HUGE celebration
  if (celebrationType === 'tier-change' && newLevel) {
    const newTier = getLevelTier(newLevel);

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">{newTier.icon}</div>

            <DialogTitle className="text-3xl mb-2">
              TIER UP!
            </DialogTitle>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-lg mb-4"
              style={{ backgroundColor: newTier.color + '20' }}
            >
              <p className="text-sm text-gray-600 uppercase mb-2">
                You are now a
              </p>
              <p
                className="text-4xl font-bold mb-2"
                style={{ color: newTier.color }}
              >
                {newTier.name.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                {newTier.description}
              </p>
            </motion.div>

            {milestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-success-50 rounded-lg mb-4"
              >
                <p className="font-semibold mb-1">{milestone.title}</p>
                <p className="text-sm">{milestone.reward}</p>
                <p className="text-xs text-gray-600 mt-2">
                  +{milestone.xpBonus} Bonus XP
                </p>
              </motion.div>
            )}

            <Button onClick={onClose} className="w-full mt-4" size="lg">
              Continue Your Journey
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  // Major celebration (milestones - every 10 levels)
  if (celebrationType === 'major' && milestone) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎊</div>
            <DialogTitle className="text-3xl mb-4">
              {milestone.title}
            </DialogTitle>

            <div className="space-y-4">
              <div className="text-2xl font-bold text-primary-600">
                +{xpEarned} XP
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary-50 rounded-lg"
              >
                <p className="text-lg font-semibold mb-2">
                  Level {newLevel} Reached!
                </p>
                <p className="text-sm">{milestone.reward}</p>
              </motion.div>

              {streakMaintained && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-lg">{currentStreak}-day streak!</span>
                </div>
              )}

              {newBadges && newBadges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-success-50 rounded-lg"
                >
                  <p className="font-semibold mb-2">New Badge Earned!</p>
                  {newBadges.map(badge => (
                    <div key={badge} className="text-4xl">{badge}</div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Button onClick={onClose} className="w-full">
                Practice Another
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default practice complete celebration (no level up)
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <DialogTitle className="text-3xl mb-4">
            Practice Complete!
          </DialogTitle>

          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary-600">
              +{xpEarned} XP
            </div>

            {streakMaintained && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-lg">{currentStreak}-day streak!</span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <Button onClick={onClose} className="w-full">
              Practice Another
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Back to Home
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
```

#### LeaderboardRow Component

```typescript
// components/leaderboard/leaderboard-row.tsx
interface LeaderboardRowProps {
  rank: number;
  username: string;
  totalReps: number;
  level: number;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({
  rank,
  username,
  totalReps,
  level,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg",
        isCurrentUser && "bg-primary-50 border-2 border-primary-500"
      )}
    >
      <div className="w-8 text-center font-semibold">
        {getMedal(rank) || rank}
      </div>

      <div className="flex-1">
        <p className={cn(
          "font-medium",
          isCurrentUser && "text-primary-700"
        )}>
          {username}
        </p>
        <p className="text-sm text-gray-600">
          Level {level}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold">{totalReps}</p>
        <p className="text-sm text-gray-600">reps</p>
      </div>
    </div>
  );
}
```

---

## Feature Specifications

### Authentication Flow

**Sign Up:**

1. User clicks "Continue with Google" or "Sign up with Email"
2. Google OAuth or email verification
3. Create user record in Convex
4. Set default values (anonymousMode: true, tier: "free")
5. Navigate to onboarding (3 screens)
6. After onboarding → Dashboard

**Login:**

1. User clicks "Login"
2. Auth provider login
3. Check if user exists in Convex
4. Navigate to Dashboard

**Session Management:**

- Convex Auth handles session tokens
- Auto-refresh on app open
- Logout clears session

### Transformation Flow

**Step 1: Input**

- User types negative thought
- Min 10 characters, max 500
- Button disabled until valid

**Step 2: Generation**

- Call Convex action `generateAffirmations`
- Show loading state (spinner + text)
- Action calls Anthropic API
- Parse JSON response

**Step 3: Selection**

- Display radio options (3 for free, 5 for pro)
- Allow custom editing
- "Save & Practice" or "Save Only"

**Step 4: Save**

- Call Convex mutation `createAffirmation`
- Store original thought + selected affirmation + AI analysis
- Navigate to Practice screen (if "Save & Practice")

**Error Handling:**

- API fails → Show retry button
- Free tier limit → Show upgrade prompt
- Network error → Cache input, retry on reconnect

### Practice Flow

**Step 1: Start**

- User selects affirmation
- Navigate to Practice screen
- Display affirmation prominently
- Start timer

**Step 2: Type**

- User types affirmation in large input
- Compare input (case-insensitive, trim whitespace)
- On match:
  - Haptic feedback
  - Clear input
  - Increment counter
  - Update progress bar

**Step 3: Complete**

- After N reps (default 10)
- Calculate duration
- Call Convex mutation `completePractice`
- Mutation handles:
  - XP calculation
  - Streak checking
  - Badge eligibility
  - Leaderboard update

**Step 4: Celebrate**

- Show CelebrationModal
- Display XP earned
- Show level up (if applicable)
- Show streak status
- Show new badges
- Confetti animation

**Step 5: Next Action**

- "Practice Another" → Select new affirmation
- "Back to Home" → Navigate to Dashboard

### Gamification System

**XP Calculation:**

```typescript
let xpEarned = 10; // Base

// Streak bonus (if practicing on consecutive days)
if (streakContinued) {
  xpEarned += 20;
}

// Milestone bonuses
if (newStreak === 7) xpEarned += 50;
if (newStreak === 30) xpEarned += 100;
```

**Level Progression:**

- Check totalXP against LEVEL_THRESHOLDS
- Update user.level if threshold crossed
- Return leveledUp: true if changed

**Badge Awards:**

- After each practice, check eligibility
- Compare user stats to badge criteria
- Award badge if criteria met and not already earned
- Return list of newly earned badges

**Streak Tracking:**

```typescript
// On practice completion:
const today = new Date().toISOString().split("T")[0];
const lastPractice = user.lastPracticeDate;

if (!lastPractice) {
  // First practice
  newStreak = 1;
} else {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastPractice === yesterdayStr) {
    // Continuing streak
    newStreak = currentStreak + 1;
  } else if (lastPractice === today) {
    // Already practiced today
    newStreak = currentStreak;
  } else {
    // Broke streak
    newStreak = 1;
  }
}
```

### Leaderboard System

**Weekly Leaderboard:**

- Query all practices from last 7 days
- Group by userId, sum repetitions
- Sort descending by totalReps
- Join with users table for display names
- Respect anonymousMode setting
- Return top 100

**Real-time Updates:**

- Convex reactive query
- When any user completes practice, query re-runs
- UI updates automatically (no polling)

**Privacy:**

- Default: "Anonymous User"
- Opt-in: Show username (requires Pro)
- Can hide from leaderboards entirely

### Monetization Flow

**Free Tier Limits:**

- Check transformation count on create
- If >= 5 this month → Show upgrade modal
- Modal shows benefits of Pro
- "Upgrade Now" → Stripe Checkout

**Stripe Checkout:**

```typescript
// Client-side
const handleUpgrade = async () => {
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({
      priceId: "price_xxx", // Pro monthly
      successUrl: window.location.origin + "/profile?upgraded=true",
      cancelUrl: window.location.origin + "/profile",
    }),
  });

  const { url } = await response.json();
  window.location.href = url;
};
```

**Webhook Processing:**

- Stripe sends events to `/convex/http/stripe-webhook`
- Verify signature
- Handle events:
  - `checkout.session.completed` → Set tier to "pro"
  - `customer.subscription.updated` → Update status
  - `customer.subscription.deleted` → Revert to "free"

**Feature Gating:**

```typescript
// In UI
{user.tier === 'free' && (
  <Button onClick={handleUpgrade}>
    Upgrade to Pro ⭐
  </Button>
)}

// In backend
if (user.tier === "free" && affirmationsThisMonth >= 5) {
  throw new Error("Free tier limit reached");
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Day 1-2: Project Setup**

- [ ] Create Next.js 14 project with TypeScript
- [ ] Install Shadcn UI + Tailwind
- [ ] Set up Convex project
- [ ] Configure environment variables
- [ ] Set up file structure
- [ ] Initialize Git repo

**Day 3-4: Authentication**

- [ ] Configure Convex Auth (Google + Email)
- [ ] Build login/signup pages
- [ ] Test auth flow
- [ ] Create protected route wrapper
- [ ] Build basic dashboard shell

**Day 5-7: Core Data Flow**

- [ ] Define Convex schema
- [ ] Write basic queries (getAffirmations, getCurrentUser)
- [ ] Write basic mutations (createAffirmation)
- [ ] Set up Anthropic API integration
- [ ] Build transformation action
- [ ] Test end-to-end data flow

**Deliverable:** Auth works, can create affirmation, data persists

---

### Phase 2: Core Features (Week 2)

**Day 1-3: Transform Screen**

- [ ] Build input UI
- [ ] Implement loading states
- [ ] Build selection UI (radio options)
- [ ] Handle AI generation
- [ ] Free tier limit checking
- [ ] Error handling

**Day 4-5: Practice Screen**

- [ ] Build PracticeInput component
- [ ] Implement typing validation
- [ ] Progress bar updates
- [ ] Timer functionality
- [ ] Complete practice mutation
- [ ] Basic celebration (no animations yet)

**Day 6-7: Dashboard**

- [ ] Build stats cards
- [ ] Recent affirmations list
- [ ] Quick practice buttons
- [ ] Today's progress checklist
- [ ] Navigation between screens

**Deliverable:** Full flow works (create → practice → dashboard)

---

### Phase 3: Gamification (Week 3)

**Day 1-2: XP & Levels**

- [ ] Implement XP calculator
- [ ] Level progression logic
- [ ] XP display on dashboard
- [ ] Level up detection
- [ ] Progress bar to next level

**Day 3-4: Streaks**

- [ ] Streak tracking logic
- [ ] Streak counter component
- [ ] Streak bonus XP
- [ ] Streak broken detection
- [ ] Streak milestone bonuses

**Day 5-7: Badges**

- [ ] Define badge types
- [ ] Badge eligibility checker
- [ ] Badge award logic
- [ ] Badge display component
- [ ] Badge showcase on profile
- [ ] Badge unlock animations

**Deliverable:** Gamification system fully functional

---

### Phase 4: Social Features (Week 4)

**Day 1-3: Leaderboard**

- [ ] Write leaderboard queries (weekly/monthly/all-time)
- [ ] Build LeaderboardRow component
- [ ] Tab navigation
- [ ] Current user highlighting
- [ ] Real-time updates
- [ ] Privacy toggle

**Day 4-5: Library**

- [ ] Build Library screen
- [ ] Affirmation cards with actions
- [ ] Search/filter functionality
- [ ] Archive functionality
- [ ] Edit functionality

**Day 6-7: Profile**

- [ ] Build Profile screen
- [ ] Stats display
- [ ] Badge showcase
- [ ] Settings UI
- [ ] Username editing
- [ ] Privacy settings

**Deliverable:** All core screens complete

---

### Phase 5: Polish & Animations (Week 5)

**Day 1-2: Animations**

- [ ] Install Framer Motion
- [ ] CelebrationModal animations
- [ ] Confetti effect
- [ ] Level up animation
- [ ] Badge unlock animation
- [ ] Page transitions

**Day 3-4: Mobile Optimization**

- [ ] Responsive design audit
- [ ] Touch-friendly tap targets
- [ ] Mobile navigation
- [ ] Safe area handling (notch)
- [ ] Haptic feedback

**Day 5-7: PWA**

- [ ] Install next-pwa
- [ ] Create manifest.json
- [ ] Add app icons
- [ ] Implement service worker
- [ ] Test install prompt
- [ ] Test offline behavior

**Deliverable:** App feels polished and professional

---

### Phase 6: Monetization (Week 6)

**Day 1-3: Stripe Integration**

- [ ] Create Stripe account
- [ ] Set up products (Pro/Elite)
- [ ] Implement checkout flow
- [ ] Build webhook handler
- [ ] Test subscription lifecycle
- [ ] Build pricing page

**Day 4-5: Feature Gating**

- [ ] Implement free tier limits
- [ ] Upgrade prompts (contextual)
- [ ] Pro feature indicators
- [ ] Subscription status display
- [ ] Customer portal link

**Day 6-7: Testing**

- [ ] Test payment flow
- [ ] Test webhook events
- [ ] Test free tier limits
- [ ] Test upgrade/downgrade
- [ ] Test subscription cancellation

**Deliverable:** Monetization fully functional

---

### Phase 7: Analytics & Monitoring (Week 7)

**Day 1-2: PostHog Setup**

- [ ] Create PostHog account
- [ ] Install PostHog SDK
- [ ] Implement event tracking
- [ ] Set up custom events
- [ ] Test event capture

**Day 3-4: Error Tracking**

- [ ] Set up Sentry
- [ ] Configure error boundaries
- [ ] Test error capture
- [ ] Set up alerts

**Day 5-7: Email System**

- [ ] Set up Resend account
- [ ] Create email templates (React Email)
- [ ] Implement welcome email
- [ ] Implement reminder emails
- [ ] Test email delivery

**Deliverable:** Analytics and monitoring in place

---

### Phase 8: Launch Prep (Week 8)

**Day 1-3: Landing Page**

- [ ] Design landing page
- [ ] Build hero section
- [ ] Build features section
- [ ] Build pricing section
- [ ] Build FAQ section
- [ ] Add CTAs

**Day 4-5: Testing & Bug Fixes**

- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User acceptance testing

**Day 6-7: Launch**

- [ ] Deploy to production
- [ ] Set up custom domain
- [ ] Configure SSL
- [ ] Product Hunt preparation
- [ ] Social media posts
- [ ] v0 Ambassador post

**Deliverable:** Public launch! 🚀

---

## Testing Strategy

### Unit Testing

**Test Framework:** Jest + React Testing Library

**Components to Test:**

- PracticeInput (typing validation)
- XP calculator (level progression)
- Streak tracker (date logic)
- Badge checker (eligibility)

**Example Test:**

```typescript
// __tests__/xp-calculator.test.ts
import {
  calculateLevel,
  calculateXPForNextLevel,
} from "@/convex/lib/xp-calculator";

describe("XP Calculator", () => {
  it("returns level 1 for 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 for 100 XP", () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it("calculates XP needed for next level", () => {
    expect(calculateXPForNextLevel(50, 1)).toBe(50); // Need 50 more to reach 100
  });
});
```

### Integration Testing

**Convex Testing:**

- Use Convex test environment
- Test query/mutation interactions
- Test action + API calls

**E2E Critical Paths:**

1. Sign up → Create affirmation → Practice → See XP
2. Practice daily → Maintain streak → Earn badge
3. Upgrade to Pro → Create unlimited affirmations
4. View leaderboard → See rank update in real-time

### Manual Testing Checklist

**Before Launch:**

- [ ] Sign up with Google works
- [ ] Sign up with Email works
- [ ] Create affirmation (free tier)
- [ ] Practice affirmation (full flow)
- [ ] XP and level update correctly
- [ ] Streak tracking works
- [ ] Badge awards correctly
- [ ] Leaderboard shows data
- [ ] Profile displays stats
- [ ] Free tier limit enforced
- [ ] Upgrade flow works
- [ ] Stripe webhook processes
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] Push notifications work
- [ ] Email reminders sent

### Performance Testing

**Targets:**

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90

**Optimizations:**

- Image optimization (next/image)
- Code splitting (dynamic imports)
- Font optimization (next/font)
- Database query optimization (Convex indexes)

---

## Launch Checklist

### Pre-Launch (Week 8, Days 1-5)

**Technical:**

- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Analytics tracking verified
- [ ] Error monitoring configured
- [ ] Email templates tested
- [ ] Stripe webhooks tested

**Content:**

- [ ] Landing page copy finalized
- [ ] FAQ written
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] About page created

**Marketing:**

- [ ] Product Hunt post drafted
- [ ] Screenshots/GIFs prepared
- [ ] Demo video created
- [ ] Social media posts scheduled
- [ ] v0 Ambassador content ready
- [ ] Email list prepared (if any)

### Launch Day (Week 8, Day 6)

**Morning:**

- [ ] Deploy to production
- [ ] Verify everything works in prod
- [ ] Post on Product Hunt (6am PST optimal)
- [ ] Share on Twitter
- [ ] Share on LinkedIn
- [ ] Post in v0 Discord
- [ ] Email early access list (if any)

**Throughout Day:**

- [ ] Monitor Product Hunt comments
- [ ] Respond to feedback
- [ ] Monitor error logs
- [ ] Monitor analytics
- [ ] Share updates on social

**Evening:**

- [ ] Analyze first day metrics
- [ ] Plan tomorrow's follow-up

### Post-Launch (Week 8+)

**Week 1:**

- [ ] Daily check-ins on metrics
- [ ] Respond to all user feedback
- [ ] Fix any critical bugs
- [ ] Write retrospective blog post
- [ ] Share user testimonials (if any)

**Week 2-4:**

- [ ] Publish v0 Ambassador content (weekly)
- [ ] Iterate based on feedback
- [ ] Add small improvements
- [ ] Monitor retention metrics

**Month 2:**

- [ ] Evaluate success criteria
- [ ] Decide: double down or maintain
- [ ] Plan next features (if doubling down)

---

## Success Metrics

### 30-Day Targets

**Acquisition:**

- 100+ total signups
- 50+ activated users (completed 1 practice)

**Engagement:**

- 30-day retention: >40%
- Daily active users: 20-30%
- Avg practices per week per user: 3+

**Monetization:**

- 5+ paying customers ($25+ MRR)
- Free → Pro conversion: 10%+

**Technical:**

- Uptime: >99.5%
- P95 load time: <3s
- Error rate: <1%

### 90-Day Targets

**Acquisition:**

- 500+ total signups
- 250+ activated users

**Engagement:**

- 30-day retention: >50%
- Daily active users: 30-40%
- Avg practices per week per user: 4+

**Monetization:**

- 25+ paying customers ($125+ MRR)
- Free → Pro conversion: 10-15%

**Content:**

- 8 v0 Ambassador posts published
- 1,000+ views on content
- 50+ upvotes on Product Hunt

---

## Appendix

### Environment Variables

```bash
# .env.local

# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=dev:xxx

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend
RESEND_API_KEY=re_xxx

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "convex": "^1.16.0",
    "@clerk/nextjs": "^5.0.0",
    "@clerk/clerk-sdk-node": "^5.0.0",
    "ai": "^3.4.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.4.0",
    "framer-motion": "^11.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "posthog-js": "^1.96.0",
    "react-email": "^2.1.0",
    "resend": "^3.2.0",
    "@sentry/nextjs": "^7.100.0",
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

---

_End of PRD_

_Ready for implementation. Next steps:_

1. _Review and approve technical decisions_
2. _Set up project structure_
3. _Begin Phase 1 development_
