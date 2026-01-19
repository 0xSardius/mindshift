export type Tier = "NOVICE" | "APPRENTICE" | "PRACTITIONER" | "EXPERT" | "MASTER"

export interface User {
  id: string
  name: string
  level: number
  tier: Tier
  currentStreak: number
  totalXP: number
  currentXP: number
  xpToNextLevel: number
  badges?: Badge[]
  settings?: UserSettings
}

export interface Affirmation {
  id: string
  text: string
  timesPracticed: number
  lastPracticedAt: Date | null
  archived: boolean
  createdAt: Date
}

export interface TodayProgress {
  practiceGoalMet: boolean
  streakMaintained: boolean
  practiceCount: number
  dailyGoal: number
}

export interface AffirmationAnalysis {
  cognitiveDistortion: string
  reframingApproach: string
  detectedLevel?: number
  theme?: string
  targetLevel?: number
}

export interface GeneratedAffirmation {
  id: string
  text: string
  analysis: AffirmationAnalysis
}

export interface GenerateAffirmationsResponse {
  analysis: AffirmationAnalysis
  affirmations: GeneratedAffirmation[]
}

export interface PracticeSession {
  affirmationId: string
  affirmationText: string
  completedReps: number
  totalReps: number
  xpEarned: number
  startTime: Date
  elapsedSeconds: number
}

export interface PracticeResult {
  totalXP: number
  streakMaintained: boolean
  currentStreak: number
  badgesEarned?: string[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  totalReps: number
  level: number
  tier: Tier
  isCurrentUser?: boolean
}

export interface UserRankInfo {
  rank: number
  totalUsers: number
  repsToNextRank: number
  nextRankUsername: string
  anonymousMode: boolean
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  earnedAt: Date | null
  requirement: string
}

export interface UserSettings {
  reminderEnabled: boolean
  reminderTime: string
  dailyPracticeGoal: number
}

export interface UserStats {
  totalPractices: number
  totalReps: number
}

export type CelebrationType = "standard" | "levelUp" | "tierChange" | "milestone"

export interface XPBreakdown {
  base: number
  firstToday: number
  fullSession: number
  newAffirmation: number
  morningBonus: number
  streakMultiplier: number
}

export interface CelebrationData {
  type: CelebrationType
  xpEarned: number
  xpBreakdown?: XPBreakdown
  newLevel?: number
  oldLevel?: number
  newTier?: Tier
  oldTier?: Tier
  streakMaintained: boolean
  currentStreak: number
  newBadges?: Badge[]
  milestone?: number // e.g., 10, 20, 30 levels
}

export interface PracticeDay {
  date: string // YYYY-MM-DD format
  count: number
}
