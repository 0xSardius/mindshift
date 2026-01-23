import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get current user from Clerk identity
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by Clerk ID (for API routes without auth context)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Get all affirmations for current user
export const getAffirmations = query({
  args: {
    archived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    let affirmationsQuery = ctx.db
      .query("affirmations")
      .withIndex("by_user_archived", (q) => {
        if (args.archived !== undefined) {
          return q.eq("userId", user._id).eq("archived", args.archived);
        }
        return q.eq("userId", user._id);
      })
      .order("desc");

    const affirmations = await affirmationsQuery.collect();

    // Apply limit if specified
    if (args.limit && args.limit > 0) {
      return affirmations.slice(0, args.limit);
    }

    return affirmations;
  },
});

// Get single affirmation by ID
export const getAffirmation = query({
  args: { affirmationId: v.id("affirmations") },
  handler: async (ctx, args) => {
    const affirmation = await ctx.db.get(args.affirmationId);

    if (!affirmation) {
      return null;
    }

    // Verify ownership
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || affirmation.userId !== user._id) {
      return null;
    }

    return affirmation;
  },
});

// Get user stats (aggregated data)
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get all practices for this user
    const practices = await ctx.db
      .query("practices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get all affirmations for this user
    const affirmations = await ctx.db
      .query("affirmations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate stats
    const totalPractices = practices.length;
    const totalRepetitions = practices.reduce((sum, p) => sum + p.repetitions, 0);
    const totalAffirmations = affirmations.filter((a) => !a.archived).length;
    const archivedAffirmations = affirmations.filter((a) => a.archived).length;

    // Calculate practices today
    const today = new Date().toISOString().split("T")[0];
    const practicesToday = practices.filter((p) => {
      const practiceDate = new Date(p.practicedAt).toISOString().split("T")[0];
      return practiceDate === today;
    }).length;

    return {
      totalPractices,
      totalRepetitions,
      totalAffirmations,
      archivedAffirmations,
      practicesToday,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalXP: user.totalXP,
      level: user.level,
    };
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: {
    timeframe: v.optional(v.union(v.literal("weekly"), v.literal("monthly"), v.literal("allTime"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get all users sorted by XP
    const users = await ctx.db
      .query("users")
      .withIndex("by_total_xp")
      .order("desc")
      .take(limit);

    // Get current user for comparison
    const identity = await ctx.auth.getUserIdentity();
    let currentUserId: Id<"users"> | null = null;

    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      currentUserId = currentUser?._id || null;
    }

    // Map to leaderboard entries
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.anonymousMode ? `Player${user._id.slice(-4)}` : (user.username || user.name || "Anonymous"),
      totalXP: user.totalXP,
      level: user.level,
      currentStreak: user.currentStreak,
      isCurrentUser: user._id === currentUserId,
      imageUrl: user.anonymousMode ? null : user.imageUrl,
    }));

    return leaderboard;
  },
});

// Get current user's rank info
export const getUserRankInfo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      return null;
    }

    // Count users with more XP
    const allUsers = await ctx.db.query("users").collect();
    const sortedUsers = allUsers.sort((a, b) => b.totalXP - a.totalXP);

    const rank = sortedUsers.findIndex((u) => u._id === currentUser._id) + 1;
    const totalUsers = sortedUsers.length;

    // Find next user ahead
    let xpToNextRank = 0;
    let nextRankUsername = "";
    if (rank > 1) {
      const nextUser = sortedUsers[rank - 2];
      xpToNextRank = nextUser.totalXP - currentUser.totalXP;
      nextRankUsername = nextUser.anonymousMode
        ? `Player${nextUser._id.slice(-4)}`
        : (nextUser.username || nextUser.name || "Anonymous");
    }

    return {
      rank,
      totalUsers,
      xpToNextRank,
      nextRankUsername,
      percentile: Math.round((1 - rank / totalUsers) * 100),
    };
  },
});

// Get badges for current user
export const getBadges = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const badges = await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return badges;
  },
});

// Check if user has specific badge
export const hasBadge = query({
  args: { badgeType: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    const badge = await ctx.db
      .query("badges")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("badgeType", args.badgeType)
      )
      .unique();

    return badge !== null;
  },
});

// Get practice history for heatmap (last 365 days)
export const getPracticeHistory = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const daysToFetch = args.days || 365;
    const startDate = Date.now() - daysToFetch * 24 * 60 * 60 * 1000;

    const practices = await ctx.db
      .query("practices")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("practicedAt", startDate)
      )
      .collect();

    // Group by date
    const practicesByDate: Record<string, number> = {};

    for (const practice of practices) {
      const date = new Date(practice.practicedAt).toISOString().split("T")[0];
      practicesByDate[date] = (practicesByDate[date] || 0) + 1;
    }

    // Convert to array format
    return Object.entries(practicesByDate).map(([date, count]) => ({
      date,
      count,
    }));
  },
});

