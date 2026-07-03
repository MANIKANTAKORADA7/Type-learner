export interface KeystrokeEvent {
  timestamp: number;
  expectedChar: string;
  typedChar: string;
  isCorrect: boolean;
  wordIndex: number;
  charIndex: number;
  reactionTime: number; // millisecond difference since the last keypress
}

export interface WordRecord {
  expectedWord: string;
  typedWord: string;
  isCorrect: boolean;
  isWrong: boolean;
  timeTaken: number; // in milliseconds
  errors: number;
  corrections: number;
  wpm: number;
}

export interface SessionSnapshot {
  second: number;
  netWpm: number;
  grossWpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
}

export interface FinalSessionStats {
  netWpm: number;
  grossWpm: number;
  rawWpm: number;
  accuracy: number;
  elapsedTime: number; // in seconds
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  backspaces: number;
  wordsCompleted: number;
  wrongWords: number;
  skippedWords: number;
  consistency: number;
  historySnapshot: SessionSnapshot[];
  wordHistory: WordRecord[];
  keystrokeLog: KeystrokeEvent[];
}
