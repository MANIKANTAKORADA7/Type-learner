import React, { useEffect, useState } from 'react';
import { type UserProfile, loadHistory } from '../utils/db';

interface HomeProps {
  onStartLearning: () => void;
  onStartSpeedTest: () => void;
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onStartLearning,
  onStartSpeedTest,
  profile,
  isAuthenticated
}) => {
  const [particles, setParticles] = useState<{ id: number; char: string; left: number; delay: number; duration: number }[]>([]);
  const [demoText, setDemoText] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const fullDemo = "learn typing from beginner to pro level with typelearner ai!";

  // Generate floating character particles in the background (used for landing page)
  useEffect(() => {
    if (!isAuthenticated) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
      const generated = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        char: chars[Math.floor(Math.random() * chars.length)],
        left: Math.random() * 95,
        delay: Math.random() * 15,
        duration: 10 + Math.random() * 15
      }));
      setParticles(generated);
    }
  }, [isAuthenticated]);

  // Self-typing simulation on the hero screen
  useEffect(() => {
    if (!isAuthenticated) {
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
    }
  }, [isAuthenticated]);

  const isKeyActive = (key: string) => {
    if (!activeKey) return false;
    if (key === 'SPACE' && activeKey === ' ') return true;
    return activeKey === key;
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    ['SPACE']
  ];

  // Compute stats for authenticated user
  const getPracticedMinutesToday = () => {
    if (!isAuthenticated) return 0;
    try {
      const history = loadHistory();
      const today = new Date().toLocaleDateString();
      const secondsToday = history
        .filter(s => new Date(s.timestamp).toLocaleDateString() === today)
        .reduce((sum, s) => sum + s.duration, 0);
      return Math.round(secondsToday / 60);
    } catch {
      return 0;
    }
  };

  const minutesPracticed = getPracticedMinutesToday();
  const dailyGoal = profile?.dailyGoalMinutes || 20;
  const goalProgress = Math.min((minutesPracticed / dailyGoal) * 100, 100);

  // 1. GUEST LANDING PAGE VIEW
  if (!isAuthenticated || !profile) {
    return (
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Floating background chars */}
        <div className="floating-elements">
          {particles.map((p) => (
            <span
              key={p.id}
              className="floating-char"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            >
              {p.char}
            </span>
          ))}
        </div>

        {/* Main hero card */}
        <div className="card-glass" style={{
          maxWidth: '900px',
          width: '100%',
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          position: 'relative',
          zIndex: 2
        }}>
          
          {/* Animated Badge */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '6px 16px',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 0 15px var(--accent-glow)',
            animation: 'scalePop 1s ease infinite alternate'
          }}>
            ✨ Next-Gen Typing Coach
          </div>

          {/* Large Heading */}
          <h1 style={{
            fontSize: '48px',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #fff 30%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            Master Typing From A <br/>
            <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Beginner</span> To A <span style={{ color: 'var(--accent)', WebkitTextFillColor: 'initial' }}>Professional</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            lineHeight: '1.6'
          }}>
            Interactive levels, real-time feedback, detailed performance metrics, progress charts, and mechanical feedback. Learn core finger placements and accelerate your typing speed.
          </p>

          {/* Live typing demo placeholder */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '18px',
            color: 'var(--primary)',
            width: '80%',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
          }}>
            <span>{demoText}</span>
            <span className="cursor-blink" style={{ height: '22px', width: '2px' }}>|</span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button onClick={onStartLearning} className="btn-primary">
              🚀 Start Learning
            </button>
            <button onClick={onStartSpeedTest} className="btn-secondary">
              ⏱️ Try Speed Test
            </button>
          </div>

          {/* Mini interactive keyboard */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '20px'
          }}>
            {keyboardRows.map((row, rIdx) => (
              <div key={rIdx} style={{
                display: 'flex',
                gap: '6px',
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
                        height: '42px',
                        width: isSpace ? '250px' : '42px',
                        fontSize: '12px',
                        backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                        color: isActive ? 'var(--text-dark)' : 'var(--text-muted)'
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
      </div>
    );
  }

  // 2. AUTHENTICATED USER DASHBOARD VIEW
  return (
    <div style={{
      maxWidth: '1000px',
      width: '100%',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    }}>
      
      {/* Welcome Banner */}
      <div className="card-glass" style={{
        padding: '40px 30px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(9, 9, 11, 0.9) 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px',
        border: '1px solid var(--glass-border)'
      }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
            Welcome back, {profile.name || profile.username} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Current Typing Level: <strong style={{ color: 'var(--accent)' }}>{profile.typingLevel?.toUpperCase() || 'BEGINNER'}</strong> • Focus Goal: <strong style={{ color: 'var(--primary)' }}>{profile.goal}</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button onClick={onStartLearning} className="btn-primary">
              🛣️ Continue Learning
            </button>
            <button onClick={onStartSpeedTest} className="btn-secondary">
              ⏱️ Start Typing Test
            </button>
          </div>
        </div>

        {/* Quick Speed Stats */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {[
            { label: 'Best WPM', value: profile.bestWpm ? `${profile.bestWpm} WPM` : '--', color: 'var(--primary)' },
            { label: 'Average WPM', value: profile.averageWpm ? `${profile.averageWpm} WPM` : '--', color: 'var(--accent)' },
            { label: 'Accuracy', value: profile.accuracy ? `${profile.accuracy}%` : '--', color: 'var(--success)' }
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '15px 20px',
              minWidth: '130px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
        
        {/* Practice goals and streaks */}
        <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)' }}>Daily Practice Target</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🔥</span>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>DAILY STREAK</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{profile.dailyStreak} Days Active</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>⏱️</span>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TODAY'S GOAL</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{minutesPracticed} / {dailyGoal} min</div>
              </div>
            </div>
          </div>

          {/* Goal Progress meter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-muted)' }}>Daily target completed</span>
              <span style={{ color: 'var(--success)' }}>{Math.round(goalProgress)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${goalProgress}%`,
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--success) 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Milestone Levels */}
        <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--primary)' }}>Typing Roadmap Milestones</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>ROADMAP RANK</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{profile.rank}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🛣️</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLETED LESSONS</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{profile.completedLessons || 0} Levels</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🪙</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>COINS ACCOUNT</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>{profile.coins} Coins</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>⭐</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>PROFILE LEVEL</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>Level {profile.level}</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
