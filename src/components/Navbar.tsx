import React, { useEffect, useState } from 'react';
import { type UserProfile, type UserSettings } from '../utils/db';
import { ProfileMenu } from './ProfileMenu';
import { BubbleMenu } from './BubbleMenu';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  profile: UserProfile | null;
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  profile,
  settings,
  setSettings,
  isAuthenticated,
  onLogout
}) => {
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    if (profile) {
      const nextLevelXP = profile.level * 1000;
      const progress = Math.min((profile.xp / nextLevelXP) * 100, 100);
      setXpProgress(progress);
    }
  }, [profile]);

  const toggleTheme = () => {
    const newTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    
    // Apply layout theme body class
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const toggleSound = () => {
    setSettings({ ...settings, soundOn: !settings.soundOn });
  };

  // Define nav links dynamically based on authentication
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: '💡' },
  ];

  const bubbleItems = [
    { id: 'home', label: 'Dashboard', rotation: -6, hoverStyles: { bgColor: 'var(--primary)', textColor: 'var(--text-dark)' } },
    { id: 'learn', label: 'Learn Roadmap', rotation: 6, hoverStyles: { bgColor: 'var(--accent)', textColor: 'var(--text-dark)' } },
    { id: 'test', label: 'Typing Test', rotation: 4, hoverStyles: { bgColor: 'var(--success)', textColor: 'var(--text-dark)' } },
    { id: 'stats', label: 'Stats Dashboard', rotation: -4, hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' } },
    { id: 'leaderboard', label: 'Leaderboard', rotation: 3, hoverStyles: { bgColor: '#ec4899', textColor: '#ffffff' } },
    { id: 'achievements', label: 'Achievements', rotation: -5, hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' } },
    ...(profile?.email === 'admin@typepulse.com' ? [{ id: 'admin', label: 'Admin Panel', rotation: 5, hoverStyles: { bgColor: 'var(--error)', textColor: '#ffffff' } }] : [])
  ];

  return (
    <nav className="card-glass" style={{
      margin: '20px 20px 0 20px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setTab('home')}>
        <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
          ⚡ TYPE<span style={{ color: 'var(--accent)' }}>LEARNER</span>
        </span>
      </div>

      {/* Nav Navigation tabs */}
      {!isAuthenticated ? (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  background: isActive ? 'rgba(255, 214, 10, 0.15)' : 'transparent',
                  border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <BubbleMenu
          items={bubbleItems}
          onItemClick={setTab}
          useFixedPosition={true}
          menuBg="var(--primary)"
          menuContentColor="var(--text-dark)"
          className="custom-nav-menu"
        />
      )}

      {/* User Stats & Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* XP & Level Badge (Only shown if Authenticated) */}
        {isAuthenticated && profile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <div style={{
                background: 'var(--primary)',
                color: 'var(--text-dark)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '0 0 8px var(--primary-glow)'
              }}>
                {profile.level}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>XP PROGRESS</span>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${xpProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            </div>

            {/* Coins indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>
              <span>🪙</span>
              <span>{profile.coins}</span>
            </div>
          </>
        )}

        {/* Action Toggles */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundOn ? "Mute typing sound" : "Unmute typing sound"}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
          >
            {settings.soundOn ? '🔊' : '🔇'}
          </button>

          {/* Theme Toggle (Hidden in Navbar for Auth to avoid clutter, since it is inside profile menu dropdown, but keeping it is fine) */}
          <button
            onClick={toggleTheme}
            title="Toggle theme mode"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
          >
            {settings.theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* User Profile dropdown or Auth Buttons */}
          {isAuthenticated && profile ? (
            <ProfileMenu
              profile={profile}
              settings={settings}
              setSettings={setSettings}
              setTab={setTab}
              onLogout={onLogout}
            />
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '5px' }}>
              <button
                onClick={() => setTab('login')}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)', boxShadow: 'none' }}
              >
                Sign Up
              </button>
            </div>
          )}

        </div>
        
      </div>
    </nav>
  );
};
