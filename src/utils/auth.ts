// Secure authentication utilities using SHA-256 hashing and LocalStorage.

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  joinedDate: string;
  dailyStreak: number;
  lastActiveDate: string;
  rank: string;
  country: string;
  language: string;
  typingLevel?: 'beginner' | 'intermediate' | 'advanced';
  bestWpm?: number;
  averageWpm?: number;
  accuracy?: number;
  completedLessons?: number;
  achievements?: string[];
  createdDate: string;
  lastLogin: string;
  goal?: string;
  dailyGoalMinutes?: number;
}

export interface RegisteredUser {
  profile: UserProfile;
  passwordHash: string;
  verified: boolean;
  verificationCode?: string;
  failedAttempts: number;
  lockUntil?: number;
  resetCode?: string;
}

// SHA-256 Hashing helper
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Read database of users from localStorage
const getUsersDB = (): Record<string, RegisteredUser> => {
  const data = localStorage.getItem("typepulse_users_db");
  return data ? JSON.parse(data) : {};
};

// Write database of users to localStorage
const saveUsersDB = (db: Record<string, RegisteredUser>) => {
  localStorage.setItem("typepulse_users_db", JSON.stringify(db));
};

// Rate Limit settings: Max 5 attempts, locked for 30 seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000;

// Password requirement checkers
export interface PasswordRequirements {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  strength: 'Weak' | 'Medium' | 'Strong';
}

export function checkPasswordStrength(password: string): PasswordRequirements {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score >= 5) {
    strength = 'Strong';
  } else if (score >= 3) {
    strength = 'Medium';
  }

  return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial, strength };
}

// Authentication Actions

// 1. Sign Up
export async function signUp(
  name: string,
  email: string,
  password: string,
  username: string,
  country: string,
  language: string
): Promise<{ success: boolean; message: string; email?: string }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();

  if (lowerEmail === "admin@typepulse.com") {
    return { success: false, message: "This email address is reserved for system administration." };
  }

  if (db[lowerEmail]) {
    return { success: false, message: "An account with this email address already exists." };
  }

  const requirements = checkPasswordStrength(password);
  if (requirements.strength === 'Weak') {
    return { success: false, message: "Password does not meet the minimum strength requirements." };
  }

  // Create verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = await hashPassword(password);

  // Generate welcome code notification to screen
  console.log(`[SMTP SIMULATOR] Verification code for ${email}: ${verificationCode}`);
  
  const newUser: RegisteredUser = {
    passwordHash,
    verified: false,
    verificationCode,
    failedAttempts: 0,
    profile: {
      id: Math.random().toString(36).substring(2, 11),
      name,
      email: lowerEmail,
      username: username || name.split(" ")[0] || "User",
      avatar: "⚡",
      level: 1,
      xp: 0,
      coins: 50,
      joinedDate: new Date().toLocaleDateString(),
      dailyStreak: 0,
      lastActiveDate: "",
      rank: "Beginner",
      country,
      language,
      createdDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bestWpm: 0,
      averageWpm: 0,
      accuracy: 0,
      completedLessons: 0,
      achievements: []
    }
  };

  db[lowerEmail] = newUser;
  saveUsersDB(db);

  // Store transient signup email in sessionStorage to verify
  sessionStorage.setItem("typepulse_verifying_email", lowerEmail);

  return { success: true, message: "Registration successful. Please enter your verification code.", email: lowerEmail };
}

// 2. Email Verification
export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db[lowerEmail];

  if (!user) {
    return { success: false, message: "Account not found." };
  }

  if (user.verified) {
    return { success: true, message: "Account is already verified.", profile: user.profile };
  }

  if (user.verificationCode !== code.trim()) {
    return { success: false, message: "Incorrect verification code. Please check and try again." };
  }

  user.verified = true;
  delete user.verificationCode;
  
  // Set as current session
  db[lowerEmail] = user;
  saveUsersDB(db);
  
  sessionStorage.setItem("typepulse_session", lowerEmail);
  sessionStorage.removeItem("typepulse_verifying_email");

  return { success: true, message: "Email verified successfully!", profile: user.profile };
}

