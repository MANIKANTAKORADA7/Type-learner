import React, { useState } from 'react';
import { forgotPassword } from '../utils/auth';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
  onNavigateToReset: (email: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onNavigateToLogin,
  onNavigateToReset
}) => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMsg(res.message);
        


        // Navigate automatically after short delay
        setTimeout(() => {
          onNavigateToReset(email);
        }, 3500);

      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Failed to process forgot password request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>🔒</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px', marginBottom: '6px' }}>
          Forgot Password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Enter your registered email address below, and we'll send you a password reset code.
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '5px' }}>
          (For prototype testing, retrieve your reset code from the browser's developer console logs.)
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Email */}
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
              border: '1px solid var(--glass-border)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            className="hover-glow"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '44px',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Sending Code..." : "✉️ Send Reset Code"}
        </button>

      </form>

      {/* Redirect back to Login */}
      <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
        <span
          onClick={onNavigateToLogin}
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
        >
          Back to Sign In
        </span>
      </div>

    </div>
  );
};
