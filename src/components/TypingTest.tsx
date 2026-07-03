import React, { useState } from 'react';
import { TypingArena } from './TypingArena';
import { type FinalSessionStats } from '../types/typing';
import { recordSession } from '../utils/db';

interface TypingTestProps {
  onCompleteSession: (stats: FinalSessionStats, mode: string) => void;
}

const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", 
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", 
  "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", 
  "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", 
  "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", 
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", 
  "any", "these", "give", "day", "most", "us", "web", "code", "programming", "developer", "computer"
];

const PROGRAMMING_SNIPPETS = [
  "const express = require('express');\nconst app = express();\napp.listen(3000);",
  "def calculate_wpm(words, time_sec):\n    return (words / 5) / (time_sec / 60)",
  "public static void main(String[] args) {\n    System.out.println(\"TypeLearner\");\n}",
  "for (let i = 0; i < array.length; i++) {\n  console.log(array[i]);\n}",
  "interface User {\n  id: string;\n  name: string;\n  xp: number;\n}",
  "SELECT username, wpm, accuracy FROM users ORDER BY wpm DESC LIMIT 10;"
];

const QUOTES = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep practicing your crafts.",
  "Code is like humor. When you have to explain it, it's bad. Focus on readability and clean implementation patterns.",
  "Small daily improvements over time lead to stunning results. Typing muscle memory grows one keystroke at a time."
];

export const TypingTest: React.FC<TypingTestProps> = ({ onCompleteSession }) => {
  const [testMode, setTestMode] = useState<'words' | 'numbers' | 'symbols' | 'code' | 'quotes'>('words');
  const [duration, setDuration] = useState<number>(30); // seconds
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'pro'>('easy');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeText, setActiveText] = useState("");
  
  const [usedQuoteIdxs, setUsedQuoteIdxs] = useState<number[]>([]);
  const [usedCodeIdxs, setUsedCodeIdxs] = useState<number[]>([]);
  
  const [lastSessionStats, setLastSessionStats] = useState<FinalSessionStats | null>(null);

  // Generate target practice text based on configuration settings
  const generateText = () => {
    let result = "";
    if (testMode === 'words') {
      const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
      // Adjust difficulty word length
      let wordPool = shuffled;
      if (difficulty === 'easy') {
        wordPool = shuffled.filter(w => w.length <= 4);
      } else if (difficulty === 'hard' || difficulty === 'pro') {
        wordPool = shuffled.filter(w => w.length >= 6);
      }

      // Fill text up to 100 words so the user has plenty to type
      result = wordPool.slice(0, 100).join(" ");
    } else if (testMode === 'numbers') {
      const numbers = [];
      for (let i = 0; i < 40; i++) {
        numbers.push(Math.floor(Math.random() * 1000).toString());
      }
      result = numbers.join(" ");
    } else if (testMode === 'symbols') {
      const syms = "!@#$%^&*()_+{}[]:;\"'<>?,./-=";
      const clusters = [];
      for (let i = 0; i < 30; i++) {
        let cluster = "";
        const len = 2 + Math.floor(Math.random() * 4);
        for (let j = 0; j < len; j++) {
          cluster += syms[Math.floor(Math.random() * syms.length)];
        }
        clusters.push(cluster);
      }
      result = clusters.join(" ");
    } else if (testMode === 'code') {
      const availableCodeIdxs = PROGRAMMING_SNIPPETS.map((_, idx) => idx).filter(idx => !usedCodeIdxs.includes(idx));
      let chosenIdx: number;
      if (availableCodeIdxs.length === 0) {
        chosenIdx = Math.floor(Math.random() * PROGRAMMING_SNIPPETS.length);
        setUsedCodeIdxs([chosenIdx]);
      } else {
        chosenIdx = availableCodeIdxs[Math.floor(Math.random() * availableCodeIdxs.length)];
        setUsedCodeIdxs(prev => [...prev, chosenIdx]);
      }
      result = PROGRAMMING_SNIPPETS[chosenIdx];
    } else if (testMode === 'quotes') {
      const availableQuoteIdxs = QUOTES.map((_, idx) => idx).filter(idx => !usedQuoteIdxs.includes(idx));
      let chosenIdx: number;
      if (availableQuoteIdxs.length === 0) {
        chosenIdx = Math.floor(Math.random() * QUOTES.length);
        setUsedQuoteIdxs([chosenIdx]);
      } else {
        chosenIdx = availableQuoteIdxs[Math.floor(Math.random() * availableQuoteIdxs.length)];
        setUsedQuoteIdxs(prev => [...prev, chosenIdx]);
      }
      result = QUOTES[chosenIdx];
    }

    setActiveText(result);
    setIsPlaying(true);
  };

  const handleComplete = (stats: FinalSessionStats) => {
    // Record session to DB so progress is saved
    recordSession(
      stats.netWpm,
      stats.accuracy,
      stats.incorrectChars,
      `test-${testMode}-${duration}s`,
      stats.elapsedTime,
      stats.wordsCompleted
    );
    setLastSessionStats(stats);
  };

  if (isPlaying) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <TypingArena
          text={activeText}
          title={`Speed Test: ${testMode.toUpperCase()} (${duration}s)`}
          mode="free-typing"
          specialType="normal"
          durationLimit={duration}
          onBack={() => {
            setIsPlaying(false);
            if (lastSessionStats) {
              onCompleteSession(lastSessionStats, `test-${testMode}-${duration}s`);
            }
          }}
          onComplete={handleComplete}
          onNextTest={generateText}
        />
      </div>
    );
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', gap: '30px' }}>
      
      {/* Intro header */}
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Typing Speed Test</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Configure your test options, type the target text, and review your detailed speed metrics (WPM, Accuracy, error heatmaps, and stats timeline).
        </p>
      </div>

      {/* Configuration Glass Box Card */}
      <div className="card-glass" style={{
        maxWidth: '700px',
        width: '100%',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Selection Row 1: Test Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>SELECT TEST MODE</span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['words', 'numbers', 'symbols', 'code', 'quotes'].map((m) => (
              <button
                key={m}
                onClick={() => setTestMode(m as any)}
                style={{
                  flex: 1,
                  minWidth: '90px',
                  background: testMode === m ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: testMode === m ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  color: testMode === m ? 'var(--primary)' : 'var(--text-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Row 2: Duration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>TEST DURATION</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[15, 30, 60, 120].map((t) => (
              <button
                key={t}
                onClick={() => setDuration(t)}
                style={{
                  flex: 1,
                  background: duration === t ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: duration === t ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  color: duration === t ? 'var(--primary)' : 'var(--text-primary)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}
              >
                {t} SECONDS
              </button>
            ))}
          </div>
        </div>

        {/* Selection Row 3: Difficulty (only relevant for words mode) */}
        {testMode === 'words' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>DIFFICULTY FILTER</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['easy', 'medium', 'hard', 'pro'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  style={{
                    flex: 1,
                    background: difficulty === d ? 'rgba(255, 214, 10, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: difficulty === d ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    color: difficulty === d ? 'var(--primary)' : 'var(--text-primary)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={generateText} className="btn-primary" style={{
          marginTop: '10px',
          width: '100%',
          justifyContent: 'center',
          fontSize: '18px',
          padding: '14px'
        }}>
          ⚡ Launch Speed Arena
        </button>

      </div>
    </div>
  );
};