// Resend Verification Code
export async function resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db[lowerEmail];

  if (!user) return { success: false, message: "Account not found." };

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  db[lowerEmail] = user;
  saveUsersDB(db);

  console.log(`[SMTP SIMULATOR] New Verification code for ${email}: ${code}`);
  return { success: true, message: "A new verification code has been generated. Check console/screen overlay." };
}

// 3. Login
export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();

  // Pre-seeded Admin Login
  if (lowerEmail === 'admin@typepulse.com') {
    if (password === 'AdminSecurePassword2026!') {
      let adminUser = db[lowerEmail];
      if (!adminUser) {
        adminUser = {
          passwordHash: "ADMIN_TOKEN_RESTRICTED",
          verified: true,
          failedAttempts: 0,
          profile: {
            id: 'admin_sys_9999',
            name: "System Administrator",
            email: lowerEmail,
            username: "admin",
            avatar: "🛡️",
            level: 100,
            xp: 99999,
            coins: 9999,
            joinedDate: new Date().toLocaleDateString(),
            dailyStreak: 1,
            lastActiveDate: new Date().toLocaleDateString(),
            rank: "System Admin",
            country: "US",
            language: "EN",
            createdDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            bestWpm: 120,
            averageWpm: 105,
            accuracy: 99,
            completedLessons: 700,
            achievements: ["first_lesson", "speed_50", "speed_100", "accuracy_95", "accuracy_100", "words_1000", "curriculum_master"]
          }
        };
        db[lowerEmail] = adminUser;
        saveUsersDB(db);
      } else {
        adminUser.profile.lastLogin = new Date().toISOString();
        db[lowerEmail] = adminUser;
        saveUsersDB(db);
      }

      if (rememberMe) {
        localStorage.setItem("typepulse_session", lowerEmail);
      } else {
        sessionStorage.setItem("typepulse_session", lowerEmail);
      }

      return { success: true, message: "Welcome back, System Administrator! Access granted.", profile: adminUser.profile };
    } else {
      return { success: false, message: "Incorrect administrator password." };
    }
  }

  const user = db[lowerEmail];

  if (!user) {
    return { success: false, message: "Invalid email address or password." };
  }

  // Check rate limiting lockout
  const now = Date.now();
  if (user.lockUntil && user.lockUntil > now) {
    const waitSeconds = Math.ceil((user.lockUntil - now) / 1000);
    return { success: false, message: `Too many failed login attempts. Locked. Please wait ${waitSeconds}s.` };
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      user.failedAttempts = 0; // reset attempts after locking
    }
    db[lowerEmail] = user;
    saveUsersDB(db);

    if (user.lockUntil) {
      return { success: false, message: "Too many failed login attempts. Account locked for 30 seconds." };
    }
    return { success: false, message: `Incorrect password. ${MAX_FAILED_ATTEMPTS - user.failedAttempts} attempts remaining.` };
  }

  // Check verification
  if (!user.verified) {
    sessionStorage.setItem("typepulse_verifying_email", lowerEmail);
    return { success: false, message: "Please verify your email address before logging in.", profile: user.profile };
  }

  // Reset failed attempts
  user.failedAttempts = 0;
  user.lockUntil = undefined;
  user.profile.lastLogin = new Date().toISOString();
  db[lowerEmail] = user;
  saveUsersDB(db);

  // Set session
  if (rememberMe) {
    localStorage.setItem("typepulse_session", lowerEmail);
  } else {
    sessionStorage.setItem("typepulse_session", lowerEmail);
  }

  return { success: true, message: `Welcome back, ${user.profile.name}!`, profile: user.profile };
}

