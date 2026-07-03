import React, { useEffect, useState } from 'react';
import { loadHistory, recordSession, type UserProfile } from '../utils/db';
import { TypingArena } from './TypingArena';
import { type FinalSessionStats } from '../types/typing';

interface LeaderboardProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

interface Competitor {
  rank?: number;
  username: string;
  wpm: number;
  accuracy: number;
  level: number;
  isCurrentUser?: boolean;
}

const STATIC_COMPETITORS: Competitor[] = [
  { username: "SpeedyGonzales", wpm: 92, accuracy: 98, level: 8 },
  { username: "KeyboardCat", wpm: 78, accuracy: 96, level: 6 },
  { username: "CodeCracker", wpm: 71, accuracy: 95, level: 5 },
  { username: "SyntaxError", wpm: 58, accuracy: 91, level: 4 },
  { username: "DuolingoFan", wpm: 46, accuracy: 93, level: 3 },
  { username: "KeyBored", wpm: 34, accuracy: 88, level: 2 }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ profile, refreshProfile }) => {
  const [board, setBoard] = useState<Competitor[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<{ id: string; title: string; target: string; text: string; reward: number } | null>(null);
  const [challengeResult, setChallengeResult] = useState<string | null>(null);

  useEffect(() => {
    const history = loadHistory();
    const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0;
    const bestAcc = history.length > 0 ? Math.max(...history.map(h => h.accuracy)) : 100;

    // Merge actual user into competitor list
    const currentCompetitors = [...STATIC_COMPETITORS];
    const userBest: Competitor = {
      username: `${profile.username} (You)`,
      wpm: bestWpm || 0,
      accuracy: bestWpm ? bestAcc : 100,
      level: profile.level,
      isCurrentUser: true
    };
    
    currentCompetitors.push(userBest);
    
    // Sort by WPM descending
    const sorted = currentCompetitors
      .sort((a, b) => b.wpm - a.wpm)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    setBoard(sorted);
  }, [profile]);

  const runChallenge = (id: string) => {
    setChallengeResult(null);
    if (id === 'speed') {
      setActiveChallenge({
        id: 'speed',
        title: "Daily WPM Challenge",
        target: "Reach 60 WPM or higher with at least 92% accuracy",
        text: "The speed challenge requires fast transitions. Keep moving forward.",
        reward: 100
      });
    } else if (id === 'accuracy') {
      setActiveChallenge({
        id: 'accuracy',
        title: "Daily Precision Run",
        target: "Complete the text with 98% or higher accuracy",
        text: "Slow down and focus. Precision is a virtue that builds raw speed over time.",
        reward: 150
      });
    }
  };

  const handleChallengeComplete = (stats: FinalSessionStats) => {
    if (!activeChallenge) return;

    let succeeded = false;
    if (activeChallenge.id === 'speed' && stats.netWpm >= 60 && stats.accuracy >= 92) {
      succeeded = true;
    } else if (activeChallenge.id === 'accuracy' && stats.accuracy >= 98) {
      succeeded = true;
    }

    if (succeeded) {
      // Award rewards in DB
      recordSession(
        stats.netWpm,
        stats.accuracy,
        stats.incorrectChars,
        `challenge-${activeChallenge.id}`,
        stats.elapsedTime,
        stats.wordsCompleted
      );
      setChallengeResult(`SUCCESS! You completed the challenge and earned +${activeChallenge.reward} XP and extra coins!`);
    } else {
      setChallengeResult("Failed. You did not meet the criteria. Please try again!");
    }

    setActiveChallenge(null);
    refreshProfile();
  };

  if (activeChallenge) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <TypingArena
          text={activeChallenge.text}
          title={activeChallenge.title}
          mode="free-typing"
          specialType="normal"
          onBack={() => setActiveChallenge(null)}
          onComplete={handleChallengeComplete}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 20px', gap: '30px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Introduction */}
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Leaderboards & Daily Challenges</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Compete against virtual peers to reach the global top spot, or complete daily challenges for massive coin drops.
        </p>
      </div>

      {challengeResult && (
        <div style={{
          background: challengeResult.includes("SUCCESS") ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: challengeResult.includes("SUCCESS") ? '1px solid var(--success)' : '1px solid var(--error)',
          color: challengeResult.includes("SUCCESS") ? 'var(--success)' : 'var(--error)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontWeight: 700
        }}>
          {challengeResult}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Weekly high score table */}
        <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--primary)' }}>Weekly WPM Standings</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '12px' }}>
                <th style={{ padding: '10px' }}>RANK</th>
                <th>NAME</th>
                <th>SPEED</th>
                <th>ACCURACY</th>
                <th>LVL</th>
              </tr>
            </thead>
            <tbody>
              {board.map((player) => (
                <tr
                  key={player.username}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '14px',
                    fontWeight: player.isCurrentUser ? 700 : 500,
                    backgroundColor: player.isCurrentUser ? 'rgba(255, 214, 10, 0.05)' : 'transparent',
                    color: player.isCurrentUser ? 'var(--primary)' : 'var(--text-primary)'
                  }}
                >
                  <td style={{ padding: '12px 10px', color: player.rank === 1 ? 'gold' : player.rank === 2 ? 'silver' : player.rank === 3 ? '#cd7f32' : 'var(--text-muted)' }}>
                    #{player.rank}
                  </td>
                  <td>{player.username}</td>
                  <td>{player.wpm} WPM</td>
                  <td>{player.accuracy}%</td>
                  <td>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      Lvl {player.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Daily Challenges options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <span style={{ background: 'orange', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>DAILY</span>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Daily Speed Burst</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Complete a typing run reaching at least 60 WPM under 92%+ accuracy boundaries.
              </p>
            </div>
            <button onClick={() => runChallenge('speed')} className="btn-primary" style={{ fontSize: '13px', padding: '10px', justifyContent: 'center' }}>
              ⚔️ Try Challenge
            </button>
          </div>

          <div className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>🎯</span>
              <span style={{ background: 'orange', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>DAILY</span>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Daily Precision Run</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Type out a medium length prose segment with an absolute error tolerance of under 98% accuracy.
              </p>
            </div>
            <button onClick={() => runChallenge('accuracy')} className="btn-secondary" style={{ fontSize: '13px', padding: '10px', justifyContent: 'center' }}>
              ⚔️ Try Challenge
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
