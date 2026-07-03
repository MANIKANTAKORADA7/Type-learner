import React, { useState } from 'react';
import { type UserProfile, type UserSettings, saveProfile, saveSettings } from '../utils/db';
import { checkPasswordStrength, hashPassword } from '../utils/auth';

interface SettingsProps {
  profile: UserProfile;
  settings: UserSettings;
  onUpdateProfile: (p: UserProfile) => void;
  onUpdateSettings: (s: UserSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  profile,
  settings,
  onUpdateProfile,
  onUpdateSettings
}) => {
  // Profile settings state
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [country, setCountry] = useState(profile.country || 'US');
  const [language, setLanguage] = useState(profile.language || 'EN');
  
  // Notification states
  const [emailSummary, setEmailSummary] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  // Security password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSavedError, setIsSavedError] = useState('');

  const avatars = ["⚡", "🔥", "🚀", "🎯", "👑", "🛡️", "🌟", "👾", "🦊", "🐼", "🍎", "💻"];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IN', name: 'India' },
    { code: 'ES', name: 'Spain' },
    { code: 'BR', name: 'Brazil' },
    { code: 'JP', name: 'Japan' }
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'JA', name: 'Japanese' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedError('');
    setIsSaved(false);

    if (!name || !username) {
      setIsSavedError('Name and Username are required fields.');
      return;
    }

    const updated = {
      ...profile,
      name,
      username,
      avatar,
      country,
      language
    };
    saveProfile(updated);
    onUpdateProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please enter both password fields.');
      return;
    }

    const pStrength = checkPasswordStrength(newPassword);
    if (pStrength.strength === 'Weak') {
      setPasswordError('Password is too weak. Please verify password requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      // Get users database from localStorage
      const usersData = localStorage.getItem("typepulse_users_db");
      if (usersData && profile.email) {
        const db = JSON.parse(usersData);
        const user = db[profile.email.toLowerCase().trim()];
        if (user) {
          const hash = await hashPassword(newPassword);
          user.passwordHash = hash;
          db[profile.email.toLowerCase().trim()] = user;
          localStorage.setItem("typepulse_users_db", JSON.stringify(db));
          
          setPasswordMsg('Password changed successfully!');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordError('Active account details not found in database.');
        }
      } else {
        setPasswordError('Guest profiles cannot update password records.');
      }
    } catch {
      setPasswordError('An error occurred updating account credentials.');
    }
  };

  const handleFontSizeChange = (size: number) => {
    const updated = { ...settings, fontSize: size };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleFontTypeChange = (type: 'mono' | 'sans') => {
    const updated = { ...settings, fontType: type };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    const updated = { ...settings, theme };
    saveSettings(updated);
    onUpdateSettings(updated);

    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to delete all typing runs, unlocked levels, and achievements? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const pStrength = checkPasswordStrength(newPassword);
  const getStrengthBarColor = () => {
    if (!newPassword) return 'rgba(255,255,255,0.05)';
    if (pStrength.strength === 'Strong') return 'var(--success)';
    if (pStrength.strength === 'Medium') return '#eab308';
    return 'var(--error)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 20px', gap: '30px', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Preferences & Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Customize your profile, configure UI preferences, modify account security, and control notifications.
        </p>
      </div>

      {/* Success alert */}
      {isSaved && (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          ✓ Profile details updated successfully!
        </div>
      )}

      {/* Error alert */}
      {isSavedError && (
        <div style={{
          background: 'var(--error-bg)',
          border: '1px solid var(--error)',
          color: 'var(--error)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          ⚠️ {isSavedError}
        </div>
      )}

      {/* 1. Profile customization form */}
      <div className="card-glass" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '20px' }}>Profile Settings</h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email row (Disabled) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>EMAIL ADDRESS (READ-ONLY)</label>
            <input
              type="text"
              value={profile.email || 'guest@typepulse.local'}
              disabled
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'not-allowed'
              }}
            />
          </div>

          {/* Full Name & Username */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Country & Language dropdowns */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>COUNTRY</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {countries.map(c => <option key={c.code} value={c.code} style={{ background: '#111827' }}>{c.name}</option>)}
              </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>LANGUAGE</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {languages.map(l => <option key={l.code} value={l.code} style={{ background: '#111827' }}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Choose Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CHOOSE AVATAR PICTURE</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  style={{
                    fontSize: '22px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: avatar === av ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                    border: avatar === av ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="hover-glow"
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '180px', justifyContent: 'center', marginTop: '10px' }}>
            💾 Save Profile Details
          </button>
        </form>
      </div>

      {/* 2. Security Change Password Form */}
      <div className="card-glass" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--accent)', marginBottom: '15px' }}>Security Settings</h3>
        
        {passwordMsg && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '15px', fontWeight: 600 }}>
            {passwordMsg}
          </div>
        )}

        {passwordError && (
          <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '15px', fontWeight: 600 }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>NEW PASSWORD</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password strength checklist */}
          {newPassword && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-muted)' }}>New Password Strength:</span>
                <span style={{ color: getStrengthBarColor() }}>{pStrength.strength}</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: pStrength.strength === 'Strong' ? '100%' : pStrength.strength === 'Medium' ? '60%' : '25%',
                  background: getStrengthBarColor(),
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 15px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <div style={{ color: pStrength.hasMinLength ? 'var(--success)' : 'inherit' }}>{pStrength.hasMinLength ? '✓' : '✗'} Min 8 chars</div>
                <div style={{ color: pStrength.hasUpper ? 'var(--success)' : 'inherit' }}>{pStrength.hasUpper ? '✓' : '✗'} 1 Uppercase</div>
                <div style={{ color: pStrength.hasLower ? 'var(--success)' : 'inherit' }}>{pStrength.hasLower ? '✓' : '✗'} 1 Lowercase</div>
                <div style={{ color: pStrength.hasNumber ? 'var(--success)' : 'inherit' }}>{pStrength.hasNumber ? '✓' : '✗'} 1 Number</div>
                <div style={{ color: pStrength.hasSpecial ? 'var(--success)' : 'inherit' }}>{pStrength.hasSpecial ? '✓' : '✗'} 1 Special Char</div>
              </div>
            </div>
          )}

          <button type="submit" className="btn-secondary" style={{ width: '160px', justifyContent: 'center' }}>
            🔒 Reset Password
          </button>
        </form>
      </div>

      {/* 3. Platform & Notification preferences card */}
      <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--success)' }}>Notification & Preference Toggles</h3>

        {/* Checkbox notifications settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={emailSummary}
              onChange={(e) => setEmailSummary(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span>Receive weekly speed practice summary emails</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={streakAlerts}
              onChange={(e) => setStreakAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <span>Enable daily streak practice reminders</span>
          </label>
        </div>

        <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>

        {/* Font size adjustments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TYPING ARENA FONT SIZE</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[14, 18, 22, 26].map(sz => (
              <button
                key={sz}
                onClick={() => handleFontSizeChange(sz)}
                style={{
                  flex: 1,
                  background: settings.fontSize === sz ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
                  border: settings.fontSize === sz ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  color: settings.fontSize === sz ? 'var(--primary)' : 'var(--text-primary)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        {/* Font style selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>FONT TYPOGRAPHY FAMILY</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleFontTypeChange('mono')}
              style={{
                flex: 1,
                background: settings.fontType === 'mono' ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
                border: settings.fontType === 'mono' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                color: settings.fontType === 'mono' ? 'var(--primary)' : 'var(--text-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              JetBrains Monospace
            </button>
            <button
              onClick={() => handleFontTypeChange('sans')}
              style={{
                flex: 1,
                background: settings.fontType === 'sans' ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
                border: settings.fontType === 'sans' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                color: settings.fontType === 'sans' ? 'var(--primary)' : 'var(--text-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600
              }}
            >
              Outfit Sans
            </button>
          </div>
        </div>

        {/* Theme mode toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>THEME MODE</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: 1,
                background: settings.theme === 'dark' ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
                border: settings.theme === 'dark' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                color: settings.theme === 'dark' ? 'var(--primary)' : 'var(--text-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ☀️ Sleek Dark Theme
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              style={{
                flex: 1,
                background: settings.theme === 'light' ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
                border: settings.theme === 'light' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                color: settings.theme === 'light' ? 'var(--primary)' : 'var(--text-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🌙 Minimal Light Theme
            </button>
          </div>
        </div>

      </div>

      {/* 4. Danger Zone */}
      <div className="card-glass" style={{ padding: '30px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--error)', marginBottom: '10px' }}>Danger Zone</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
          This will wipe all historical tests, progress states, streaks, and certificates stored in your browser's local cache.
        </p>
        <button onClick={handleResetData} className="btn-secondary" style={{
          borderColor: 'var(--error)',
          color: 'var(--error)',
          background: 'transparent'
        }}>
          ⚠️ Reset Platform Progress
        </button>
      </div>

    </div>
  );
};
