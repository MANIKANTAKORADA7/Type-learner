import { auth as firebaseAuth, db as firestoreDb } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs
} from 'firebase/firestore';

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

// 1. Sign Up using Firebase Auth & Firestore
export async function signUp(
  name: string,
  email: string,
  password: string,
  username: string,
  country: string,
  language: string
): Promise<{ success: boolean; message: string; email?: string }> {
  const lowerEmail = email.toLowerCase().trim();

  if (lowerEmail === "admin@typepulse.com") {
    return { success: false, message: "This email address is reserved for system administration." };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, lowerEmail, password);
    const uid = userCredential.user.uid;

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SMTP SIMULATOR] Verification code for ${lowerEmail}: ${verificationCode}`);

    const passwordHash = await hashPassword(password);

    const newUserProfile: UserProfile = {
      id: uid,
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
    };

    const userDoc: RegisteredUser = {
      profile: newUserProfile,
      passwordHash,
      verified: false,
      verificationCode,
      failedAttempts: 0
    };

    await setDoc(doc(firestoreDb, "users", lowerEmail), userDoc);
    sessionStorage.setItem("typepulse_verifying_email", lowerEmail);

    return { success: true, message: "Registration successful. Please enter your verification code.", email: lowerEmail };
  } catch (err: any) {
    console.error("Firebase Sign Up Error:", err);
    let message = "Registration failed. Please check your credentials.";
    if (err.code === "auth/email-already-in-use") {
      message = "An account with this email address already exists.";
    } else if (err.code === "auth/weak-password") {
      message = "Password is too weak.";
    }
    return { success: false, message };
  }
}

// 2. Email Verification
export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
  const lowerEmail = email.toLowerCase().trim();
  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Account not found." };
    }

    const userData = userSnap.data() as RegisteredUser;

    if (userData.verified) {
      return { success: true, message: "Account is already verified.", profile: userData.profile };
    }

    if (userData.verificationCode !== code.trim()) {
      return { success: false, message: "Incorrect verification code. Please check and try again." };
    }

    await updateDoc(userDocRef, {
      verified: true,
      verificationCode: "",
      "profile.lastLogin": new Date().toISOString()
    });

    userData.profile.lastLogin = new Date().toISOString();

    const prefix = `typepulse_${lowerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
    localStorage.setItem(prefix + "profile", JSON.stringify(userData.profile));

    sessionStorage.setItem("typepulse_session", lowerEmail);
    sessionStorage.removeItem("typepulse_verifying_email");

    return { success: true, message: "Email verified successfully!", profile: userData.profile };
  } catch (err) {
    console.error("Firebase Verify Email Error:", err);
    return { success: false, message: "An error occurred during verification." };
  }
}

// Resend Verification Code
export async function resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  const lowerEmail = email.toLowerCase().trim();
  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) return { success: false, message: "Account not found." };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await updateDoc(userDocRef, {
      verificationCode: code
    });

    console.log(`[SMTP SIMULATOR] New Verification code for ${lowerEmail}: ${code}`);
    return { success: true, message: "A new verification code has been generated. Check console logs." };
  } catch (err) {
    console.error("Firebase Resend Error:", err);
    return { success: false, message: "Failed to resend code." };
  }
}

