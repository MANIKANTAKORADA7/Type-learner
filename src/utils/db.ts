import { getCurrentSessionEmail } from './auth';
import { db as firestoreDb } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  joinedDate: string;
  dailyStreak: number;
  lastActiveDate: string;
  rank: string;
  country?: string;
  language?: string;
  typingLevel?: 'beginner' | 'intermediate' | 'advanced';
  bestWpm?: number;
  averageWpm?: number;
  accuracy?: number;
  completedLessons?: number;
  achievements?: string[];
  createdDate?: string;
  lastLogin?: string;
  goal?: string;
  dailyGoalMinutes?: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  soundOn: boolean;
  fontSize: number;
  fontType: 'mono' | 'sans';
  animations: boolean;
}

export interface TypingSession {
  id: string;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mistakes: number;
  mode: string; // e.g. "lesson-1", "test-30"
  duration: number; // in seconds
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Typist Pioneer",
  avatar: "⚡",
  level: 1,
  xp: 0,
  coins: 50,
  joinedDate: new Date().toLocaleDateString(),
  dailyStreak: 0,
  lastActiveDate: "",
  rank: "Beginner",
  country: "US",
  language: "EN",
  createdDate: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  bestWpm: 0,
  averageWpm: 0,
  accuracy: 0,
  completedLessons: 0,
  achievements: []
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  soundOn: true,
  fontSize: 18,
  fontType: "mono",
  animations: true
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first_lesson", title: "First Lesson", description: "Complete your very first lesson", icon: "🌱", unlocked: false, progress: 0, target: 1 },
  { id: "speed_50", title: "Speedy Learner", description: "Reach 50 WPM in any typing test", icon: "🚀", unlocked: false, progress: 0, target: 50 },
  { id: "speed_100", title: "Speed Demon", description: "Reach 100 WPM in any typing test", icon: "🔥", unlocked: false, progress: 0, target: 100 },
  { id: "accuracy_95", title: "Sharp Shooter", description: "Achieve 95% or higher accuracy", icon: "🎯", unlocked: false, progress: 0, target: 95 },
  { id: "accuracy_100", title: "Perfect Precision", description: "Achieve 100% accuracy in a session", icon: "🏆", unlocked: false, progress: 0, target: 100 },
  { id: "words_1000", title: "Word Weaver", description: "Type 1,000 total words", icon: "📚", unlocked: false, progress: 0, target: 1000 },
  { id: "curriculum_master", title: "Typing Legend", description: "Complete all 700 curriculum lessons", icon: "👑", unlocked: false, progress: 0, target: 700 }
];

// Helper to generate prefix based on active logged in session
export const getPrefix = (): string => {
  const email = getCurrentSessionEmail();
  return email ? `typepulse_${email.replace(/[^a-zA-Z0-9]/g, '_')}_` : 'typepulse_guest_';
};

export const loadProfile = (): UserProfile => {
  const prefix = getPrefix();
  const data = localStorage.getItem(prefix + "profile");
  if (!data) {
    // If it's a registered user, they might already have a profile created in the db.
    // Try to load the database record first.
    const usersData = localStorage.getItem("typepulse_users_db");
    const email = getCurrentSessionEmail();
    if (email && usersData) {
      const db = JSON.parse(usersData);
      if (db[email] && db[email].profile) {
        saveProfile(db[email].profile);
        return db[email].profile;
      }
    }
    saveProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }
  const parsed = JSON.parse(data);
  if (!parsed.rank) {
    parsed.rank = "Beginner";
  }
  return parsed;
};

export const saveProfile = (profile: UserProfile) => {
  const prefix = getPrefix();
  localStorage.setItem(prefix + "profile", JSON.stringify(profile));

  const email = getCurrentSessionEmail();
  if (email) {
    const userDocRef = doc(firestoreDb, "users", email.toLowerCase().trim());
    updateDoc(userDocRef, {
      profile: profile
    }).catch(err => console.error("Firestore saveProfile error:", err));
  }
};

