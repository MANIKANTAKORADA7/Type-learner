import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { LearnPage } from './components/LearnPage';
import { TypingTest } from './components/TypingTest';
import { StatsView } from './components/StatsView';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { Settings } from './components/Settings';

// Auth & SaaS Screen Imports
import { About } from './components/About';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { EmailVerification } from './components/EmailVerification';
import { Onboarding } from './components/Onboarding';
import { AdminPanel } from './components/AdminPanel';
import { AuthLayout } from './components/AuthLayout';

import { getCurrentUser, logout, getCurrentSessionEmail } from './utils/auth';
import { loadProfile, loadSettings, type UserProfile, type UserSettings, recordSession } from './utils/db';
import { type FinalSessionStats, type SessionSnapshot } from './types/typing';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './utils/firebase';

function App() {
  const [tab, setTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  
  // Save immediate speed test result to pass to StatsView
  const [sessionResult, setSessionResult] = useState<{
    wpm: number;
    accuracy: number;
    mistakes: number;
    wordsTyped: number;
    duration: number;
    mode: string;
    historySnapshot: SessionSnapshot[];
  } | null>(null);

  // Sync profile and settings when session changes
  const syncUserSession = () => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Load active settings (prefixed by user email/guest)
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);

    // Apply saved theme body class
    if (loadedSettings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    // Check transient signup email verification states
    const pendingEmail = sessionStorage.getItem("typepulse_verifying_email");
    if (pendingEmail) {
      setVerifyingEmail(pendingEmail);
      setTab('verify-email');
    }
  };

  useEffect(() => {
    syncUserSession();

    // Background fetch latest user stats from Cloud Firestore
    const email = getCurrentSessionEmail();
    if (email && email !== 'admin@typepulse.com') {
      const fetchLatest = async () => {
        try {
          const userDocRef = doc(db, "users", email.toLowerCase().trim());
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as any;
            if (userData && userData.profile) {
              const prefix = `typepulse_${email.replace(/[^a-zA-Z0-9]/g, '_')}_`;
              localStorage.setItem(prefix + "profile", JSON.stringify(userData.profile));
              if (userData.settings) localStorage.setItem(prefix + "settings", JSON.stringify(userData.settings));
              if (userData.history) localStorage.setItem(prefix + "history", JSON.stringify(userData.history));
              if (userData.achievements) localStorage.setItem(prefix + "achievements", JSON.stringify(userData.achievements));
              if (userData.completedLessonsMap) localStorage.setItem(prefix + "completed_lessons_map", JSON.stringify(userData.completedLessonsMap));
              
              setCurrentUser(userData.profile);
              setSettings(userData.settings || loadSettings());
            }
          }
        } catch (err) {
          console.error("Firestore startup sync failed:", err);
        }
      };
      fetchLatest();
    }
  }, []);

  // Enforce admin panel routing security
  useEffect(() => {
    if (tab === 'admin' && (!currentUser || currentUser.email !== 'admin@typepulse.com')) {
      setTab('home');
    }
  }, [tab, currentUser]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    syncUserSession();
    // Redirect new users to onboarding
    if (!profile.typingLevel) {
      setTab('onboarding');
    } else {
      setTab('home');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setTab('home');
    syncUserSession();
  };

  const refreshProfile = () => {
    if (currentUser) {
      setCurrentUser(loadProfile());
    }
  };

  const handleCompleteSpeedTest = (stats: FinalSessionStats, mode: string) => {
    // Record session to DB
    recordSession(
      stats.netWpm,
      stats.accuracy,
      stats.incorrectChars,
      mode,
      stats.elapsedTime,
      stats.wordsCompleted
    );
    
    // Cache result to show in immediate stats results page
    setSessionResult({
      wpm: stats.netWpm,
      accuracy: stats.accuracy,
      mistakes: stats.incorrectChars,
      wordsTyped: stats.wordsCompleted,
      duration: stats.elapsedTime,
      mode,
      historySnapshot: stats.historySnapshot
    });
    
    // Switch to stats dashboard tab
    setTab('stats');
    refreshProfile();
  };

  if (!settings) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '20px', color: '#ffd60a', fontWeight: 'bold' }}>Loading TypePulse...</div>
      </div>
    );
  }

  // Force onboarding for authenticated users who haven't completed it
  const isAuth = !!currentUser;
  const needsOnboarding = isAuth && !currentUser?.typingLevel;

  // Intercept protected tabs if Guest
  const protectedTabs = ['learn', 'test', 'stats', 'leaderboard', 'achievements', 'settings', 'admin'];
  const isProtected = protectedTabs.includes(tab);

  const renderContent = () => {
    // Force onboarding layout
    if (needsOnboarding && tab !== 'onboarding') {
      return (
        <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Onboarding profile={currentUser!} onOnboardingComplete={handleLoginSuccess} />
        </div>
      );
    }

    // Guest Route protection check
    if (isProtected && !isAuth) {
      return (
        <AuthLayout title="Authentication Required" subtitle="Please sign in to access practice rooms, roadmap levels, and performance stats.">
          <Login
            onNavigateToSignUp={() => setTab('signup')}
            onNavigateToForgotPassword={() => setTab('forgot-password')}
            onNavigateToVerify={(email) => { setVerifyingEmail(email); setTab('verify-email'); }}
            onLoginSuccess={handleLoginSuccess}
          />
        </AuthLayout>
      );
    }

    switch (tab) {
      // 1. Guest public tabs
      case 'home':
        return (
          <Home
            profile={currentUser}
            isAuthenticated={isAuth}
            onStartLearning={() => {
              if (!isAuth) setTab('login');
              else setTab('learn');
            }}
            onStartSpeedTest={() => {
              if (!isAuth) setTab('login');
              else setTab('test');
            }}
          />
        );
      case 'about':
        return <About />;

      // 2. Auth Flow pages
      case 'login':
        return (
          <AuthLayout title="Welcome Back">
            <Login
              onNavigateToSignUp={() => setTab('signup')}
              onNavigateToForgotPassword={() => setTab('forgot-password')}
              onNavigateToVerify={(email) => { setVerifyingEmail(email); setTab('verify-email'); }}
              onLoginSuccess={handleLoginSuccess}
            />
          </AuthLayout>
        );
      case 'signup':
        return (
          <AuthLayout title="Create Account" subtitle="Join TypePulse to unlock keyboard accuracy maps and stats metrics.">
            <SignUp
              onNavigateToLogin={() => setTab('login')}
              onSignUpSuccess={(email) => { setVerifyingEmail(email); setTab('verify-email'); }}
              onLoginSuccess={handleLoginSuccess}
            />
          </AuthLayout>
        );
      case 'forgot-password':
        return (
          <AuthLayout title="Forgot Password">
            <ForgotPassword
              onNavigateToLogin={() => setTab('login')}
              onNavigateToReset={(email) => { setVerifyingEmail(email); setTab('reset-password'); }}
            />
          </AuthLayout>
        );
      case 'reset-password':
        return (
          <AuthLayout title="Reset Password">
            <ResetPassword
              email={verifyingEmail || ''}
              onResetSuccess={() => setTab('login')}
              onNavigateToLogin={() => setTab('login')}
            />
          </AuthLayout>
        );
      case 'verify-email':
        return (
          <AuthLayout title="Verify Email">
            <EmailVerification
              email={verifyingEmail || ''}
              onVerificationSuccess={handleLoginSuccess}
              onNavigateToLogin={() => setTab('login')}
            />
          </AuthLayout>
        );
      case 'onboarding':
        return (
          <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Onboarding profile={currentUser!} onOnboardingComplete={handleLoginSuccess} />
          </div>
        );

      // 3. Protected practices & statistics tabs
      case 'learn':
        return <LearnPage profile={currentUser!} refreshProfile={refreshProfile} />;
      case 'test':
        return <TypingTest onCompleteSession={handleCompleteSpeedTest} />;
      case 'stats':
        return (
          <StatsView
            sessionResult={sessionResult}
            onClearSession={() => setSessionResult(null)}
            onNavigateToLearn={() => setTab('learn')}
          />
        );
      case 'leaderboard':
        return <Leaderboard profile={currentUser!} refreshProfile={refreshProfile} />;
      case 'achievements':
        return <Achievements />;
      case 'settings':
        return (
          <Settings
            profile={currentUser!}
            settings={settings}
            onUpdateProfile={(p) => { setCurrentUser(p); refreshProfile(); }}
            onUpdateSettings={setSettings}
          />
        );
      case 'admin':
        return <AdminPanel onRefreshAppState={syncUserSession} />;
      
      default:
        return <Home profile={currentUser} isAuthenticated={isAuth} onStartLearning={() => setTab('learn')} onStartSpeedTest={() => setTab('test')} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      
      {/* Global Navbar */}
      <Navbar
        currentTab={tab}
        setTab={setTab}
        profile={currentUser}
        settings={settings}
        setSettings={setSettings}
        isAuthenticated={isAuth}
        onLogout={handleLogout}
      />

      {/* Primary Page Layout Body Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {renderContent()}
      </main>

      {/* Footer Credits */}
      <footer style={{
        padding: '30px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '12px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '40px',
        zIndex: 5
      }}>
        <div>⚡ TypeLearner AI © 2026. Made with Google Antigravity & React. All rights reserved.</div>
      </footer>
      
    </div>
  );
}

export default App;
