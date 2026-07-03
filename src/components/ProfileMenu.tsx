import React, { useState, useRef, useEffect } from 'react';
import { type UserProfile, type UserSettings } from '../utils/db';
import { logout } from '../utils/auth';

interface ProfileMenuProps {
  profile: UserProfile;
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  setTab: (tab: string) => void;
  onLogout: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  profile,
  settings,
  setSettings,
  setTab,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tabId: string) => {
    setTab(tabId);
    setIsOpen(false);
  };

  const handleToggleTheme = () => {
    const newTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    
    // Apply body classes
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleLogoutAction = () => {
    logout();
    onLogout();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative', zIndex: 100 }}>
      
      {/* Target Avatar Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50px',
          padding: '4px 12px 4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'var(--transition-smooth)'
        }}
        className="hover-glow"
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          border: '1px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 0 5px var(--primary-glow)'
        }}>
          {profile.avatar || '⚡'}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {profile.username || 'Typist'}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Menu dropdown Card */}
      {isOpen && (
        <div className="card-glass" style={{
          position: 'absolute',
          top: '45px',
          right: 0,
          width: '240px',
          padding: '15px 0',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          animation: 'fadeInUpScale 0.2s ease forwards'
        }}>
          
          {/* Header context */}
          <div style={{ padding: '0 20px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.name || profile.username}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span>Rank: <strong style={{ color: 'var(--accent)' }}>{profile.rank || 'Beginner'}</strong></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--primary)', fontWeight: 700, marginTop: '5px' }}>
              <span>🔥 Streak: {profile.dailyStreak || 0}d</span>
              <span>🪙 Coins: {profile.coins || 0}</span>
            </div>
          </div>

          {/* Links list */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { id: 'home', label: '🏠 Dashboard' },
              { id: 'settings', label: '⚙️ Profile Settings' },
              { id: 'stats', label: '📊 Stats Dashboard' },
              { id: 'achievements', label: '✨ Achievements' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => handleSelectTab(link.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '10px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  width: '100%',
                  display: 'block',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {link.label}
              </button>
            ))}

            {/* Toggle Theme inline button */}
            <button
              onClick={handleToggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '10px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>🌓 Switch Theme</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
            </button>

            {/* Logout button */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingTop: '8px' }}>
              <button
                onClick={handleLogoutAction}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--error)',
                  padding: '10px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  width: '100%',
                  display: 'block',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🚪 Logout Session
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
