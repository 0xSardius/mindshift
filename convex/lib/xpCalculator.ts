// Base XP values
export const XP_PER_REP = 1.5; // Proportional XP per repetition
export const XP_FIRST_TODAY = 10;
export const XP_FULL_SESSION_10 = 5; // Bonus for completing 10 reps
export const XP_FULL_SESSION_20 = 15; // Extra bonus for 20 reps
export const XP_NEW_AFFIRMATION = 25;
export const XP_MORNING_PRACTICE = 10; // Before 10am
export const XP_CONSISTENCY_BONUS = 20; // 5 days this week

// Streak multipliers
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 2) return 1.2;
  return 1.0;
}

// 50-Level thresholds
export const LEVEL_THRESHOLDS = [
  // NOVICE (Levels 1-10)
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 25 },
  { level: 3, xpRequired: 55 },
  { level: 4, xpRequired: 90 },
  { level: 5, xpRequired: 130 },
  { level: 6, xpRequired: 175 },
  { level: 7, xpRequired: 225 },
  { level: 8, xpRequired: 280 },
  { level: 9, xpRequired: 340 },
  { level: 10, xpRequired: 405 },

  // APPRENTICE (Levels 11-20)
  { level: 11, xpRequired: 475 },
  { level: 12, xpRequired: 550 },
  { level: 13, xpRequired: 630 },
  { level: 14, xpRequired: 715 },
  { level: 15, xpRequired: 805 },
  { level: 16, xpRequired: 900 },
  { level: 17, xpRequired: 1000 },
  { level: 18, xpRequired: 1105 },
  { level: 19, xpRequired: 1215 },
  { level: 20, xpRequired: 1330 },

  // PRACTITIONER (Levels 21-30)
  { level: 21, xpRequired: 1450 },
  { level: 22, xpRequired: 1575 },
  { level: 23, xpRequired: 1705 },
  { level: 24, xpRequired: 1840 },
  { level: 25, xpRequired: 1980 },
  { level: 26, xpRequired: 2125 },
  { level: 27, xpRequired: 2275 },
  { level: 28, xpRequired: 2430 },
  { level: 29, xpRequired: 2590 },
  { level: 30, xpRequired: 2755 },

  // EXPERT (Levels 31-40)
  { level: 31, xpRequired: 2925 },
  { level: 32, xpRequired: 3100 },
  { level: 33, xpRequired: 3280 },
  { level: 34, xpRequired: 3465 },
  { level: 35, xpRequired: 3655 },
  { level: 36, xpRequired: 3850 },
  { level: 37, xpRequired: 4050 },
  { level: 38, xpRequired: 4255 },
  { level: 39, xpRequired: 4465 },
  { level: 40, xpRequired: 4680 },

  // MASTER (Levels 41-50)
  { level: 41, xpRequired: 4900 },
  { level: 42, xpRequired: 5125 },
  { level: 43, xpRequired: 5355 },
  { level: 44, xpRequired: 5590 },
  { level: 45, xpRequired: 5830 },
  { level: 46, xpRequired: 6075 },
  { level: 47, xpRequired: 6325 },
  { level: 48, xpRequired: 6580 },
  { level: 49, xpRequired: 6840 },
  { level: 50, xpRequired: 7105 },
] as const;

// Tier definitions
export const LEVEL_TIERS = {
  NOVICE: {
    name: "Novice",
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    color: "gray",
    icon: "🌱",
    description: "Beginning your mindshift journey",
  },
  APPRENTICE: {
    name: "Apprentice",
    levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    color: "blue",
    icon: "📘",
    description: "Learning the foundations",
  },
  PRACTITIONER: {
    name: "Practitioner",
    levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    color: "purple",
    icon: "🔮",
    description: "Building strong habits",
  },
  EXPERT: {
    name: "Expert",
    levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    color: "gold",
    icon: "⚡",
    description: "Mastering your mindset",
  },
  MASTER: {
    name: "Master",
    levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    color: "red",
    icon: "👑",
    description: "Transcendent self-talk",
  },
} as const;

export type TierName = keyof typeof LEVEL_TIERS;

// Calculate XP required for any level (supports levels beyond 50)
export function getXPRequiredForLevel(level: number): number {
  if (level <= 50) {
    return LEVEL_THRESHOLDS[level - 1].xpRequired;
  }

  // For levels beyond 50, continue the curve
  // Pattern: increment increases by 5 each level (265 at L50, 270 at L51, etc.)
  let xp = LEVEL_THRESHOLDS[49].xpRequired; // Level 50's XP (7105)
  for (let l = 51; l <= level; l++) {
    const increment = 220 + (l * 5); // Continues the pattern
    xp += increment;
  }
  return xp;
}

