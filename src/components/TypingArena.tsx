import React, { useState, useEffect, useRef } from 'react';
import { playKeyClick, playErrorBuzz } from '../utils/sound';
import { VirtualKeyboard } from './VirtualKeyboard';
import { type KeystrokeEvent, type WordRecord, type SessionSnapshot, type FinalSessionStats } from '../types/typing';

interface WordItem {
  text: string;
  separator: string;
}

const parseTextToWords = (text: string): WordItem[] => {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, '    ');
  const tokens = normalized.split(/(\s+)/);
  const words: WordItem[] = [];
  
  let i = 0;
  let leadingSeparator = "";
  if (tokens.length > 0 && tokens[0] === "") {
    leadingSeparator = tokens[1] || "";
    i = 2;
  } else if (tokens.length > 0 && /^\s+$/.test(tokens[0])) {
    leadingSeparator = tokens[0];
    i = 1;
  }
  
  while (i < tokens.length) {
    const wordText = tokens[i];
    if (wordText !== undefined && wordText !== "") {
      const nextToken = tokens[i + 1];
      const separator = (nextToken && /^\s+$/.test(nextToken)) ? nextToken : "";
      words.push({
        text: wordText,
        separator: words.length === 0 ? leadingSeparator + separator : separator
      });
    }
    i += 2;
  }
  
  return words;
};