// 3. Login
export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
  const lowerEmail = email.toLowerCase().trim();

  // Pre-seeded Admin Login
  if (lowerEmail === 'admin@typepulse.com') {
    if (password === 'AdminSecurePassword2026!') {
      try {
        const userDocRef = doc(firestoreDb, "users", lowerEmail);
        const userSnap = await getDoc(userDocRef);

        let profile: UserProfile;
        if (!userSnap.exists()) {
          profile = {
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
          };
          await setDoc(userDocRef, {
            profile,
            verified: true,
            failedAttempts: 0,
            passwordHash: "ADMIN_TOKEN_RESTRICTED"
          });
        } else {
          const userData = userSnap.data() as RegisteredUser;
          profile = userData.profile;
          profile.lastLogin = new Date().toISOString();
          await updateDoc(userDocRef, {
            "profile.lastLogin": profile.lastLogin
          });
        }

        const prefix = `typepulse_${lowerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
        localStorage.setItem(prefix + "profile", JSON.stringify(profile));

        if (rememberMe) {
          localStorage.setItem("typepulse_session", lowerEmail);
        } else {
          sessionStorage.setItem("typepulse_session", lowerEmail);
        }

        return { success: true, message: "Welcome back, System Administrator! Access granted.", profile };
      } catch (err) {
        console.error("Firebase Admin Login Error:", err);
        return { success: false, message: "Admin system error." };
      }
    } else {
      return { success: false, message: "Incorrect administrator password." };
    }
  }

  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Invalid email address or password." };
    }

    const userData = userSnap.data() as RegisteredUser;

    const now = Date.now();
    if (userData.lockUntil && userData.lockUntil > now) {
      const waitSeconds = Math.ceil((userData.lockUntil - now) / 1000);
      return { success: false, message: `Too many failed login attempts. Locked. Please wait ${waitSeconds}s.` };
    }

    let firebaseSuccess = false;
    try {
      await signInWithEmailAndPassword(firebaseAuth, lowerEmail, password);
      firebaseSuccess = true;
    } catch {
      const hash = await hashPassword(password);
      if (userData.passwordHash === hash) {
        firebaseSuccess = true;
      }
    }

    if (!firebaseSuccess) {
      const newFailedAttempts = (userData.failedAttempts || 0) + 1;
      let lockUntil: number | null = null;
      if (newFailedAttempts >= 5) {
        lockUntil = Date.now() + 30000;
        await updateDoc(userDocRef, {
          failedAttempts: 0,
          lockUntil
        });
        return { success: false, message: "Too many failed login attempts. Account locked for 30 seconds." };
      } else {
        await updateDoc(userDocRef, {
          failedAttempts: newFailedAttempts
        });
        return { success: false, message: `Incorrect password. ${5 - newFailedAttempts} attempts remaining.` };
      }
    }

    userData.profile.lastLogin = new Date().toISOString();

    await updateDoc(userDocRef, {
      failedAttempts: 0,
      lockUntil: null,
      "profile.lastLogin": userData.profile.lastLogin
    });

    if (!userData.verified) {
      sessionStorage.setItem("typepulse_verifying_email", lowerEmail);
      return { success: false, message: "Please verify your email address before logging in.", profile: userData.profile };
    }

    const prefix = `typepulse_${lowerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
    localStorage.setItem(prefix + "profile", JSON.stringify(userData.profile));
    
    if ((userData as any).settings) {
      localStorage.setItem(prefix + "settings", JSON.stringify((userData as any).settings));
    }
    if ((userData as any).history) {
      localStorage.setItem(prefix + "history", JSON.stringify((userData as any).history));
    }
    if ((userData as any).achievements) {
      localStorage.setItem(prefix + "achievements", JSON.stringify((userData as any).achievements));
    }

    if (rememberMe) {
      localStorage.setItem("typepulse_session", lowerEmail);
    } else {
      sessionStorage.setItem("typepulse_session", lowerEmail);
    }

    return { success: true, message: `Welcome back, ${userData.profile.name}!`, profile: userData.profile };
  } catch (err: any) {
    console.error("Firebase Login Error:", err);
    return { success: false, message: "An unexpected authentication error occurred." };
  }
}

// 4. Social Login Simulation
export async function socialLogin(
  provider: 'google' | 'github' | 'microsoft' | 'apple'
): Promise<{ success: boolean; profile: UserProfile; isNewUser: boolean }> {
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
  
  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    let profile: UserProfile;
    let isNewUser = false;

    if (!userSnap.exists()) {
      isNewUser = true;
      profile = {
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
      };
      await setDoc(userDocRef, {
        profile,
        verified: true,
        failedAttempts: 0,
        passwordHash: "SOCIAL_LOGIN_TOKEN"
      });
    } else {
      const userData = userSnap.data() as RegisteredUser;
      profile = userData.profile;
      profile.lastLogin = new Date().toISOString();
      await updateDoc(userDocRef, {
        "profile.lastLogin": profile.lastLogin
      });
    }

    const prefix = `typepulse_${lowerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
    localStorage.setItem(prefix + "profile", JSON.stringify(profile));
    localStorage.setItem("typepulse_session", lowerEmail);

    return { success: true, profile, isNewUser };
  } catch (err) {
    console.error("Social login error:", err);
    const offlineProfile: UserProfile = {
      id: `${provider}_offline`,
      name,
      email: lowerEmail,
      username: `${provider}_offline`,
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
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem("typepulse_session", lowerEmail);
    return { success: true, profile: offlineProfile, isNewUser: true };
  }
}

// 5. Forgot Password
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const lowerEmail = email.toLowerCase().trim();
  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "No account found with this email address." };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await updateDoc(userDocRef, {
      resetCode
    });

    console.log(`[SMTP SIMULATOR] Reset Password code for ${email}: ${resetCode}`);
    return { success: true, message: "Password reset code has been sent. Check console logs." };
  } catch (err) {
    console.error("Firebase Forgot Password Error:", err);
    return { success: false, message: "Failed to request password reset." };
  }
}

// 6. Reset Password
export async function resetPassword(email: string, code: string, passwordHashValue: string): Promise<{ success: boolean; message: string }> {
  const lowerEmail = email.toLowerCase().trim();
  try {
    const userDocRef = doc(firestoreDb, "users", lowerEmail);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Account not found." };
    }

    const userData = userSnap.data() as RegisteredUser;

    if (!userData.resetCode || userData.resetCode !== code.trim()) {
      return { success: false, message: "Incorrect or expired reset code." };
    }

    await updateDoc(userDocRef, {
      passwordHash: passwordHashValue,
      resetCode: ""
    });

    return { success: true, message: "Password has been reset successfully. You can now login." };
  } catch (err) {
    console.error("Firebase Reset Password Error:", err);
    return { success: false, message: "Failed to reset password." };
  }
}

// 7. Get Current User profile from session
export function getCurrentSessionEmail(): string | null {
  return localStorage.getItem("typepulse_session") || sessionStorage.getItem("typepulse_session");
}

export function getCurrentUser(): UserProfile | null {
  const email = getCurrentSessionEmail();
  if (!email) return null;

  const prefix = `typepulse_${email.replace(/[^a-zA-Z0-9]/g, '_')}_`;
  const cachedProfile = localStorage.getItem(prefix + "profile");
  if (cachedProfile) {
    return JSON.parse(cachedProfile);
  }
  return null;
}

// 8. Logout
export function logout() {
  localStorage.removeItem("typepulse_session");
  sessionStorage.removeItem("typepulse_session");
  sessionStorage.removeItem("typepulse_verifying_email");
  signOut(firebaseAuth).catch(err => console.error("Firebase SignOut error:", err));
}

// 9. Update profile
export function updateProfileInDB(email: string, updatedProfile: UserProfile) {
  const lowerEmail = email.toLowerCase().trim();
  const prefix = `typepulse_${lowerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_`;
  localStorage.setItem(prefix + "profile", JSON.stringify(updatedProfile));

  const userDocRef = doc(firestoreDb, "users", lowerEmail);
  updateDoc(userDocRef, {
    profile: updatedProfile
  }).catch(err => console.error("Firestore Profile Sync Error:", err));
}

// 10. Admin controls
export async function getAdminUsersList(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(firestoreDb, "users"));
    const list: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as RegisteredUser;
      if (data && data.profile) {
        list.push(data.profile);
      }
    });
    return list;
  } catch (err) {
    console.error("Firestore getAdminUsersList error:", err);
    const data = localStorage.getItem("typepulse_users_db");
    if (data) {
      const db = JSON.parse(data);
      return Object.values(db).map((u: any) => u.profile);
    }
    return [];
  }
}

export function pruneAllUsers() {
  localStorage.removeItem("typepulse_users_db");
  logout();
}
