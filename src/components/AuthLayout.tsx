import React, { useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = "Welcome Back",
  subtitle = "Continue your typing journey and improve your speed every day."
}) => {
  const [particles, setParticles] = useState<{ id: number; char: string; left: number; delay: number; duration: number; size: number }[]>([]);
  const [demoText, setDemoText] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const fullDemo = "unlock your true typing speed with typelearner ai!";

  // Generate floating character and number particles
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      left: Math.random() * 90 + 5,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 14 + Math.random() * 24
    }));
    setParticles(generated);
  }, []);

  // Self-typing loop for the animated keyboard
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullDemo.length) {
        const char = fullDemo[index];
        setDemoText((prev) => prev + char);
        setActiveKey(char.toUpperCase());
        index++;
      } else {
        setTimeout(() => {
          setDemoText("");
          setActiveKey(null);
          index = 0;
        }, 3000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    ['SPACE']
  ];

  const isKeyActive = (key: string) => {
    if (!activeKey) return false;
    if (key === 'SPACE' && activeKey === ' ') return true;
    return activeKey === key;
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 150px)',
      width: '100%',
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '0 20px',
      gap: '20px',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* LEFT SIDE: Animations and welcome messages */}
      <div className="card-glass auth-left-side-container" style={{
        flex: 1,
        display: 'none', // hidden on small screens
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 30px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(9, 9, 11, 0.8) 100%)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '20px',
      }}>
        
        {/* Floating elements inside left panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {particles.map((p) => (
            <span
              key={p.id}
              className="floating-char"
              style={{
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                color: 'rgba(255, 214, 10, 0.04)',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {p.char}
            </span>
          ))}
        </div>

        {/* Content Box */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '25px'
        }}>
          <div style={{
            background: 'rgba(255, 214, 10, 0.1)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            padding: '5px 15px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 0 10px var(--primary-glow)'
          }}>
            ⚡ Learn & Elevate
          </div>

          <h2 style={{
            fontSize: '36px',
            lineHeight: '1.2',
            background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            {title}
          </h2>

          <p style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: '1.6'
          }}>
            {subtitle}
          </p>

          {/* Typing Demo Screen */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            color: 'var(--accent)',
            width: '90%',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
            marginTop: '10px'
          }}>
            <span>{demoText}</span>
            <span className="cursor-blink" style={{ height: '18px', width: '2px' }}>|</span>
          </div>

          {/* Animated Interactive Keyboard */}
          <div style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '15px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '15px'
          }}>
            {keyboardRows.map((row, rIdx) => (
              <div key={rIdx} style={{
                display: 'flex',
                gap: '5px',
                justifyContent: 'center'
              }}>
                {row.map((key) => {
                  const isActive = isKeyActive(key);
                  const isSpace = key === 'SPACE';
                  return (
                    <div
                      key={key}
                      className={`keyboard-key ${isActive ? 'active' : ''}`}
                      style={{
                        height: '32px',
                        width: isSpace ? '180px' : '32px',
                        fontSize: '9px',
                        backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                        color: isActive ? 'var(--text-dark)' : 'rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.1s ease',
                        border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      {isSpace ? 'Space' : key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* CSS rule override for desktop show */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 850px) {
            .auth-left-side-container {
              display: flex !important;
            }
          }
          .auth-form-card {
            border-radius: 20px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: var(--glass-shadow);
          }
        `}} />

      </div>

      {/* RIGHT SIDE: Authentication child cards */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <div className="card-glass auth-form-card" style={{
          width: '100%',
          maxWidth: '500px',
          padding: '40px 30px',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
