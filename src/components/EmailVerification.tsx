import React, { useState, useEffect, useRef } from 'react';
import { verifyEmailCode, resendVerificationCode } from '../utils/auth';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: (profile: any) => void;
  onNavigateToLogin: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onNavigateToLogin
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Reference for inputs to support auto-tabbing
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleInputChange = (value: string, index: number) => {
    const newCode = [...code];
    // Take only the last character entered
    newCode[index] = value.slice(-1).replace(/[^0-9]/g, '');
    setCode(newCode);
    setErrorMsg('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Backspace: clear current or go back
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6).replace(/[^0-9]/g, '');
    if (pasteData.length === 6) {
      const newCode = pasteData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyEmailCode(email, fullCode);
      if (res.success && res.profile) {
        setSuccessMsg('Email verified successfully! Loading profile...');
        setTimeout(() => {
          onVerificationSuccess(res.profile);
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await resendVerificationCode(email);
      if (res.success) {
        setResendTimer(30);

      }
    } catch (err) {
      setErrorMsg('Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>✉️</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px', marginBottom: '6px' }}>
          Verify Your Email
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          We've sent a 6-digit verification code to <br />
          <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '5px' }}>
          (For prototype testing, retrieve your code from the browser's developer console logs.)
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
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Digits Grid */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el as HTMLInputElement; }}
              type="text"
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              maxLength={1}
              disabled={isLoading}
              style={{
                width: '46px',
                height: '52px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: 'center',
                outline: 'none',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.6)',
                transition: 'var(--transition-smooth)'
              }}
              className="hover-glow"
            />
          ))}
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
          {isLoading ? "Verifying..." : "✓ Confirm Code"}
        </button>

      </form>

      {/* Resend actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Didn't receive the code? </span>
          <span
            onClick={handleResend}
            style={{
              color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
              fontWeight: 700,
              cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
              textDecoration: resendTimer > 0 ? 'none' : 'underline'
            }}
          >
            {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
          </span>
        </div>

        <span
          onClick={onNavigateToLogin}
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', marginTop: '5px' }}
        >
          Back to Sign In
        </span>
      </div>

    </div>
  );
};
