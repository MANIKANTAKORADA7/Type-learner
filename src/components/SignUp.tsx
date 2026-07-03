import React, { useState, useEffect } from 'react';
import { signUp, checkPasswordStrength, socialLogin } from '../utils/auth';

interface SignUpProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: (email: string) => void;
  onLoginSuccess: (profile: any) => void;
}

export const SignUp: React.FC<SignUpProps> = ({
  onNavigateToLogin,
  onSignUpSuccess,
  onLoginSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [language, setLanguage] = useState('EN');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Real-time validations
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError('');
    }
  }, [password, confirmPassword]);

  const pStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (emailError) {
      setFormError('Please enter a valid email.');
      return;
    }

    if (pStrength.strength === 'Weak') {
      setFormError('Password is too weak. Please see requirements below.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setFormError('You must agree to the Terms & Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp(fullName, email, password, username, country, language);
      if (res.success && res.email) {
        onSignUpSuccess(res.email);
      } else {
        setFormError(res.message);
      }
    } catch (err) {
      setFormError('An unexpected registration error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setFormError('');
    try {
      const res = await socialLogin(provider);
      if (res.success) {
        onLoginSuccess(res.profile);
      }
    } catch (err: any) {
      setFormError(`Failed to authenticate with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (!password) return 'rgba(255,255,255,0.05)';
    if (pStrength.strength === 'Strong') return 'var(--success)';
    if (pStrength.strength === 'Medium') return '#eab308'; // Amber/Yellow
    return 'var(--error)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Create Account
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Start tracking your typing speed and accuracy.
        </p>
      </div>

      {/* Form Error Alert */}
      {formError && (
        <div style={{
          background: 'var(--error-bg)',
          border: '1px solid var(--error)',
          color: 'var(--error)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'center',
          animation: 'shake 0.3s ease'
        }}>
          {formError}
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Name and Username row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
              className="hover-glow"
            />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe123"
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
              className="hover-glow"
            />
          </div>
        </div>

        {/* Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={isLoading}
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: emailError ? '1px solid var(--error)' : '1px solid var(--glass-border)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
            className="hover-glow"
          />
          {emailError && <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 600 }}>⚠️ {emailError}</span>}
        </div>

        {/* Passwords row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
              className="hover-glow"
            />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirm *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: confirmError ? '1px solid var(--error)' : '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
              className="hover-glow"
            />
          </div>
        </div>

        {confirmError && <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 600, marginTop: '-5px' }}>⚠️ {confirmError}</span>}

        {/* Password strength visualizer */}
        {password && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
              <span style={{ color: getStrengthBarColor() }}>{pStrength.strength}</span>
            </div>
            
            {/* Strength Bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: pStrength.strength === 'Strong' ? '100%' : pStrength.strength === 'Medium' ? '60%' : '25%',
                background: getStrengthBarColor(),
                transition: 'width 0.3s ease'
              }}></div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <div style={{ color: pStrength.hasMinLength ? 'var(--success)' : 'inherit' }}>{pStrength.hasMinLength ? '✓' : '✗'} Min 8 chars</div>
              <div style={{ color: pStrength.hasUpper ? 'var(--success)' : 'inherit' }}>{pStrength.hasUpper ? '✓' : '✗'} 1 Uppercase</div>
              <div style={{ color: pStrength.hasLower ? 'var(--success)' : 'inherit' }}>{pStrength.hasLower ? '✓' : '✗'} 1 Lowercase</div>
              <div style={{ color: pStrength.hasNumber ? 'var(--success)' : 'inherit' }}>{pStrength.hasNumber ? '✓' : '✗'} 1 Number</div>
              <div style={{ color: pStrength.hasSpecial ? 'var(--success)' : 'inherit' }}>{pStrength.hasSpecial ? '✓' : '✗'} 1 Special Char</div>
            </div>
          </div>
        )}

        {/* Country & Language Row */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {countries.map(c => <option key={c.code} value={c.code} style={{ background: '#111827' }}>{c.name}</option>)}
            </select>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {languages.map(l => <option key={l.code} value={l.code} style={{ background: '#111827' }}>{l.name}</option>)}
            </select>
          </div>
        </div>

        {/* Agree terms */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            disabled={isLoading}
            style={{
              width: '16px',
              height: '16px',
              accentColor: 'var(--primary)',
              cursor: 'pointer'
            }}
          />
          <span>I agree to the Terms & Conditions</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '42px',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '5px'
          }}
        >
          {isLoading ? "Creating Account..." : "✨ Create Account"}
        </button>

      </form>

      {/* Social Register */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>OR SIGN UP WITH</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="btn-secondary" style={{ justifyContent: 'center', height: '38px', fontSize: '12px', gap: '6px' }}>
          <span>🌐</span> Google
        </button>
        <button onClick={() => handleSocialLogin('github')} disabled={isLoading} className="btn-secondary" style={{ justifyContent: 'center', height: '38px', fontSize: '12px', gap: '6px' }}>
          <span>🐙</span> GitHub
        </button>
      </div>

      {/* Direct Login footer */}
      <div style={{ textAlign: 'center', fontSize: '13px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
        <span
          onClick={onNavigateToLogin}
          style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign In
        </span>
      </div>

    </div>
  );
};