// Calculate level from total XP (uncapped)
export function calculateLevel(totalXP: number): number {
  // Check predefined thresholds first (levels 1-50)
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xpRequired) {
      if (i === LEVEL_THRESHOLDS.length - 1) {
        // At or beyond level 50, calculate dynamically
        let level = 50;
        let xpForNextLevel = getXPRequiredForLevel(level + 1);
        while (totalXP >= xpForNextLevel) {
          level++;
          xpForNextLevel = getXPRequiredForLevel(level + 1);
        }
        return level;
      }
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

// Get tier from level
export function getLevelTier(level: number): (typeof LEVEL_TIERS)[TierName] {
  if (level <= 10) return LEVEL_TIERS.NOVICE;
  if (level <= 20) return LEVEL_TIERS.APPRENTICE;
  if (level <= 30) return LEVEL_TIERS.PRACTITIONER;
  if (level <= 40) return LEVEL_TIERS.EXPERT;
  return LEVEL_TIERS.MASTER;
}

// Get tier name from level
export function getTierName(level: number): TierName {
  if (level <= 10) return "NOVICE";
  if (level <= 20) return "APPRENTICE";
  if (level <= 30) return "PRACTITIONER";
  if (level <= 40) return "EXPERT";
  return "MASTER";
}

// Calculate XP needed for next level (supports uncapped levels)
export function calculateXPForNextLevel(
  currentXP: number,
  currentLevel: number
): { xpToNext: number; xpProgress: number; xpRequired: number } {
  const currentThreshold = getXPRequiredForLevel(currentLevel);
  const nextThreshold = getXPRequiredForLevel(currentLevel + 1);
  const xpRequired = nextThreshold - currentThreshold;
  const xpProgress = currentXP - currentThreshold;
  const xpToNext = nextThreshold - currentXP;

  return { xpToNext, xpProgress, xpRequired };
}

// Calculate XP earned for a practice session (proportional to reps)
export function calculatePracticeXP(params: {
  repetitions: number;
  streak: number;
  isFirstToday: boolean;
  isNewAffirmation: boolean;
  isMorningPractice: boolean;
}): number {
  const { repetitions, streak, isFirstToday, isNewAffirmation, isMorningPractice } = params;

  // Base XP is proportional to reps (1.5 XP per rep)
  let baseXP = repetitions * XP_PER_REP;

  // Bonus for first practice today
  if (isFirstToday) {
    baseXP += XP_FIRST_TODAY;
  }

  // Bonus for completing full session (10 reps)
  if (repetitions >= 10) {
    baseXP += XP_FULL_SESSION_10;
  }

  // Extra bonus for 20 reps
  if (repetitions >= 20) {
    baseXP += XP_FULL_SESSION_20;
  }

  // Bonus for new affirmation
  if (isNewAffirmation) {
    baseXP += XP_NEW_AFFIRMATION;
  }

  // Bonus for morning practice
  if (isMorningPractice) {
    baseXP += XP_MORNING_PRACTICE;
  }

  // Apply streak multiplier
  const multiplier = getStreakMultiplier(streak);
  const totalXP = Math.round(baseXP * multiplier);

  return totalXP;
}

// Determine celebration type based on level changes
export type CelebrationType = "silent" | "standard" | "major" | "tier-change";

export function getCelebrationType(newLevel: number, oldLevel: number): CelebrationType {
  if (newLevel === oldLevel) {
    return "silent";
  }

  // Tier change (levels 10, 20, 30, 40, 50)
  const tierLevels = [10, 20, 30, 40, 50];
  if (tierLevels.includes(newLevel)) {
    return "tier-change";
  }

  // Major milestone (every 5 levels)
  if (newLevel % 5 === 0) {
    return "major";
  }

  return "standard";
}

// Check for milestone
export function checkMilestone(level: number): {
  isMilestone: boolean;
  title?: string;
  reward?: string;
} {
  const milestones: Record<number, { title: string; reward: string }> = {
    10: { title: "Novice Complete!", reward: "Unlocked Apprentice tier" },
    20: { title: "Apprentice Complete!", reward: "Unlocked Practitioner tier" },
    30: { title: "Practitioner Complete!", reward: "Unlocked Expert tier" },
    40: { title: "Expert Complete!", reward: "Unlocked Master tier" },
    50: { title: "Master Achieved!", reward: "Maximum level reached" },
  };

  if (milestones[level]) {
    return { isMilestone: true, ...milestones[level] };
  }

  return { isMilestone: false };
}
