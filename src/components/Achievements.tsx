import React, { useEffect, useState } from 'react';
import { loadAchievements, type Achievement } from '../utils/db';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(loadAchievements());
  }, []);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 20px', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Page headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Achievements & Milestones</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track your milestones, typing goals, precision levels, and challenge completions.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 214, 10, 0.1)',
          border: '1px solid var(--primary)',
          color: 'var(--primary)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '14px'
        }}>
          🏆 UNLOCKED: {totalUnlocked} / {achievements.length}
        </div>
      </div>

      {/* Grid containing achievement cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }}>
        {achievements.map((ach) => {
          const progressPercent = Math.min((ach.progress / ach.target) * 100, 100);
          return (
            <div
              key={ach.id}
              className="card-glass"
              style={{
                padding: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                opacity: ach.unlocked ? 1 : 0.65,
                border: ach.unlocked ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                boxShadow: ach.unlocked ? '0 4px 20px var(--primary-glow)' : 'none'
              }}
            >
              {/* Badge Icon */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: ach.unlocked ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: ach.unlocked ? '0 0 15px var(--primary-glow)' : 'none',
                color: ach.unlocked ? 'var(--text-dark)' : 'var(--text-muted)',
                flexShrink: 0
              }}>
                {ach.icon}
              </div>

              {/* Detail texts */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', color: ach.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{ach.title}</h3>
                  {ach.unlocked && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>✓ COMPLETED</span>}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ach.description}</p>
                
                {/* Progress bar metrics */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Progress:</span>
                    <span>{Math.round(ach.progress)} / {ach.target}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginTop: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: ach.unlocked ? 'var(--primary)' : 'var(--accent)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>

                {ach.unlocked && ach.unlockedAt && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
