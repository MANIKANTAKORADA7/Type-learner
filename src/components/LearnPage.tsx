import React, { useState, useEffect } from 'react';
import { loadCompletedLessonsMap, recordSession, type UserProfile } from '../utils/db';
import { generateLesson, type LessonConfig } from '../utils/lessonGenerator';
import { TypingArena } from './TypingArena';
import { type FinalSessionStats } from '../types/typing';

interface LearnPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

interface ChapterConfig {
  id: number;
  title: string;
  start: number;
  end: number;
  description: string;
  icon: string;
}

const CHAPTERS: ChapterConfig[] = [
  { id: 1, title: "Getting Started", start: 1, end: 20, description: "Posture and basic Home Row anchors.", icon: "🌱" },
  { id: 2, title: "Home Row Mastery", start: 21, end: 60, description: "Fluid home row muscle drills.", icon: "🏠" },
  { id: 3, title: "Top Row Key-by-Key", start: 61, end: 140, description: "Slide fingers to QWERTYUIOP keys.", icon: "🪜" },
  { id: 4, title: "Bottom Row Key-by-Key", start: 141, end: 220, description: "Slide fingers to ZXCVBNM keys.", icon: "⛰️" },
  { id: 5, title: "Complete Alphabet", start: 221, end: 280, description: "Mixed alpha paragraphs and stories.", icon: "📖" },
  { id: 6, title: "Capital Letters", start: 281, end: 340, description: "Mastering double shift key patterns.", icon: "👑" },
  { id: 7, title: "Numbers Row", start: 341, end: 420, description: "Top numeric digits and date patterns.", icon: "🔢" },
  { id: 8, title: "Symbols & Punctuation", start: 421, end: 500, description: "Brackets, parenthesis, and math keys.", icon: "🎨" },
  { id: 9, title: "Word Mastery", start: 501, end: 560, description: "Spell tech, academic, and business vocabulary.", icon: "📚" },
  { id: 10, title: "Sentence Mastery", start: 561, end: 620, description: "Structured dialogues and punctuation.", icon: "💬" },
  { id: 11, title: "Paragraph Drills", start: 621, end: 660, description: "Longer story writing and logs.", icon: "📝" },
  { id: 12, title: "Professional Technical", start: 661, end: 700, description: "Coding blocks and technical documents.", icon: "💻" }
];