// Get today's progress
export const getTodayProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(today).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    // Get practices today
    const practicesToday = await ctx.db
      .query("practices")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", user._id).gte("practicedAt", startOfDay).lt("practicedAt", endOfDay)
      )
      .collect();

    const practiceCount = practicesToday.length;
    const practiceGoalMet = practiceCount >= user.dailyPracticeGoal;

    // Check if streak is maintained (practiced today or yesterday)
    const streakMaintained = user.lastPracticeDate === today || practiceCount > 0;

    return {
      practiceCount,
      dailyGoal: user.dailyPracticeGoal,
      practiceGoalMet,
      streakMaintained,
      currentStreak: user.currentStreak,
      xpEarnedToday: practicesToday.reduce((sum, p) => sum + p.xpEarned, 0),
    };
  },
});

// Get user's transformation count (for free tier limit)
export const getTransformationCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { count: 0, limit: 10, remaining: 10 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { count: 0, limit: 10, remaining: 10 };
    }

    // Pro users have unlimited
    if (user.tier === "pro" || user.tier === "elite") {
      return { count: -1, limit: -1, remaining: -1, unlimited: true };
    }

    // Count all affirmations (lifetime for free tier)
    const affirmations = await ctx.db
      .query("affirmations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const count = affirmations.length;
    const limit = 10;
    const remaining = Math.max(0, limit - count);

    return { count, limit, remaining, unlimited: false };
  },
});

// Get user's cognitive patterns (for AI Pattern Learning - Pro feature)
export const getUserPatterns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get all affirmations for this user
    const affirmations = await ctx.db
      .query("affirmations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalTransformations = affirmations.length;

    if (totalTransformations === 0) {
      return {
        topDistortions: [],
        topThemes: [],
        totalTransformations: 0,
        isPro: user.tier === "pro" || user.tier === "elite",
      };
    }

    // Aggregate cognitive distortions
    const distortionCounts: Record<string, number> = {};
    let totalDistortions = 0;

    for (const affirmation of affirmations) {
      if (affirmation.cognitiveDistortions) {
        for (const distortion of affirmation.cognitiveDistortions) {
          distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
          totalDistortions++;
        }
      }
    }

    // Aggregate themes
    const themeCounts: Record<string, number> = {};
    let totalThemes = 0;

    for (const affirmation of affirmations) {
      if (affirmation.themeCategory) {
        themeCounts[affirmation.themeCategory] = (themeCounts[affirmation.themeCategory] || 0) + 1;
        totalThemes++;
      }
    }

    // Sort and format distortions
    const topDistortions = Object.entries(distortionCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalDistortions > 0 ? Math.round((count / totalDistortions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort and format themes
    const topThemes = Object.entries(themeCounts)
      .map(([theme, count]) => ({
        theme,
        count,
        percentage: totalThemes > 0 ? Math.round((count / totalThemes) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topDistortions,
      topThemes,
      totalTransformations,
      isPro: user.tier === "pro" || user.tier === "elite",
    };
  },
});

// Get user patterns by Clerk ID (for API routes without auth context)
export const getUserPatternsByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    const isPro = user.tier === "pro" || user.tier === "elite";

    // Only return patterns for Pro users
    if (!isPro) {
      return {
        isPro: false,
        topDistortions: [],
        topThemes: [],
        totalTransformations: 0,
      };
    }

    // Get all affirmations for this user
    const affirmations = await ctx.db
      .query("affirmations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalTransformations = affirmations.length;

    if (totalTransformations < 3) {
      // Need at least 3 transformations to show meaningful patterns
      return {
        isPro: true,
        topDistortions: [],
        topThemes: [],
        totalTransformations,
      };
    }

    // Aggregate cognitive distortions
    const distortionCounts: Record<string, number> = {};
    for (const affirmation of affirmations) {
      if (affirmation.cognitiveDistortions) {
        for (const distortion of affirmation.cognitiveDistortions) {
          distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
        }
      }
    }

    // Aggregate themes
    const themeCounts: Record<string, number> = {};
    for (const affirmation of affirmations) {
      if (affirmation.themeCategory) {
        themeCounts[affirmation.themeCategory] = (themeCounts[affirmation.themeCategory] || 0) + 1;
      }
    }

    // Get top 3 distortions and themes for context injection
    const topDistortions = Object.entries(distortionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);

    return {
      isPro: true,
      topDistortions,
      topThemes,
      totalTransformations,
    };
  },
});
