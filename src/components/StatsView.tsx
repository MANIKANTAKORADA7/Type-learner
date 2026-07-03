import React, { useEffect, useRef, useState } from 'react';
import { loadHistory, loadProfile, loadCompletedLessonsMap, type TypingSession, type UserProfile } from '../utils/db';
import { type SessionSnapshot } from '../types/typing';

interface StatsViewProps {
  sessionResult?: {
    wpm: number;
    accuracy: number;
    mistakes: number;
    wordsTyped: number;
    duration: number;
    mode: string;
    historySnapshot: SessionSnapshot[];
  } | null;
  onClearSession: () => void;
  onNavigateToLearn: () => void;
}

interface ChapterConfig {
  id: number;
  title: string;
  start: number;
  end: number;
  icon: string;
}

const CHAPTERS: ChapterConfig[] = [
  { id: 1, title: "Getting Started", start: 1, end: 20, icon: "🌱" },
  { id: 2, title: "Home Row Mastery", start: 21, end: 60, icon: "🏠" },
  { id: 3, title: "Top Row", start: 61, end: 140, icon: "🪜" },
  { id: 4, title: "Bottom Row", start: 141, end: 220, icon: "⛰️" },
  { id: 5, title: "Complete Alphabet", start: 221, end: 280, icon: "📖" },
  { id: 6, title: "Capital Letters", start: 281, end: 340, icon: "👑" },
  { id: 7, title: "Numbers Row", start: 341, end: 420, icon: "🔢" },
  { id: 8, title: "Symbols & Punctuation", start: 421, end: 500, icon: "🎨" },
  { id: 9, title: "Word Mastery", start: 501, end: 560, icon: "📚" },
  { id: 10, title: "Sentence Mastery", start: 561, end: 620, icon: "💬" },
  { id: 11, title: "Paragraph Drills", start: 621, end: 660, icon: "📝" },
  { id: 12, title: "Professional Technical", start: 661, end: 700, icon: "💻" }
];

