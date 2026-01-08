export interface BadgeCriteria {
  practices?: number;
  streak?: number;
  totalReps?: number;
  affirmations?: number;
  level?: number;
  earlyPractices?: number;
  latePractices?: number;
  uniqueAffirmations?: number;
}

export interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export const BADGE_TYPES: Record<string, BadgeType> = {
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

  // Tier progression badges
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

  // Consistency badges
  TEN_PRACTICES: {
    id: "ten_practices",
    name: "Getting Started",
    description: "Complete 10 practice sessions",
    icon: "🎯",
    criteria: { practices: 10 },
  },
  FIFTY_PRACTICES: {
    id: "fifty_practices",
    name: "Dedicated",
    description: "Complete 50 practice sessions",
    icon: "🎪",
    criteria: { practices: 50 },
  },
  HUNDRED_PRACTICES: {
    id: "hundred_practices",
    name: "Committed",
    description: "Complete 100 practice sessions",
    icon: "🏅",
    criteria: { practices: 100 },
  },

  // Affirmation creation badges
  FIRST_AFFIRMATION: {
    id: "first_affirmation",
    name: "Thought Shifter",
    description: "Create your first affirmation",
    icon: "💭",
    criteria: { affirmations: 1 },
  },
  TEN_AFFIRMATIONS: {
    id: "ten_affirmations",
    name: "Mind Builder",
    description: "Create 10 affirmations",
    icon: "🧠",
    criteria: { affirmations: 10 },
  },
  TWENTY_FIVE_AFFIRMATIONS: {
    id: "twenty_five_affirmations",
    name: "Pattern Breaker",
    description: "Create 25 affirmations",
    icon: "⚡",
    criteria: { affirmations: 25 },
  },
} as const;

// Get badge info by ID
export function getBadgeById(badgeId: string): BadgeType | undefined {
  return Object.values(BADGE_TYPES).find((badge) => badge.id === badgeId);
}

// Get all badge IDs
export function getAllBadgeIds(): string[] {
  return Object.values(BADGE_TYPES).map((badge) => badge.id);
}

// Check if user meets criteria for a badge
export function checkBadgeCriteria(
  badge: BadgeType,
  stats: {
    practices: number;
    streak: number;
    totalReps: number;
    affirmations: number;
    level: number;
    earlyPractices?: number;
    latePractices?: number;
    uniqueAffirmations?: number;
  }
): boolean {
  const { criteria } = badge;

  if (criteria.practices !== undefined && stats.practices < criteria.practices) {
    return false;
  }
  if (criteria.streak !== undefined && stats.streak < criteria.streak) {
    return false;
  }
  if (criteria.totalReps !== undefined && stats.totalReps < criteria.totalReps) {
    return false;
  }
  if (criteria.affirmations !== undefined && stats.affirmations < criteria.affirmations) {
    return false;
  }
  if (criteria.level !== undefined && stats.level < criteria.level) {
    return false;
  }
  if (criteria.earlyPractices !== undefined) {
    if (!stats.earlyPractices || stats.earlyPractices < criteria.earlyPractices) {
      return false;
    }
  }
  if (criteria.latePractices !== undefined) {
    if (!stats.latePractices || stats.latePractices < criteria.latePractices) {
      return false;
    }
  }
  if (criteria.uniqueAffirmations !== undefined) {
    if (!stats.uniqueAffirmations || stats.uniqueAffirmations < criteria.uniqueAffirmations) {
      return false;
    }
  }

  return true;
}