// 4. Social Login Simulation
export async function socialLogin(
  provider: 'google' | 'github' | 'microsoft' | 'apple'
): Promise<{ success: boolean; profile: UserProfile; isNewUser: boolean }> {
  const db = getUsersDB();
  
  // Mock profiles for providers
  const mockNames = {
    google: "G-User Alpha",
    github: "git-dev-expert",
    microsoft: "MSFT Keyboardist",
    apple: "Mac Typist"
  };
  const mockAvatars = {
    google: "👾",
    github: "🦊",
    microsoft: "💻",
    apple: "🍎"
  };

  const name = mockNames[provider];
  const email = `${provider}_user_${Math.floor(1000 + Math.random() * 9000)}@${provider}.com`;
  const lowerEmail = email.toLowerCase();
  
  let user = db[lowerEmail];
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = {
      passwordHash: "SOCIAL_LOGIN_TOKEN",
      verified: true,
      failedAttempts: 0,
      profile: {
        id: `${provider}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        email: lowerEmail,
        username: `${provider}_${Math.random().toString(36).substring(2, 7)}`,
        avatar: mockAvatars[provider],
        level: 1,
        xp: 0,
        coins: 50,
        joinedDate: new Date().toLocaleDateString(),
        dailyStreak: 1,
        lastActiveDate: new Date().toLocaleDateString(),
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
      }
    };
    db[lowerEmail] = user;
    saveUsersDB(db);
  } else {
    user.profile.lastLogin = new Date().toISOString();
    db[lowerEmail] = user;
    saveUsersDB(db);
  }

  // Log in
  localStorage.setItem("typepulse_session", lowerEmail);

  return { success: true, profile: user.profile, isNewUser };
}

// 5. Forgot Password
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db[lowerEmail];

  if (!user) {
    // Return success to prevent email enumeration attacks (production best practice)
    return { success: true, message: "If the email is registered, a password reset link has been sent." };
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  db[lowerEmail] = user;
  saveUsersDB(db);

  console.log(`[SMTP SIMULATOR] Reset Password code for ${email}: ${resetCode}`);
  return { success: true, message: "Password reset link has been sent. Check console/screen overlay." };
}

// 6. Reset Password
export async function resetPassword(email: string, code: string, passwordHashValue: string): Promise<{ success: boolean; message: string }> {
  const db = getUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db[lowerEmail];

  if (!user) {
    return { success: false, message: "Account not found." };
  }

  if (!user.resetCode || user.resetCode !== code.trim()) {
    return { success: false, message: "Incorrect or expired reset code." };
  }

  user.passwordHash = passwordHashValue;
  delete user.resetCode;
  db[lowerEmail] = user;
  saveUsersDB(db);

  return { success: true, message: "Password has been reset successfully. You can now login." };
}

// 7. Get Current User profile from session
export function getCurrentSessionEmail(): string | null {
  return localStorage.getItem("typepulse_session") || sessionStorage.getItem("typepulse_session");
}

export function getCurrentUser(): UserProfile | null {
  const email = getCurrentSessionEmail();
  if (!email) return null;

  const db = getUsersDB();
  const user = db[email];
  return user ? user.profile : null;
}

// 8. Logout
export function logout() {
  localStorage.removeItem("typepulse_session");
  sessionStorage.removeItem("typepulse_session");
  sessionStorage.removeItem("typepulse_verifying_email");
}

// 9. Update profile
export function updateProfileInDB(email: string, updatedProfile: UserProfile) {
  const db = getUsersDB();
  const user = db[email.toLowerCase().trim()];
  if (user) {
    user.profile = { ...user.profile, ...updatedProfile };
    db[email.toLowerCase().trim()] = user;
    saveUsersDB(db);
  }
}

// 10. Admin controls
export function getAdminUsersList(): UserProfile[] {
  const db = getUsersDB();
  return Object.values(db).map(u => u.profile);
}

export function pruneAllUsers() {
  localStorage.removeItem("typepulse_users_db");
  logout();
}
