import React from 'react';

export const About: React.FC = () => {
  const milestones = [
    { num: '30+', label: 'Curriculum Lessons', desc: 'Step-by-step hand guidance' },
    { num: '99%', label: 'Target Precision', desc: 'Accuracy-focused loops' },
    { num: '24/7', label: 'Analytics Tracking', desc: 'Continuous metrics logging' }
  ];

  return (
    <div style={{ padding: '60px 20px', maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Hero Headline */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{
          alignSelf: 'center',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          💡 Keyboarding Science
        </div>
        <h1 style={{ fontSize: '42px', lineHeight: '1.2', background: 'linear-gradient(135deg, #fff 40%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          About TypeLearner AI
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto' }}>
          TypeLearner AI combines neuro-motor muscle training with real-time feedback systems to accelerate typing speed and build lasting keying accuracy.
        </p>
      </div>

      {/* Grid of stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {milestones.map((m) => (
          <div key={m.label} className="card-glass" style={{ padding: '25px', textAlign: 'center', background: 'var(--glass-bg)' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)', marginBottom: '5px' }}>{m.num}</div>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>{m.label}</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.desc}</span>
          </div>
        ))}
      </div>

      {/* Science of typing section */}
      <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--accent)' }}>Why Typing Precision Matters</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7' }}>
          Most keyboard users cap at 45 WPM because they read and type on an ad-hoc key-search loop. Touch typing relies on motor templates where visual references are removed entirely. By structuring training from isolated home keys to row-jumping, muscle memory automates physical triggers.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          Our tracking system monitors individual key speeds and target mistakes, allowing the curriculum algorithms to generate customized drills specifically targeting your slowest key jumps.
        </p>
      </div>

    </div>
  );
};
