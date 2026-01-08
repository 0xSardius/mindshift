import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Clerk Auth
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Profile
    username: v.optional(v.string()),
    anonymousMode: v.boolean(),

    // Gamification
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastPracticeDate: v.optional(v.string()), // YYYY-MM-DD format
    totalXP: v.number(),
    level: v.number(),

    // Settings
    dailyPracticeGoal: v.number(),
    reminderTime: v.optional(v.string()), // "HH:MM" format
    reminderEnabled: v.boolean(),

    // Subscription
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionEndsAt: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_total_xp", ["totalXP"]),

  affirmations: defineTable({
    userId: v.id("users"),

    // User input
    originalThought: v.string(),

    // AI analysis
    detectedLevel: v.optional(v.number()), // 1-5 Self-Talk Level
    cognitiveDistortions: v.optional(v.array(v.string())),
    themeCategory: v.optional(v.string()),

    // Selected affirmation
    affirmationText: v.string(),
    chosenLevel: v.optional(v.number()), // 3, 4, or 5
    userEdited: v.boolean(),

    // Practice stats
    timesPracticed: v.number(),
    totalRepetitions: v.number(),
    lastPracticedAt: v.optional(v.number()),

    // Status
    archived: v.boolean(),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "archived"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_theme", ["themeCategory"]),

  practices: defineTable({
    userId: v.id("users"),
    affirmationId: v.id("affirmations"),

    // Practice details
    repetitions: v.number(),
    xpEarned: v.number(),
    durationSeconds: v.number(),

    // Metadata
    practicedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "practicedAt"])
    .index("by_affirmation", ["affirmationId"]),

  badges: defineTable({
    userId: v.id("users"),
    badgeType: v.string(),
    earnedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "badgeType"]),

  // For future notification features
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
