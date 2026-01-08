import type {
  User,
  Affirmation,
  TodayProgress,
  LeaderboardEntry,
  UserRankInfo,
  Badge,
  UserSettings,
  UserStats,
} from "./types"

export const mockUser: User = {
  id: "1",
  name: "Alex",
  level: 32,
  tier: "EXPERT",
  currentStreak: 45,
  totalXP: 8465,
  currentXP: 465,
  xpToNextLevel: 500,
}

export const mockAffirmations: Affirmation[] = [
  {
    id: "1",
    text: "I am capable of handling whatever comes my way",
    timesPracticed: 24,
    lastPracticedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: "2",
    text: "My thoughts do not control me",
    timesPracticed: 18,
    lastPracticedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: "3",
    text: "I choose peace over worry",
    timesPracticed: 12,
    lastPracticedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
  {
    id: "4",
    text: "I deserve happiness and success",
    timesPracticed: 8,
    lastPracticedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: "5",
    text: "Every challenge is an opportunity to grow",
    timesPracticed: 15,
    lastPracticedAt: null,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: "6",
    text: "I release what I cannot control",
    timesPracticed: 6,
    lastPracticedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    archived: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
  },
]

export const mockTodayProgress: TodayProgress = {
  practiceGoalMet: true,
  streakMaintained: true,
  practiceCount: 3,
  dailyGoal: 3,
}

export const mockLeaderboardWeekly: LeaderboardEntry[] = [
  { userId: "u1", username: "MindfulMaster", totalReps: 847, level: 45, tier: "MASTER" },
  { userId: "u2", username: "ZenWarrior", totalReps: 723, level: 41, tier: "MASTER" },
  { userId: "u3", username: "ThoughtShifter", totalReps: 689, level: 38, tier: "EXPERT" },
  { userId: "u4", username: "CalmSeeker", totalReps: 612, level: 36, tier: "EXPERT" },
  { userId: "u5", username: "PeacefulMind", totalReps: 587, level: 35, tier: "EXPERT" },
  { userId: "u6", username: "Anonymous User", totalReps: 534, level: 33, tier: "EXPERT" },
  { userId: "u7", username: "GrowthJourney", totalReps: 498, level: 31, tier: "PRACTITIONER" },
  { userId: "u8", username: "InnerPeace", totalReps: 456, level: 29, tier: "PRACTITIONER" },
  { userId: "u9", username: "MindReset", totalReps: 423, level: 28, tier: "PRACTITIONER" },
  { userId: "u10", username: "PositiveShift", totalReps: 401, level: 27, tier: "PRACTITIONER" },
  { userId: "u11", username: "ClearThoughts", totalReps: 389, level: 26, tier: "PRACTITIONER" },
  { userId: "u12", username: "BrightMind", totalReps: 367, level: 25, tier: "PRACTITIONER" },
  { userId: "u13", username: "SteadyGrowth", totalReps: 345, level: 24, tier: "APPRENTICE" },
  { userId: "u14", username: "MindfulStep", totalReps: 334, level: 23, tier: "APPRENTICE" },
  { userId: "u15", username: "WiseThoughts", totalReps: 312, level: 22, tier: "APPRENTICE" },
  { userId: "u16", username: "Anonymous User", totalReps: 298, level: 21, tier: "APPRENTICE" },
  { userId: "u17", username: "NewBeginning", totalReps: 287, level: 20, tier: "APPRENTICE" },
  { userId: "u18", username: "FreshStart", totalReps: 276, level: 19, tier: "APPRENTICE" },
  { userId: "u19", username: "HopefulHeart", totalReps: 265, level: 18, tier: "APPRENTICE" },
  { userId: "u20", username: "GentleMind", totalReps: 254, level: 17, tier: "APPRENTICE" },
  { userId: "u21", username: "QuietStrength", totalReps: 243, level: 16, tier: "NOVICE" },
  { userId: "u22", username: "SoftPower", totalReps: 232, level: 15, tier: "NOVICE" },
  { userId: "current", username: "Alex", totalReps: 221, level: 32, tier: "EXPERT", isCurrentUser: true },
  { userId: "u24", username: "BraveSoul", totalReps: 198, level: 13, tier: "NOVICE" },
  { userId: "u25", username: "KindHeart", totalReps: 187, level: 12, tier: "NOVICE" },
]

export const mockLeaderboardMonthly: LeaderboardEntry[] = mockLeaderboardWeekly
  .map((entry, i) => ({
    ...entry,
    totalReps: entry.totalReps * 4 + Math.floor(Math.random() * 100),
  }))
  .sort((a, b) => b.totalReps - a.totalReps)

export const mockLeaderboardAllTime: LeaderboardEntry[] = mockLeaderboardWeekly
  .map((entry, i) => ({
    ...entry,
    totalReps: entry.totalReps * 20 + Math.floor(Math.random() * 500),
  }))
  .sort((a, b) => b.totalReps - a.totalReps)

export const mockBadges: Badge[] = [
  {
    id: "b1",
    name: "First Step",
    icon: "footprints",
    description: "Complete your first practice",
    requirement: "1 practice",
    earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
  },
  {
    id: "b2",
    name: "Week Warrior",
    icon: "calendar",
    description: "Maintain a 7-day streak",
    requirement: "7-day streak",
    earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
  },
  {
    id: "b3",
    name: "Century Club",
    icon: "trophy",
    description: "Complete 100 practice sessions",
    requirement: "100 practices",
    earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  },
  {
    id: "b4",
    name: "Mind Master",
    icon: "brain",
    description: "Reach Expert tier",
    requirement: "Expert tier",
    earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    id: "b5",
    name: "Streak Legend",
    icon: "flame",
    description: "Maintain a 30-day streak",
    requirement: "30-day streak",
    earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: "b6",
    name: "Affirmation Author",
    icon: "pencil",
    description: "Create 10 custom affirmations",
    requirement: "10 affirmations",
    earnedAt: null,
  },
  {
    id: "b7",
    name: "Night Owl",
    icon: "moon",
    description: "Practice after midnight",
    requirement: "Late night practice",
    earnedAt: null,
  },
  {
    id: "b8",
    name: "Early Bird",
    icon: "sunrise",
    description: "Practice before 6 AM",
    requirement: "Early morning practice",
    earnedAt: null,
  },
  {
    id: "b9",
    name: "Marathon Mind",
    icon: "clock",
    description: "Complete 50 reps in one session",
    requirement: "50 reps in session",
    earnedAt: null,
  },
  {
    id: "b10",
    name: "Social Butterfly",
    icon: "users",
    description: "Share an affirmation",
    requirement: "Share affirmation",
    earnedAt: null,
  },
  {
    id: "b11",
    name: "Perfectionist",
    icon: "check-circle",
    description: "Type an affirmation perfectly 10 times",
    requirement: "10 perfect reps",
    earnedAt: null,
  },
  {
    id: "b12",
    name: "Diverse Thinker",
    icon: "layers",
    description: "Practice 5 different affirmations in one day",
    requirement: "5 affirmations/day",
    earnedAt: null,
  },
  {
    id: "b13",
    name: "Year Strong",
    icon: "award",
    description: "Maintain a 365-day streak",
    requirement: "365-day streak",
    earnedAt: null,
  },
  {
    id: "b14",
    name: "Master Mind",
    icon: "crown",
    description: "Reach Master tier",
    requirement: "Master tier",
    earnedAt: null,
  },
  {
    id: "b15",
    name: "Thousand Reps",
    icon: "star",
    description: "Complete 1,000 total reps",
    requirement: "1,000 reps",
    earnedAt: null,
  },
]

export const mockUserSettings: UserSettings = {
  reminderEnabled: true,
  reminderTime: "09:00",
  dailyPracticeGoal: 3,
}

export const mockUserStats: UserStats = {
  totalPractices: 123,
  totalReps: 2456,
}

export const mockUserRankInfo: UserRankInfo = {
  rank: 23,
  totalUsers: 1247,
  repsToNextRank: 11,
  nextRankUsername: "SoftPower",
  anonymousMode: false,
}

function generateMockPracticeData(): { date: string; count: number }[] {
  const data: { date: string; count: number }[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // Generate realistic practice patterns
    // Higher probability of practicing on weekdays
    // Streaks of consistent practice
    // Some gaps
    const dayOfWeek = date.getDay()
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

    let count = 0
    const rand = Math.random()

    if (rand < 0.15) {
      count = 0 // 15% no practice
    } else if (rand < 0.35) {
      count = 1 // 20% light practice
    } else if (rand < 0.6) {
      count = 2 // 25% moderate
    } else if (rand < 0.85) {
      count = isWeekday ? 4 : 3 // 25% good practice
    } else {
      count = isWeekday ? 6 : 5 // 15% heavy practice
    }

    data.push({ date: dateStr, count })
  }

  return data
}

export const mockPracticeData = generateMockPracticeData()