export const loadSettings = (): UserSettings => {
  const prefix = getPrefix();
  const data = localStorage.getItem(prefix + "settings");
  if (!data) {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings: UserSettings) => {
  const prefix = getPrefix();
  localStorage.setItem(prefix + "settings", JSON.stringify(settings));

  const email = getCurrentSessionEmail();
  if (email) {
    const userDocRef = doc(firestoreDb, "users", email.toLowerCase().trim());
    updateDoc(userDocRef, {
      settings: settings
    }).catch(err => console.error("Firestore saveSettings error:", err));
  }
};

export const loadHistory = (): TypingSession[] => {
  const prefix = getPrefix();
  const data = localStorage.getItem(prefix + "history");
  return data ? JSON.parse(data) : [];
};

export const saveHistory = (history: TypingSession[]) => {
  const prefix = getPrefix();
  localStorage.setItem(prefix + "history", JSON.stringify(history));

  const email = getCurrentSessionEmail();
  if (email) {
    const userDocRef = doc(firestoreDb, "users", email.toLowerCase().trim());
    updateDoc(userDocRef, {
      history: history
    }).catch(err => console.error("Firestore saveHistory error:", err));
  }
};

export const loadAchievements = (): Achievement[] => {
  const prefix = getPrefix();
  const data = localStorage.getItem(prefix + "achievements");
  if (!data) {
    saveAchievements(DEFAULT_ACHIEVEMENTS);
    return DEFAULT_ACHIEVEMENTS;
  }
  return JSON.parse(data);
};

export const saveAchievements = (achievements: Achievement[]) => {
  const prefix = getPrefix();
  localStorage.setItem(prefix + "achievements", JSON.stringify(achievements));

  const email = getCurrentSessionEmail();
  if (email) {
    const userDocRef = doc(firestoreDb, "users", email.toLowerCase().trim());
    updateDoc(userDocRef, {
      achievements: achievements
    }).catch(err => console.error("Firestore saveAchievements error:", err));
  }
};

// Maps lessonNum -> starsEarned (1-5)
export const loadCompletedLessonsMap = (): Record<number, number> => {
  const prefix = getPrefix();
  const data = localStorage.getItem(prefix + "completed_lessons_map");
  return data ? JSON.parse(data) : {};
};

export const saveCompletedLessonsMap = (map: Record<number, number>) => {
  const prefix = getPrefix();
  localStorage.setItem(prefix + "completed_lessons_map", JSON.stringify(map));

  const email = getCurrentSessionEmail();
  if (email) {
    const userDocRef = doc(firestoreDb, "users", email.toLowerCase().trim());
    updateDoc(userDocRef, {
      completedLessonsMap: map
    }).catch(err => console.error("Firestore saveCompletedLessonsMap error:", err));
  }
};

// Determine Rank based on completed lessons
export const calculateRank = (completedCount: number): string => {
  if (completedCount >= 700) return "Typing Legend";
  if (completedCount >= 650) return "Master";
  if (completedCount >= 600) return "Elite";
  if (completedCount >= 500) return "Professional";
  if (completedCount >= 400) return "Expert";
  if (completedCount >= 300) return "Advanced";
  if (completedCount >= 200) return "Skilled";
  if (completedCount >= 100) return "Apprentice";
  if (completedCount >= 40) return "Learner";
  if (completedCount >= 10) return "Novice";
  return "Beginner";
};

// Main trigger to update stats, award XP and handle unlocks
export const recordSession = (
  wpm: number,
  accuracy: number,
  mistakes: number,
  mode: string,
  duration: number,
  wordsTyped: number,
  starsEarned = 1
): { xpEarned: number; newLevelUp: boolean; unlockedAchievements: string[]; rankChanged: boolean } => {
  const profile = loadProfile();
  const history = loadHistory();
  const achievements = loadAchievements();
  const completedMap = loadCompletedLessonsMap();

  // Create new session entry
  const newSession: TypingSession = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    wpm,
    rawWpm: Math.round(wpm * (1 + mistakes / (wordsTyped || 1))),
    accuracy,
    mistakes,
    mode,
    duration
  };

  history.push(newSession);
  saveHistory(history);

  // Streak checks
  const todayStr = new Date().toLocaleDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString();

  if (profile.lastActiveDate === yesterdayStr) {
    profile.dailyStreak += 1;
  } else if (profile.lastActiveDate !== todayStr) {
    profile.dailyStreak = 1;
  }
  profile.lastActiveDate = todayStr;

  // XP logic (extra rewards for more stars)
  const baseXP = wordsTyped * 2;
  const accuracyMultiplier = accuracy / 100;
  const speedBonus = wpm > 40 ? Math.floor((wpm - 40) * 1.5) : 0;
  const starMultiplier = 0.8 + (starsEarned * 0.2); // extra multiplier for stars 1-5
  const xpEarned = Math.round((baseXP * accuracyMultiplier + speedBonus + 10) * starMultiplier);
  
  profile.xp += xpEarned;
  profile.coins += Math.round(xpEarned / 5);

  // Level Up check (1000 XP per level)
  const xpForNextLevel = profile.level * 1000;
  let newLevelUp = false;
  if (profile.xp >= xpForNextLevel) {
    profile.level += 1;
    newLevelUp = true;
  }

  // Handle lesson completions and stars recording
  if (mode.startsWith("lesson-")) {
    const lessonNum = parseInt(mode.split("-")[1], 10);
    // Keep the highest stars score achieved for this lesson
    const pastStars = completedMap[lessonNum] || 0;
    if (starsEarned > pastStars) {
      completedMap[lessonNum] = starsEarned;
      saveCompletedLessonsMap(completedMap);
    }
  }

  // Update Rank based on completed lessons count
  const completedLessonsCount = Object.keys(completedMap).length;
  const oldRank = profile.rank;
  const newRank = calculateRank(completedLessonsCount);
  let rankChanged = false;
  if (newRank !== oldRank) {
    profile.rank = newRank;
    rankChanged = true;
  }

  // Update WPM stats in profile
  if (history.length > 0) {
    profile.bestWpm = Math.round(Math.max(...history.map(s => s.wpm), wpm));
    const totalWpm = history.reduce((acc, s) => acc + s.wpm, 0);
    profile.averageWpm = Math.round(totalWpm / history.length);
    const totalAccuracy = history.reduce((acc, s) => acc + s.accuracy, 0);
    profile.accuracy = Math.round(totalAccuracy / history.length);
  } else {
    profile.bestWpm = Math.round(wpm);
    profile.averageWpm = Math.round(wpm);
    profile.accuracy = Math.round(accuracy);
  }
  profile.completedLessons = completedLessonsCount;

  // Achievement logic checker
  const totalWords = history.reduce((acc, curr) => acc + (curr.wpm * (curr.duration / 60)), 0) + wordsTyped;
  const unlockedAchievements: string[] = [];

  const updatedAchievements = achievements.map(ach => {
    if (ach.unlocked) return ach;

    let progress = ach.progress;
    let unlocked = false;

    if (ach.id === "first_lesson" && mode.startsWith("lesson-")) {
      progress = 1;
      unlocked = true;
    } else if (ach.id === "speed_50" && wpm >= 50) {
      progress = wpm;
      unlocked = true;
    } else if (ach.id === "speed_100" && wpm >= 100) {
      progress = wpm;
      unlocked = true;
    } else if (ach.id === "accuracy_95" && accuracy >= 95) {
      progress = accuracy;
      unlocked = true;
    } else if (ach.id === "accuracy_100" && accuracy === 100) {
      progress = accuracy;
      unlocked = true;
    } else if (ach.id === "words_1000") {
      progress = Math.min(totalWords, 1000);
      if (progress >= 1000) unlocked = true;
    } else if (ach.id === "curriculum_master") {
      progress = completedLessonsCount;
      if (progress >= 700) unlocked = true;
    }

    if (unlocked && !ach.unlocked) {
      unlockedAchievements.push(ach.title);
      return { ...ach, progress, unlocked: true, unlockedAt: Date.now() };
    }

    return { ...ach, progress };
  });

  // Collect unlocked achievements ids
  profile.achievements = updatedAchievements.filter(a => a.unlocked).map(a => a.id);

  saveAchievements(updatedAchievements);
  saveProfile(profile);

  return { xpEarned, newLevelUp, unlockedAchievements, rankChanged };
};