export const LearnPage: React.FC<LearnPageProps> = ({ profile, refreshProfile }) => {
  const [completedMap, setCompletedMap] = useState<Record<number, number>>({});
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState<LessonConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<{
    wpm: number;
    accuracy: number;
    mistakes: number;
    xpEarned: number;
    newLevelUp: boolean;
    rankChanged: boolean;
    unlockedAchievements: string[];
    stars: number;
  } | null>(null);

  useEffect(() => {
    setCompletedMap(loadCompletedLessonsMap());
  }, [isPlaying]);

  // Check if lesson is unlocked
  const isLessonUnlocked = (lessonNum: number): boolean => {
    if (lessonNum === 1) return true;
    return completedMap[lessonNum - 1] !== undefined;
  };

  // Calculate chapter completion percentage
  const getChapterProgress = (chapter: ChapterConfig) => {
    let completedCount = 0;
    const total = chapter.end - chapter.start + 1;
    for (let i = chapter.start; i <= chapter.end; i++) {
      if (completedMap[i] !== undefined) {
        completedCount++;
      }
    }
    return Math.round((completedCount / total) * 100);
  };

  const startLesson = (lesson: LessonConfig) => {
    setSelectedLesson(lesson);
    setIsPlaying(true);
    setResult(null);
  };

  const handleComplete = (stats: FinalSessionStats, starsEarned: number) => {
    if (!selectedLesson) return;

    // Record stats and evaluate progression parameters
    const record = recordSession(
      stats.netWpm,
      stats.accuracy,
      stats.incorrectChars,
      `lesson-${selectedLesson.number}`,
      stats.elapsedTime,
      stats.wordsCompleted,
      starsEarned
    );

    setResult({
      wpm: stats.netWpm,
      accuracy: stats.accuracy,
      mistakes: stats.incorrectChars,
      xpEarned: record.xpEarned,
      newLevelUp: record.newLevelUp,
      rankChanged: record.rankChanged,
      unlockedAchievements: record.unlockedAchievements,
      stars: starsEarned
    });
    setIsPlaying(false);
    refreshProfile();
  };

  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId) || CHAPTERS[0];

  // Renders small visual indicators for stars
  const renderStars = (count: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '2px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ fontSize: '8px', color: i < count ? 'var(--primary)' : 'rgba(255,255,255,0.15)' }}>★</span>
        ))}
      </div>
    );
  };

  if (isPlaying && selectedLesson) {
    // Determine timed race durations (default 45s for timed checkpoint modes)
    const isTimed = selectedLesson.specialType === 'speed-challenge';
    const limit = isTimed ? 45 : 0;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <TypingArena
          text={selectedLesson.text}
          title={selectedLesson.title}
          mode={selectedLesson.mode}
          specialType={selectedLesson.specialType}
          minAccuracy={selectedLesson.minAccuracy}
          durationLimit={limit}
          onBack={() => setIsPlaying(false)}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  if (result && selectedLesson) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="card-glass" style={{
          maxWidth: '550px',
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <span style={{ fontSize: '64px' }}>🎉</span>
          <h2 style={{ fontSize: '28px', color: 'var(--primary)' }}>Lesson Completed!</h2>
          <p style={{ color: 'var(--text-muted)' }}>You completed <strong>{selectedLesson.title}</strong></p>
          
          {/* Star Rating Gauge */}
          <div style={{ display: 'flex', gap: '6px', fontSize: '32px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: i < result.stars ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}>⭐</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SPEED</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{result.wpm} WPM</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACCURACY</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{result.accuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MISTAKES</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--error)' }}>{result.mistakes}</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px dashed var(--accent)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', marginBottom: '8px' }}>💰 LOOT REWARDS:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>XP Gained:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>+{result.xpEarned} XP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '4px' }}>
              <span>Coins Earned:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>🪙 +{Math.round(result.xpEarned / 5)}</span>
            </div>
          </div>

          {/* Rank promotions alert */}
          {result.rankChanged && (
            <div style={{
              background: 'rgba(255, 214, 10, 0.1)',
              border: '1px solid var(--primary)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              textAlign: 'center',
              color: 'var(--primary)',
              fontWeight: 800
            }}>
              🏆 RANK PROMOTION: You are now a {profile.rank}!
            </div>
          )}

          {result.newLevelUp && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--success)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              textAlign: 'center',
              color: 'var(--success)',
              fontWeight: 800
            }}>
              ⭐ LEVEL UP! You reached Level {profile.level}!
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
            <button onClick={() => setResult(null)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Back to Roadmap
            </button>
            {selectedLesson.number < 700 && isLessonUnlocked(selectedLesson.number + 1) && (
              <button
                onClick={() => startLesson(generateLesson(selectedLesson.number + 1))}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Next Lesson ➡
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generate lesson list in selected chapter
  const chapterLessons = [];
  for (let i = activeChapter.start; i <= activeChapter.end; i++) {
    chapterLessons.push(generateLesson(i));
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: '30px',
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      alignItems: 'start'
    }}>
      
      {/* Left Sidebar: Chapters Navigation */}
      <div className="card-glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
          📑 Course Syllabus
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto', paddingRight: '5px' }}>
          {CHAPTERS.map((ch) => {
            const isActive = activeChapterId === ch.id;
            const progress = getChapterProgress(ch);
            return (
              <div
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                style={{
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ display: 'flex', justifyItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                  <span>{ch.icon}</span>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {ch.id}. {ch.title}
                  </span>
                </div>
                {/* Progress bar info */}
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>Lessons {ch.start}-{ch.end}</span>
                  <span style={{ fontWeight: 800, color: progress > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Lessons list grid of active chapter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Active Chapter Intro Header */}
        <div className="card-glass" style={{ padding: '24px', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '48px' }}>{activeChapter.icon}</span>
            <div>
              <h2 style={{ fontSize: '24px', color: 'var(--primary)' }}>Chapter {activeChapter.id}: {activeChapter.title}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{activeChapter.description}</p>
            </div>
          </div>
        </div>

        {/* Lesson nodes grid mapping */}
        <div className="card-glass" style={{
          padding: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
          gap: '20px',
          justifyItems: 'center'
        }}>
          {chapterLessons.map((lvl) => {
            const unlocked = isLessonUnlocked(lvl.number);
            const stars = completedMap[lvl.number] || 0;
            const isFinished = stars > 0;
            
            return (
              <div key={lvl.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={() => unlocked && setSelectedLesson(lvl)}
                  disabled={!unlocked}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: unlocked ? (isFinished ? 'var(--primary)' : 'var(--bg-secondary)') : 'rgba(255,255,255,0.02)',
                    border: unlocked ? `3px solid ${isFinished ? 'var(--primary)' : 'var(--accent)'}` : '3px solid var(--text-muted)',
                    boxShadow: unlocked ? `0 0 12px ${isFinished ? 'var(--primary-glow)' : 'var(--accent-glow)'}` : 'none',
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: unlocked ? (isFinished ? 'var(--text-dark)' : 'var(--text-primary)') : 'var(--text-muted)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span>{lvl.number}</span>
                </button>
                {/* Visual tiny 1-5 star badges */}
                {unlocked && renderStars(stars)}
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Level Description Detail Overlay Panel */}
      {selectedLesson && !isPlaying && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card-glass" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedLesson(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>{activeChapter.icon}</span>
              <div>
                <h3 style={{ fontSize: '20px', color: 'var(--primary)' }}>{selectedLesson.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--accent)' }}>Chapter: {selectedLesson.chapterTitle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>LESSON OBJECTIVE</span>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                {selectedLesson.objective}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DIFFICULTY</span>
                <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent)' }}>{selectedLesson.difficulty}</span>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>TARGET KEY</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>{selectedLesson.targetKeys.toUpperCase()}</span>
              </div>
            </div>

            {/* Hand Guidance instructions */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-border)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <strong>💡 Finger Guide:</strong> Visual hands diagram overlay will load to light up target fingers during this exercise.
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => setSelectedLesson(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button onClick={() => startLesson(selectedLesson)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Start Lesson ⚔️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