interface TypingArenaProps {
  text: string;
  title: string;
  mode: 'block-on-error' | 'free-typing';
  specialType: 'normal' | 'speed-challenge' | 'accuracy-only' | 'blind' | 'code' | 'checkpoint';
  minAccuracy?: number;
  durationLimit?: number; // Timed Mode limits in seconds
  showKeyboard?: boolean;
  onComplete: (stats: FinalSessionStats, stars: number) => void;
  onBack: () => void;
  onNextTest?: () => void;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  text,
  title,
  mode,
  specialType,
  minAccuracy = 90,
  durationLimit = 0,
  showKeyboard = true,
  onComplete,
  onBack,
  onNextTest
}) => {
  const [parsedWords, setParsedWords] = useState<WordItem[]>([]);
  const [wordTypedText, setWordTypedText] = useState<string[]>([]);
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  // Time & Ticker states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [timeLeft, setTimeLeft] = useState(durationLimit);
  const [isFinished, setIsFinished] = useState(false);

  // Persistent key event states
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [mistakesMap, setMistakesMap] = useState<Record<string, number>>({});
  
  // Advanced tracking logs
  const [keystrokeLog, setKeystrokeLog] = useState<KeystrokeEvent[]>([]);
  const [snapshots, setSnapshots] = useState<SessionSnapshot[]>([]);
  const [wordHistory, setWordHistory] = useState<WordRecord[]>([]);

  // Timer reference & input focus
  const timerRef = useRef<any>(null);
  const lastKeystrokeTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [failedMsg, setFailedMsg] = useState<string | null>(null);


  // Live calculated stats
  const [liveStats, setLiveStats] = useState({
    netWpm: 0,
    grossWpm: 0,
    rawWpm: 0,
    accuracy: 100
  });

  const [isRotating, setIsRotating] = useState(false);

  const resetState = (t: string) => {
    const parsed = parseTextToWords(t);
    setParsedWords(parsed);
    setWordTypedText(Array(parsed.length).fill(""));
    setActiveWordIdx(0);
    setStartTime(null);
    setElapsedTime(0);
    setTimeLeft(durationLimit);
    setIsFinished(false);
    setCorrectKeystrokes(0);
    setTotalKeystrokes(0);
    setBackspaces(0);
    setMistakesMap({});
    setKeystrokeLog([]);
    setSnapshots([]);
    setWordHistory([]);
    setPressedKey(null);
    setIsShake(false);
    setFailedMsg(null);
    setLiveStats({
      netWpm: 0,
      grossWpm: 0,
      rawWpm: 0,
      accuracy: 100
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  useEffect(() => {
    resetState(text);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, durationLimit]);

  const handleArenaClick = () => {
    if (inputRef.current && !isFinished && !failedMsg) {
      inputRef.current.focus();
    }
  };

  // High precision timer loop updating every 100ms
  useEffect(() => {
    if (startTime !== null && !timerRef.current && !isFinished && !failedMsg) {
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsedSec = (now - startTime) / 1000;
        setElapsedTime(elapsedSec);

        // Update countdown if timed mode is active
        if (durationLimit > 0) {
          const remaining = Math.max(0, durationLimit - elapsedSec);
          setTimeLeft(Math.ceil(remaining));
          if (remaining <= 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            triggerFinish(elapsedSec);
            return;
          }
        }

        updateLiveStats(elapsedSec);
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTime, wordTypedText, activeWordIdx, totalKeystrokes, isFinished, failedMsg]);

  // Record stats snapshot every exact second
  useEffect(() => {
    if (startTime !== null && !isFinished && !failedMsg) {
      const currentSec = Math.floor(elapsedTime);
      if (currentSec > 0 && !snapshots.some(s => s.second === currentSec)) {
        const snap: SessionSnapshot = {
          second: currentSec,
          netWpm: liveStats.netWpm,
          grossWpm: liveStats.grossWpm,
          rawWpm: liveStats.rawWpm,
          accuracy: liveStats.accuracy,
          errors: Object.values(mistakesMap).reduce((a, b) => a + b, 0)
        };
        setSnapshots(prev => [...prev, snap]);
      }
    }
  }, [elapsedTime, liveStats, snapshots]);

  // Core metrics calculation
  const updateLiveStats = (seconds: number) => {
    if (seconds <= 0) return;
    const elapsedMin = seconds / 60;

    let correctChars = 0;
    wordTypedText.forEach((typed, wIdx) => {
      const expected = parsedWords[wIdx]?.text || "";
      for (let i = 0; i < typed.length; i++) {
        if (i < expected.length && typed[i] === expected[i]) {
          correctChars++;
        }
      }
      if (wIdx < activeWordIdx && typed === expected) {
        correctChars += (parsedWords[wIdx]?.separator.length || 0);
      }
    });

    const totalCharsTyped = Math.max(0, totalKeystrokes - backspaces);
    const grossWpm = Math.round((totalCharsTyped / 5) / elapsedMin);
    const netWpm = Math.round((correctChars / 5) / elapsedMin);
    const rawWpm = Math.round((totalKeystrokes / 5) / elapsedMin);

    const accuracy = totalKeystrokes > 0 
      ? Math.round((correctKeystrokes / totalKeystrokes) * 1000) / 10 
      : 100;

    if (specialType === 'accuracy-only' && accuracy < minAccuracy && totalKeystrokes > 5) {
      setFailedMsg(`FAILED! Accuracy fell below target limit: ${accuracy}% (Required: ${minAccuracy}%+)`);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setLiveStats({
      netWpm: Math.max(0, netWpm),
      grossWpm: Math.max(0, grossWpm),
      rawWpm: Math.max(0, rawWpm),
      accuracy
    });
  };

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
    if (onNextTest) {
      onNextTest();
    } else {
      resetState(text);
    }
  };

  // Keyboard shortcut listener for Esc and Ctrl+R
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        handleRefresh();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [text, onNextTest]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished || failedMsg) return;

    const key = e.key;
    setPressedKey(key);

    if (key === ' ' || key === 'ArrowUp' || key === 'ArrowDown' || key === 'PageUp' || key === 'PageDown') {
      e.preventDefault();
    }

    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock') {
      return;
    }

    const now = performance.now();
    
    // Initialize timer on first keypress
    if (startTime === null) {
      setStartTime(now);
      lastKeystrokeTimeRef.current = now;
    }

    const currentTyped = wordTypedText[activeWordIdx] || "";
    const expectedWordObj = parsedWords[activeWordIdx];
    const expected = expectedWordObj?.text || "";

    const reactionTime = Math.round(now - lastKeystrokeTimeRef.current);
    lastKeystrokeTimeRef.current = now;

    // 1. Backspace key trigger
    if (key === 'Backspace') {
      setBackspaces(prev => prev + 1);
      setTotalKeystrokes(prev => prev + 1);

      if (currentTyped.length > 0) {
        playKeyClick(false, true);
        const updated = [...wordTypedText];
        updated[activeWordIdx] = currentTyped.slice(0, -1);
        setWordTypedText(updated);
      } else if (activeWordIdx > 0 && mode === 'free-typing') {
        playKeyClick(false, true);
        setActiveWordIdx(prev => prev - 1);
      }
      return;
    }

    let charTyped = key === 'Enter' ? '\n' : key;
    const charIdx = currentTyped.length;
    let expectedChar = "";
    
    if (charIdx < expected.length) {
      expectedChar = expected[charIdx];
    } else {
      expectedChar = " ";
    }

    const isCorrect = charTyped === expectedChar;

    const newEvent: KeystrokeEvent = {
      timestamp: now,
      expectedChar,
      typedChar: charTyped,
      isCorrect,
      wordIndex: activeWordIdx,
      charIndex: charIdx,
      reactionTime
    };
    setKeystrokeLog(prev => [...prev, newEvent]);

    setTotalKeystrokes(prev => prev + 1);
    if (isCorrect) {
      setCorrectKeystrokes(prev => prev + 1);
    } else {
      setMistakesMap(prev => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1
      }));
      playErrorBuzz();
      setIsShake(true);
      setTimeout(() => setIsShake(false), 200);
    }

    // 2. Space / Transition key trigger
    if (charTyped === ' ' || charTyped === '\n') {
      // Ignore if user has not typed anything for this word yet
      if (currentTyped.length === 0) {
        return;
      }

      if (mode === 'block-on-error' && !isCorrect) {
        return;
      }

      playKeyClick(true);
      recordWordHistory(activeWordIdx, currentTyped, expected);

      if (activeWordIdx < parsedWords.length - 1) {
        setActiveWordIdx(prev => prev + 1);
      } else {
        triggerFinish((performance.now() - (startTime || performance.now())) / 1000);
      }
      return;
    }

    // 3. Regular key typing
    if (mode === 'block-on-error' && !isCorrect) {
      return;
    }

    playKeyClick();
    const updated = [...wordTypedText];
    const updatedTyped = currentTyped + charTyped;
    updated[activeWordIdx] = updatedTyped;
    setWordTypedText(updated);

    // Instant completion check for final character of the last word
    if (activeWordIdx === parsedWords.length - 1 && updatedTyped.length >= expected.length) {
      if (mode === 'block-on-error') {
        if (updatedTyped === expected) {
          triggerFinish((performance.now() - (startTime || performance.now())) / 1000);
        }
      } else {
        triggerFinish((performance.now() - (startTime || performance.now())) / 1000);
      }
    }
  };

  const handleKeyUp = () => {
    setPressedKey(null);
  };

  const recordWordHistory = (wIdx: number, typed: string, expected: string) => {
    const isCorrect = typed === expected;
    const errors = expected.split("").filter((c, idx) => typed[idx] !== c).length + Math.max(0, typed.length - expected.length);
    
    const matchesLog = keystrokeLog.filter(e => e.wordIndex === wIdx);
    const errorKeystrokes = matchesLog.filter(e => !e.isCorrect).length;

    const newRecord: WordRecord = {
      expectedWord: expected,
      typedWord: typed,
      isCorrect,
      isWrong: !isCorrect && typed.length > 0,
      timeTaken: Math.round(elapsedTime * 1000),
      errors,
      corrections: errorKeystrokes,
      wpm: liveStats.netWpm
    };

    setWordHistory(prev => [...prev, newRecord]);
  };

  const triggerFinish = (finalElapsed: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsFinished(true);

    const seconds = Math.max(0.1, finalElapsed);
    const elapsedMin = seconds / 60;

    let correctChars = 0;
    wordTypedText.forEach((typed, wIdx) => {
      const expected = parsedWords[wIdx]?.text || "";
      for (let i = 0; i < typed.length; i++) {
        if (i < expected.length && typed[i] === expected[i]) {
          correctChars++;
        }
      }
      if (wIdx < activeWordIdx && typed === expected) {
        correctChars += (parsedWords[wIdx]?.separator.length || 0);
      }
    });

    const netWpm = Math.round((correctChars / 5) / elapsedMin);
    const grossWpm = Math.round(((totalKeystrokes - backspaces) / 5) / elapsedMin);
    const rawWpm = Math.round((totalKeystrokes / 5) / elapsedMin);
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 1000) / 10 : 100;

    let consistency = 100;
    if (snapshots.length > 1) {
      const wpms = snapshots.map(s => s.netWpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      if (mean > 0) {
        const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
      }
    }

    const wordsCompleted = activeWordIdx + 1;
    const wrongWords = wordHistory.filter(w => w.isWrong).length;
    const skippedWords = wordTypedText.filter((t, idx) => idx < activeWordIdx && t.length === 0).length;

    const incorrectChars = Object.values(mistakesMap).reduce((a, b) => a + b, 0);
    const extraChars = wordTypedText.reduce((acc, curr, idx) => {
      const expectedLen = parsedWords[idx]?.text.length || 0;
      return acc + Math.max(0, curr.length - expectedLen);
    }, 0);
    const missedChars = parsedWords.reduce((acc, curr, idx) => {
      if (idx > activeWordIdx) return acc + curr.text.length + curr.separator.length;
      const typedLen = wordTypedText[idx]?.length || 0;
      return acc + Math.max(0, curr.text.length - typedLen);
    }, 0);

    const finalStats: FinalSessionStats = {
      netWpm: Math.max(0, netWpm),
      grossWpm: Math.max(0, grossWpm),
      rawWpm: Math.max(0, rawWpm),
      accuracy,
      elapsedTime: seconds,
      charsTyped: totalKeystrokes - backspaces,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars,
      backspaces,
      wordsCompleted,
      wrongWords,
      skippedWords,
      consistency,
      historySnapshot: snapshots,
      wordHistory,
      keystrokeLog
    };

    let stars = 0;
    if (accuracy === 100) stars = 5;
    else if (accuracy >= 98) stars = 4;
    else if (accuracy >= 95) stars = 3;
    else if (accuracy >= 90) stars = 2;
    else if (accuracy >= 80) stars = 1;

    onComplete(finalStats, stars);
  };

  const renderWords = () => {
    return parsedWords.map((wordItem, wIdx) => {
      const word = wordItem.text;
      const separator = wordItem.separator;
      const typed = wordTypedText[wIdx] || "";
      const isActive = wIdx === activeWordIdx;
      
      const charElements = [];
      const maxLength = Math.max(word.length, typed.length);

      for (let i = 0; i < maxLength; i++) {
        const targetC = word[i];
        const typedC = typed[i];
        
        let charClass = "untyped";
        let displayC = targetC || typedC;

        if (typedC !== undefined) {
          if (specialType === 'blind') {
            charClass = "typed-blind";
          } else if (i < word.length) {
            charClass = typedC === targetC ? "correct" : "incorrect";
          } else {
            charClass = "extra";
          }
        }

        const isCursor = isActive && i === typed.length;

        charElements.push(
          <span
            key={`char-${i}`}
            className={charClass}
            style={{
              color: charClass === 'correct' 
                ? 'var(--primary)' 
                : charClass === 'incorrect' 
                  ? 'var(--error)' 
                  : charClass === 'extra' 
                    ? 'orange'
                    : charClass === 'typed-blind'
                      ? '#94a3b8'
                      : 'var(--text-muted)',
              fontSize: '24px',
              fontFamily: 'var(--font-mono)',
              position: 'relative',
              whiteSpace: 'pre',
              display: 'inline-block'
            }}
          >
            {isCursor && (
              <span
                className="cursor-blink"
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: '10%',
                  height: '80%',
                  width: '3px',
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent-glow)'
                }}
              />
            )}
            {displayC}
          </span>
        );
      }

      const separatorElements = [];
      for (let i = 0; i < separator.length; i++) {
        const targetC = separator[i];
        const isCursor = isActive && (typed.length === word.length) && (i === 0);
        
        separatorElements.push(
          <span
            key={`sep-${i}`}
            className="untyped"
            style={{
              color: 'var(--text-muted)',
              fontSize: '24px',
              fontFamily: 'var(--font-mono)',
              position: 'relative',
              whiteSpace: 'pre',
              display: 'inline-block'
            }}
          >
            {isCursor && (
              <span
                className="cursor-blink"
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: '10%',
                  height: '80%',
                  width: '3px',
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent-glow)'
                }}
              />
            )}
            {targetC === '\n' ? ' ⏎\n' : targetC}
          </span>
        );
      }

      return (
        <span
          key={wIdx}
          style={{
            display: 'inline-block',
            borderBottom: isActive ? '1px dashed var(--accent)' : 'none',
            transition: 'all 0.2s ease',
            opacity: wIdx < activeWordIdx ? 0.6 : 1
          }}
        >
          {charElements}
          {separatorElements}
        </span>
      );
    });
  };

  let nextTargetChar = "";
  if (parsedWords[activeWordIdx]) {
    const word = parsedWords[activeWordIdx].text;
    const typed = wordTypedText[activeWordIdx] || "";
    if (typed.length < word.length) {
      nextTargetChar = word[typed.length];
    } else {
      nextTargetChar = parsedWords[activeWordIdx].separator[0] || "";
    }
  }

  const completionPercentage = parsedWords.length > 0 
    ? Math.round((activeWordIdx / parsedWords.length) * 100) 
    : 0;

  if (isFinished) {
    return (
      <div
        className="card-glass animate-fade-up"
        style={{
          padding: '40px',
          width: '100%',
          maxWidth: '850px',
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <div>
          <span style={{ fontSize: '64px', animation: 'scalePop 0.5s ease-out' }}>🏆</span>
          <h2 style={{ fontSize: '32px', color: 'var(--primary)', marginTop: '10px' }}>Test Completed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Here is your typing performance snapshot</p>
        </div>

        {/* Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          <div style={{ background: 'rgba(255, 214, 10, 0.05)', border: '1px solid var(--primary-glow)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NET WPM</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)', marginTop: '5px' }}>{liveStats.netWpm}</div>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid var(--accent-glow)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ACCURACY</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent)', marginTop: '5px' }}>{liveStats.accuracy}%</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>RAW SPEED</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px' }}>{liveStats.rawWpm} WPM</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TIME ELAPSED</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '5px' }}>{Math.round(elapsedTime * 10) / 10}s</div>
          </div>
        </div>

        {/* Character Metrics */}
        <div style={{
          background: 'rgba(255,255,255,0.01)',
          border: '1px dashed var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '14px',
          color: 'var(--text-muted)'
        }}>
          <div>Correct Chars: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{correctKeystrokes - backspaces}</span></div>
          <div>Incorrect Chars: <span style={{ color: 'var(--error)', fontWeight: 700 }}>{Object.values(mistakesMap).reduce((a, b) => a + b, 0)}</span></div>
          <div>Backspaces: <span style={{ color: 'orange', fontWeight: 700 }}>{backspaces}</span></div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => resetState(text)}
            className="btn-secondary ripple-effect animate-fade-up"
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 700,
              gap: '10px',
              minWidth: '150px',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)'
            }}
          >
            ↻ Retry
          </button>
          
          {onNextTest && (
            <button
              onClick={onNextTest}
              className="btn-primary hover-glow animate-slide-in ripple-effect"
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 700,
                gap: '10px',
                minWidth: '170px',
                justifyContent: 'center',
                boxShadow: '0 0 15px var(--accent-glow)'
              }}
            >
              ▶ Next Test
            </button>
          )}

          <button
            onClick={onBack}
            className="btn-secondary ripple-effect"
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 700,
              gap: '10px',
              minWidth: '150px',
              justifyContent: 'center'
            }}
          >
            ⬅ Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '850px' }}>
      
      {/* Top Header details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          ⬅️ Leave Lesson
        </button>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {durationLimit > 0 && (
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              ⏱️ TIME LEFT: {timeLeft}s
            </span>
          )}
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{title}</h2>
        </div>
      </div>

      {/* Main glass workspace card */}
      <div
        onClick={handleArenaClick}
        className={`card-glass ${isShake ? 'shake-err' : ''}`}
        style={{
          padding: '30px',
          background: 'rgba(15, 23, 42, 0.45)',
          cursor: 'text',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '24px',
          position: 'relative'
        }}
      >
        {/* Failed Checkpoint Message Overlay */}
        {failedMsg && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 9, 11, 0.95)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            borderRadius: 'var(--radius-lg)'
          }}>
            <span style={{ fontSize: '48px' }}>❌</span>
            <div style={{ color: 'var(--error)', fontSize: '20px', fontWeight: 800 }}>{failedMsg}</div>
            <button onClick={onBack} className="btn-primary">Back to Roadmap</button>
          </div>
        )}

        {/* Statistics Bar with Combo Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', alignItems: 'center' }}>
            <div>SPEED: <span style={{ color: 'var(--primary)', fontSize: '18px' }}>{liveStats.netWpm} WPM</span></div>
            <div>RAW: <span style={{ color: 'var(--accent)', fontSize: '18px' }}>{liveStats.rawWpm} WPM</span></div>
            <div>ACCURACY: <span style={{ color: 'var(--success)', fontSize: '18px' }}>{liveStats.accuracy}%</span></div>
            <div>TIME: <span style={{ color: 'var(--text-primary)', fontSize: '18px' }}>{Math.round(elapsedTime * 10) / 10}s</span></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="btn-secondary ripple-effect"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: 'var(--radius-sm)',
                height: '34px',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Press Esc or Ctrl+R to restart"
            >
              <span
                className={isRotating ? 'refresh-rotate' : ''}
                style={{ display: 'inline-block', fontSize: '14px' }}
              >
                ↻
              </span>
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '-10px',
          position: 'relative'
        }}>
          <div style={{
            width: `${completionPercentage}%`,
            height: '100%',
            background: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent)',
            transition: 'width 0.2s ease-out'
          }} />
        </div>

        {/* Typing reference paragraph arena */}
        <div
          ref={textContainerRef}
          style={{
            textAlign: 'left',
            maxHeight: '140px',
            overflowY: 'auto',
            paddingRight: '10px',
            lineHeight: '1.8'
          }}
        >
          {renderWords()}
        </div>

        {/* Invisible input capture */}
        <input
          ref={inputRef}
          type="text"
          value=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none'
          }}
          disabled={isFinished || !!failedMsg}
        />

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
          *Click inside this area to focus. Press Escape or Ctrl+R to restart the test.
        </div>
      </div>

      {/* Keyboard Guidance overlay */}
      {showKeyboard && (
        <div style={{ marginTop: '10px' }}>
          <VirtualKeyboard targetKey={nextTargetChar} pressedKey={pressedKey} />
        </div>
      )}

    </div>
  );
};

