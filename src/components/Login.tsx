import React, { useState, useEffect } from 'react';
import { login, socialLogin } from '../utils/auth';

interface LoginProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: (profile: any) => void;
  onNavigateToVerify: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onLoginSuccess,
  onNavigateToVerify
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Real-time validations
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time email validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    if (emailError) {
      setFormError('Please resolve email format errors before logging in.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success && res.profile) {
        onLoginSuccess(res.profile);
      } else {
        setFormError(res.message);
        // If not verified, redirect to verification page
        if (res.message.includes("verify your email")) {
          setTimeout(() => {
            onNavigateToVerify(email);
          }, 1500);
        }
      }
    } catch (err: any) {
      setFormError('An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'microsoft') => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Welcome Back
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Continue your typing journey and improve your speed.
        </p>
      </div>

      {/* Error alert */}
      {formError && (
        <div style={{
          background: formError.includes('Welcome') ? 'var(--success-bg)' : 'var(--error-bg)',
          border: `1px solid ${formError.includes('Welcome') ? 'var(--success)' : 'var(--error)'}`,
          color: formError.includes('Welcome') ? 'var(--success)' : 'var(--error)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          animation: 'shake 0.3s ease'
        }}>
          {formError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Email Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: emailError ? '1px solid var(--error)' : '1px solid var(--glass-border)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition-smooth)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
            }}
            className="hover-glow"
          />
          {emailError && (
            <span style={{ fontSize: '11px', color: 'var(--error)', fontWeight: 600, marginTop: '2px' }}>
              ⚠️ {emailError}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Password
            </label>
            <span
              onClick={onNavigateToForgotPassword}
              style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            >
              Forgot Password?
            </span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--glass-border)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition-smooth)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
            }}
            className="hover-glow"
          />
        </div>

        {/* Remember Me */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '13px', color: 'var(--text-primary)' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            style={{
              width: '16px',
              height: '16px',
              accentColor: 'var(--primary)',
              cursor: 'pointer'
            }}
          />
          <span>Remember me on this device</span>
        </label>

        {/* Login Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '46px',
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: 700,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid var(--text-dark)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'rotate-spin 0.6s linear infinite' }}></div>
              <span>Signing In...</span>
            </div>
          ) : (
            "🔑 Sign In"
          )}
        </button>

      </form>

      {/* Social Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>OR CONTINUE WITH</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
      </div>

      {/* Social Logins */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Google */}
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
          className="btn-secondary hover-glow"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '16px' }}>🌐</span>
          <span>Google</span>
        </button>

        {/* GitHub */}
        <button
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading}
          className="btn-secondary hover-glow"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '16px' }}>🐙</span>
          <span>GitHub</span>
        </button>

        {/* Microsoft */}
        <button
          onClick={() => handleSocialLogin('microsoft')}
          disabled={isLoading}
          className="btn-secondary hover-glow"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '16px' }}>💻</span>
          <span>Microsoft</span>
        </button>
      </div>

      {/* Register Redirect footer */}
      <div style={{ textAlign: 'center', fontSize: '14px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px', marginTop: '10px' }}>
        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
        <span
          onClick={onNavigateToSignUp}
          style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign Up
        </span>
      </div>

    </div>
  );
};