export const StatsView: React.FC<StatsViewProps> = ({
  sessionResult,
  onClearSession,
  onNavigateToLearn
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<TypingSession[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<number, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setHistory(loadHistory());
    setCompletedMap(loadCompletedLessonsMap());
  }, [sessionResult]);

  // Aggregate stats
  const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
  const avgWpm = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.wpm, 0) / history.length) : 0;
  const avgAccuracy = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length) : 100;
  
  const completedLessonsCount = Object.keys(completedMap).length;

  // Grade calculation
  const getGrade = (wpm: number, accuracy: number) => {
    if (wpm >= 80 && accuracy >= 98) return { label: "A+", color: "#ffd60a", desc: "Supreme Typist!" };
    if (wpm >= 60 && accuracy >= 95) return { label: "A", color: "#10b981", desc: "Excellent Speed & Precision" };
    if (wpm >= 40 && accuracy >= 90) return { label: "B", color: "#38bdf8", desc: "Solid Typist" };
    if (wpm >= 25 && accuracy >= 80) return { label: "C", color: "#a855f7", desc: "Developing Rhythm" };
    return { label: "D", color: "#ef4444", desc: "Keep Practicing!" };
  };

  // Generate certificate on canvas
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Outer Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 500);

    // Inner border double lines
    ctx.strokeStyle = '#ffd60a';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 760, 460);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 740, 440);

    // Watermark circle
    ctx.fillStyle = 'rgba(255, 214, 10, 0.02)';
    ctx.beginPath();
    ctx.arc(400, 250, 150, 0, Math.PI * 2);
    ctx.fill();

    // Headers
    ctx.font = 'bold 32px "Outfit"';
    ctx.fillStyle = '#ffd60a';
    ctx.textAlign = 'center';
    ctx.fillText('PROFESSIONAL TYPING CERTIFICATE', 400, 90);

    ctx.font = 'italic 16px "Outfit"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('This certificate is proudly awarded to', 400, 140);

    // User Name
    ctx.font = 'bold 42px "Outfit"';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(profile?.username || 'Typist Pioneer', 400, 200);

    // Description text
    ctx.font = '16px "Outfit"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('for successfully mastering structural keyboarding mechanics and graduating', 400, 250);

    // Typing speed details
    ctx.font = 'bold 28px "Outfit"';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Rank: ${profile?.rank || 'Skilled'} - Best Speed ${bestWpm || 45} WPM`, 400, 300);

    ctx.font = '14px "Outfit"';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Certified globally by TypeLearner AI platform curriculum', 400, 340);

    // Decorative seal
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.arc(400, 400, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px "Outfit"';
    ctx.fillText('GRADUATE', 400, 404);

    // Date
    ctx.font = '14px "Outfit"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Awarded on ${new Date().toLocaleDateString()}`, 130, 420);
    
    // Signature
    ctx.fillText('Platform Signature', 670, 420);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(590, 400);
    ctx.lineTo(750, 400);
    ctx.stroke();
  };

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `typelearner-pro-certificate-${profile?.username || 'user'}.png`;
    link.href = url;
    link.click();
  };

  // Render SVG Line Chart (Dual lines: Yellow = Net WPM, Blue = Raw WPM)
  const renderLineChart = (data: SessionSnapshot[]) => {
    if (data.length === 0) return null;

    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxWpm = Math.max(...data.map(d => Math.max(d.netWpm, d.rawWpm)), 60);
    const maxSec = data.length;

    const getX = (sec: number) => {
      return ((sec - 1) / (maxSec - 1 || 1)) * (width - paddingLeft - paddingRight) + paddingLeft;
    };

    const getY = (w: number) => {
      return height - ((w / maxWpm) * (height - paddingTop - paddingBottom) + paddingBottom);
    };

    // Net WPM Path
    let netPath = "";
    // Raw WPM Path
    let rawPath = "";

    data.forEach((d, idx) => {
      const x = getX(d.second);
      const netY = getY(d.netWpm);
      const rawY = getY(d.rawWpm);

      if (idx === 0) {
        netPath += `M ${x} ${netY}`;
        rawPath += `M ${x} ${rawY}`;
      } else {
        netPath += ` L ${x} ${netY}`;
        rawPath += ` L ${x} ${rawY}`;
      }
    });

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
        {/* Draw Gridlines */}
        {Array.from({ length: 4 }).map((_, i) => {
          const wVal = Math.round((maxWpm / 3) * i);
          const y = getY(wVal);
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <text x={10} y={y + 4} fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">{wVal}</text>
            </g>
          );
        })}

        {/* Raw WPM Line (Blue, background-level) */}
        <path d={rawPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65 }} />
        
        {/* Net WPM Line (Yellow, foreground-level) */}
        <path d={netPath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Error points */}
        {data.map((d, idx) => {
          if (d.errors > 0) {
            return (
              <circle
                key={idx}
                cx={getX(d.second)}
                cy={getY(d.netWpm)}
                r="3.5"
                fill="var(--error)"
                style={{ filter: 'drop-shadow(0 0 2px var(--error))' }}
              />
            );
          }
          return null;
        })}

        {/* Legend */}
        <text x={width - 150} y={15} fill="var(--primary)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="700">● Net WPM</text>
        <text x={width - 80} y={15} fill="var(--accent)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="700">◌ Raw WPM</text>

        {/* X Axis Labels */}
        {data.filter((_, idx) => idx % Math.max(1, Math.round(data.length / 5)) === 0).map((d, i) => (
          <text
            key={i}
            x={getX(d.second)}
            y={height - 8}
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {d.second}s
          </text>
        ))}
      </svg>
    );
  };

  const getAICoachTips = () => {
    if (avgWpm === 0) {
      return {
        weakKeys: ["F", "J"],
        recommendation: "You haven't typed enough lines yet. Focus on Chapter 1 (Getting Started) and complete lessons 1-10 to master base positions."
      };
    }
    if (avgAccuracy < 94) {
      return {
        weakKeys: ["Z", "Q", "P"],
        recommendation: "Your precision bounds are low. Slow down typing upper/bottom keys. Check Chapter 3 top row transitions."
      };
    }
    return {
      weakKeys: [";", "X", "/"],
      recommendation: "Excellent speed control! Recommend completing Chapter 8 (Symbols & Punctuation) to boost technical coding accuracy."
    };
  };

  const coach = getAICoachTips();

  const getHeatmapColor = (key: string) => {
    const isWeak = coach.weakKeys.includes(key);
    if (isWeak) return 'rgba(239, 68, 68, 0.45)';
    return 'rgba(255, 255, 255, 0.02)';
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const currentGrade = getGrade(
    sessionResult ? sessionResult.wpm : bestWpm,
    sessionResult ? sessionResult.accuracy : avgAccuracy
  );

  // Certificate eligibility criteria checker
  const isEligibleForCertificate = completedLessonsCount >= 100 && bestWpm >= 35;

  // Chapter completion breakdown helper
  const getCompletedLessonsInChapter = (ch: ChapterConfig) => {
    let count = 0;
    for (let i = ch.start; i <= ch.end; i++) {
      if (completedMap[i] !== undefined) count++;
    }
    return count;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 20px', gap: '30px', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* State A: Immediate session results view */}
      {sessionResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '32px' }}>Typing Results</h1>
            <button onClick={onClearSession} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              🔄 Return to Dashboard
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Left Box: Chart & Grid stats */}
            <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>WPM SPEED TIMELINE</div>
              
              {renderLineChart(sessionResult.historySnapshot)}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NET SPEED</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{sessionResult.wpm} <span style={{ fontSize: '14px' }}>WPM</span></div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACCURACY</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>{sessionResult.accuracy}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MISTAKES</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--error)' }}>{sessionResult.mistakes}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TIME ELAPSED</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{sessionResult.duration}s</div>
                </div>
              </div>
            </div>

            {/* Right Box: Grade & Rating */}
            <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>TYPING GRADE</span>
              <div style={{
                fontSize: '84px',
                fontWeight: 900,
                color: currentGrade.color,
                lineHeight: 1,
                textShadow: `0 0 20px ${currentGrade.color}44`
              }}>
                {currentGrade.label}
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{currentGrade.desc}</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Grade evaluated using raw accuracy and net keyboard speed factors.
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* State B: Cumulative historical stats dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Performance Analytics</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Check your progression, chapter completion rates, and print technical certificates.
            </p>
          </div>

          {/* Cards stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
            <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>TYPING RANK</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {profile?.rank || "Beginner"}
              </div>
            </div>
            <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>CURRICULUM DONE</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                {completedLessonsCount} / 700
              </div>
            </div>
            <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>BEST WPM SPEED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                {bestWpm} WPM
              </div>
            </div>
            <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>AVG ACCURACY</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {avgAccuracy}%
              </div>
            </div>
            <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>DAILY STREAK</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'orange', marginTop: '2px' }}>
                🔥 {profile?.dailyStreak || 0} Days
              </div>
            </div>
          </div>

          {/* Chapter Progression Grid */}
          <div className="card-glass" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '15px' }}>Chapters Progress Breakdown</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px'
            }}>
              {CHAPTERS.map(ch => {
                const count = getCompletedLessonsInChapter(ch);
                const total = ch.end - ch.start + 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={ch.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                      <span>{ch.icon} Chapter {ch.id}</span>
                      <span style={{ color: 'var(--accent)' }}>{percent}%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0' }}>
                      Completed: {count} / {total}
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Heatmap Section */}
            <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)' }}>Typing Heatmap</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Visual keyboard details showing frequently mistyped keys.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '8px' }}>
                {keyboardRows.map((row, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {row.map((k) => (
                      <div
                        key={k}
                        style={{
                          width: '32px',
                          height: '32px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          backgroundColor: getHeatmapColor(k),
                          color: coach.weakKeys.includes(k) ? 'var(--error)' : 'var(--text-primary)'
                        }}
                      >
                        {k}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Coach */}
            <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--accent)' }}>AI Coach Recommendations</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mistake analyzer and recommendations.</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {coach.weakKeys.map(k => (
                  <span key={k} style={{
                    color: 'var(--error)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}>
                    Weak Key: {k}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: '12px', margin: '5px 0' }}>
                "{coach.recommendation}"
              </p>

              <button onClick={onNavigateToLearn} className="btn-primary" style={{ fontSize: '14px', padding: '10px', justifyContent: 'center' }}>
                🎯 Go to Roadmap
              </button>
            </div>

          </div>

          {/* Certificate Generation */}
          <div className="card-glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--primary)' }}>Professional Typing Certificate</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Reach at least 35 WPM speed AND complete 100 curriculum lessons to unlock your platform certificate!
              </p>
            </div>

            <div style={{
              width: '100%',
              maxWidth: '480px',
              border: '2px solid var(--primary)',
              borderRadius: '8px',
              padding: '10px',
              background: '#0f172a',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              opacity: isEligibleForCertificate ? 1 : 0.4
            }} onClick={isEligibleForCertificate ? drawCertificate : undefined}>
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={drawCertificate} className="btn-secondary" style={{ fontSize: '14px' }} disabled={!isEligibleForCertificate}>
                🎨 Render Certificate
              </button>
              <button
                onClick={downloadCertificate}
                className="btn-primary"
                style={{ fontSize: '14px' }}
                disabled={!isEligibleForCertificate}
              >
                📥 Download PNG Certificate
              </button>
            </div>
            {!isEligibleForCertificate && (
              <span style={{ fontSize: '11px', color: 'var(--error)' }}>
                *Locks: You have completed {completedLessonsCount}/100 lessons, and your best speed is {bestWpm}/35 WPM.
              </span>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
