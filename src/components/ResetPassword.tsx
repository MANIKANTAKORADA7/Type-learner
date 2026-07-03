import React, { useState, useEffect } from 'react';
import { resetPassword, checkPasswordStrength, hashPassword } from '../utils/auth';

interface ResetPasswordProps {
  email: string;
  onResetSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  onResetSuccess,
  onNavigateToLogin
}) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation States
  const [confirmError, setConfirmError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError('');
    }
  }, [newPassword, confirmPassword]);

  const pStrength = checkPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (pStrength.strength === 'Weak') {
      setErrorMsg('Password does not meet minimum strength requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const passwordHashValue = await hashPassword(newPassword);
      const res = await resetPassword(email, code, passwordHashValue);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onResetSuccess();
        }, 2000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthBarColor = () => {
    if (!newPassword) return 'rgba(255,255,255,0.05)';
    if (pStrength.strength === 'Strong') return 'var(--success)';
    if (pStrength.strength === 'Medium') return '#eab308';
    return 'var(--error)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>🔄</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px', marginBottom: '6px' }}>
          Reset Password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Please enter the reset code sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> and configure your new password.
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
        
        {/* Reset Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
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

        {/* New Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
              transition: 'var(--transition-smooth)'
            }}
            className="hover-glow"
          />
        </div>

        {/* Confirm New Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: confirmError ? '1px solid var(--error)' : '1px solid var(--glass-border)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            className="hover-glow"
          />
          {confirmError && <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 600 }}>⚠️ {confirmError}</span>}
        </div>

        {/* Password strength checklist */}
        {newPassword && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <div style={{ color: pStrength.hasMinLength ? 'var(--success)' : 'inherit' }}>{pStrength.hasMinLength ? '✓' : '✗'} Min 8 chars</div>
              <div style={{ color: pStrength.hasUpper ? 'var(--success)' : 'inherit' }}>{pStrength.hasUpper ? '✓' : '✗'} 1 Uppercase</div>
              <div style={{ color: pStrength.hasLower ? 'var(--success)' : 'inherit' }}>{pStrength.hasLower ? '✓' : '✗'} 1 Lowercase</div>
              <div style={{ color: pStrength.hasNumber ? 'var(--success)' : 'inherit' }}>{pStrength.hasNumber ? '✓' : '✗'} 1 Number</div>
              <div style={{ color: pStrength.hasSpecial ? 'var(--success)' : 'inherit' }}>{pStrength.hasSpecial ? '✓' : '✗'} 1 Special Char</div>
            </div>
          </div>
        )}

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
          {isLoading ? "Saving password..." : "✓ Reset Password"}
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
