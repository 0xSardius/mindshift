import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  calculateLevel,
  calculatePracticeXP,
  getStreakMultiplier,
  getLevelTier,
  getTierName,
  getCelebrationType,
  checkMilestone,
} from "./lib/xpCalculator";
import { BADGE_TYPES, checkBadgeCriteria } from "./lib/badgeTypes";

// Helper to get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper to get yesterday's date
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

// Sync user from Clerk (create or update)
export const syncUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user with defaults
    const userId = await ctx.db.insert("users", {
      clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      username: undefined,
      anonymousMode: true,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: undefined,
      totalXP: 0,
      level: 1,
      dailyPracticeGoal: 1,
      reminderTime: "09:00",
      reminderEnabled: false,
      tier: "free",
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined,
      subscriptionStatus: undefined,
      subscriptionEndsAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Create a new affirmation
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
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check free tier limit (10 lifetime)
    if (user.tier === "free") {
      const existingAffirmations = await ctx.db
        .query("affirmations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      if (existingAffirmations.length >= 10) {
        throw new Error("Free tier limit reached. Upgrade to Pro for unlimited transformations.");
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
      lastPracticedAt: undefined,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });

    return affirmationId;
  },
});

// Complete a practice session
export const completePractice = mutation({
  args: {
    affirmationId: v.id("affirmations"),
    repetitions: v.number(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const affirmation = await ctx.db.get(args.affirmationId);
    if (!affirmation || affirmation.userId !== user._id) {
      throw new Error("Affirmation not found");
    }

    const now = Date.now();
    const today = getToday();
    const yesterday = getYesterday();

    // Check if this is the first practice today
    const startOfDay = new Date(today).getTime();
    const practicesToday = await ctx.db
      .query("practices")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("practicedAt", startOfDay)
      )
      .collect();
    const isFirstToday = practicesToday.length === 0;

    // Check if this is the first time practicing this affirmation
    const isNewAffirmation = affirmation.timesPracticed === 0;

    // Check if it's a morning practice (before 10am)
    const currentHour = new Date().getHours();
    const isMorningPractice = currentHour < 10;

    // Calculate streak
    let newStreak = user.currentStreak;
    let usedStreakShield = false;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    if (user.lastPracticeDate === today) {
      // Already practiced today, streak stays the same
      newStreak = user.currentStreak;
    } else if (user.lastPracticeDate === yesterday) {
      // Practiced yesterday, increment streak
      newStreak = user.currentStreak + 1;
    } else if (user.lastPracticeDate === null || user.lastPracticeDate === undefined) {
      // First ever practice
      newStreak = 1;
    } else {
      // Streak would be broken - check for Streak Shield (Pro feature)
      const isPro = user.tier === "pro" || user.tier === "elite";
      const shieldAvailable = !user.lastStreakShieldUsed ||
        (now - user.lastStreakShieldUsed) >= SEVEN_DAYS_MS;

      if (isPro && shieldAvailable && user.currentStreak > 0) {
        // Use Streak Shield - maintain streak instead of resetting
        newStreak = user.currentStreak + 1;
        usedStreakShield = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Calculate XP
    const xpEarned = calculatePracticeXP({
      repetitions: args.repetitions,
      streak: newStreak,
      isFirstToday,
      isNewAffirmation,
      isMorningPractice,
    });

    const oldLevel = user.level;
    const newTotalXP = user.totalXP + xpEarned;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Update user
    const longestStreak = Math.max(user.longestStreak, newStreak);
    const userUpdate: Record<string, unknown> = {
      totalXP: newTotalXP,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak,
      lastPracticeDate: today,
      updatedAt: now,
    };

    // Record streak shield usage if it was used
    if (usedStreakShield) {
      userUpdate.lastStreakShieldUsed = now;
    }

    await ctx.db.patch(user._id, userUpdate);

    // Create practice record
    await ctx.db.insert("practices", {
      userId: user._id,
      affirmationId: args.affirmationId,
      repetitions: args.repetitions,
      xpEarned,
      durationSeconds: args.durationSeconds,
      practicedAt: now,
    });

    // Update affirmation stats
    await ctx.db.patch(args.affirmationId, {
      timesPracticed: affirmation.timesPracticed + 1,
      totalRepetitions: affirmation.totalRepetitions + args.repetitions,
      lastPracticedAt: now,
      updatedAt: now,
    });

    // Check for new badges
    const allPractices = await ctx.db
      .query("practices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allAffirmations = await ctx.db
      .query("affirmations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalReps = allPractices.reduce((sum, p) => sum + p.repetitions, 0) + args.repetitions;

    const stats = {
      practices: allPractices.length + 1,
      streak: newStreak,
      totalReps,
      affirmations: allAffirmations.length,
      level: newLevel,
    };

    // Check each badge
    const newBadges: string[] = [];
    for (const [key, badge] of Object.entries(BADGE_TYPES)) {
      // Check if user already has this badge
      const existingBadge = await ctx.db
        .query("badges")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("badgeType", badge.id)
        )
        .unique();

      if (!existingBadge && checkBadgeCriteria(badge, stats)) {
        // Award the badge
        await ctx.db.insert("badges", {
          userId: user._id,
          badgeType: badge.id,
          earnedAt: now,
        });
        newBadges.push(badge.id);
      }
    }

    // Determine celebration type
    const celebrationType = getCelebrationType(newLevel, oldLevel);
    const milestone = checkMilestone(newLevel);
    const oldTier = getTierName(oldLevel);
    const newTier = getTierName(newLevel);
    const tierChanged = oldTier !== newTier;

    return {
      xpEarned,
      totalXP: newTotalXP,
      oldLevel,
      newLevel,
      leveledUp,
      currentStreak: newStreak,
      longestStreak,
      streakMaintained: true,
      usedStreakShield,
      newBadges,
      celebrationType,
      tierChanged,
      oldTier,
      newTier,
      milestone: milestone.isMilestone ? milestone : null,
    };
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    dailyPracticeGoal: v.optional(v.number()),
    reminderEnabled: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()),
    anonymousMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };

    if (args.dailyPracticeGoal !== undefined) {
      updates.dailyPracticeGoal = args.dailyPracticeGoal;
    }
    if (args.reminderEnabled !== undefined) {
      updates.reminderEnabled = args.reminderEnabled;
    }
    if (args.reminderTime !== undefined) {
      updates.reminderTime = args.reminderTime;
    }
    if (args.anonymousMode !== undefined) {
      updates.anonymousMode = args.anonymousMode;
    }

    await ctx.db.patch(user._id, updates);
    return { success: true };
  },
});

// Update user profile (username)
export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Only Pro users can set custom username
    if (args.username && user.tier === "free") {
      throw new Error("Custom username requires Pro subscription");
    }

    // Check if username is taken
    if (args.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();

      if (existingUser && existingUser._id !== user._id) {
        throw new Error("Username is already taken");
      }
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Archive an affirmation
export const archiveAffirmation = mutation({
  args: {
    affirmationId: v.id("affirmations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const affirmation = await ctx.db.get(args.affirmationId);
    if (!affirmation || affirmation.userId !== user._id) {
      throw new Error("Affirmation not found");
    }

    await ctx.db.patch(args.affirmationId, {
      archived: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Restore an archived affirmation
export const restoreAffirmation = mutation({
  args: {
    affirmationId: v.id("affirmations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const affirmation = await ctx.db.get(args.affirmationId);
    if (!affirmation || affirmation.userId !== user._id) {
      throw new Error("Affirmation not found");
    }

    await ctx.db.patch(args.affirmationId, {
      archived: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update affirmation text
export const updateAffirmation = mutation({
  args: {
    affirmationId: v.id("affirmations"),
    affirmationText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const affirmation = await ctx.db.get(args.affirmationId);
    if (!affirmation || affirmation.userId !== user._id) {
      throw new Error("Affirmation not found");
    }

    await ctx.db.patch(args.affirmationId, {
      affirmationText: args.affirmationText,
      userEdited: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete affirmation permanently
export const deleteAffirmation = mutation({
  args: {
    affirmationId: v.id("affirmations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const affirmation = await ctx.db.get(args.affirmationId);
    if (!affirmation || affirmation.userId !== user._id) {
      throw new Error("Affirmation not found");
    }

    // Delete associated practices first
    const practices = await ctx.db
      .query("practices")
      .withIndex("by_affirmation", (q) => q.eq("affirmationId", args.affirmationId))
      .collect();

    for (const practice of practices) {
      await ctx.db.delete(practice._id);
    }

    // Delete the affirmation
    await ctx.db.delete(args.affirmationId);

    return { success: true };
  },
});

// Manually award a badge (for admin or special events)
export const awardBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if badge already exists
    const existingBadge = await ctx.db
      .query("badges")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("badgeType", args.badgeType)
      )
      .unique();

    if (existingBadge) {
      return { success: false, message: "Badge already awarded" };
    }

    await ctx.db.insert("badges", {
      userId: args.userId,
      badgeType: args.badgeType,
      earnedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update subscription tier (called from Stripe webhook)
export const updateSubscription = mutation({
  args: {
    clerkId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionEndsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      tier: args.tier,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: args.subscriptionStatus,
      subscriptionEndsAt: args.subscriptionEndsAt,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
