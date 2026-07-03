export interface LessonConfig {
  number: number;
  chapterId: number;
  chapterTitle: string;
  title: string;
  objective: string;
  text: string;
  mode: 'block-on-error' | 'free-typing';
  specialType: 'normal' | 'speed-challenge' | 'accuracy-only' | 'blind' | 'code' | 'checkpoint';
  targetKeys: string;
  minAccuracy: number;
  minWpm: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master';
}

// Simple deterministic string selector based on a lesson index seed
const getSeededItem = <T>(arr: T[], seed: number): T => {
  const index = Math.abs(Math.floor(seed * 31 + 17)) % arr.length;
  return arr[index];
};

const getSeededSample = <T>(arr: T[], count: number, seed: number): T[] => {
  const result: T[] = [];
  const copied = [...arr];
  let localSeed = seed;
  for (let i = 0; i < count; i++) {
    localSeed = (localSeed * 9301 + 49297) % 233280;
    const index = Math.floor((localSeed / 233280) * copied.length);
    if (copied.length > 0) {
      result.push(copied.splice(index, 1)[0]);
    }
  }
  return result;
};

// Word lists for various generator types
const HOME_ROW_WORDS = ["dad", "fad", "lad", "all", "ask", "sad", "lass", "fall", "dull", "daddy", "flask", "alas", "salad"];
const ALPHABET_WORDS = ["about", "bread", "clear", "dream", "early", "flame", "giant", "house", "image", "juice", "knife", "lemon", "mouse", "night", "ocean", "paper", "queen", "river", "stone", "tiger", "union", "voice", "water", "xenon", "yield", "zebra"];
const TECH_WORDS = ["computer", "keyboard", "monitor", "software", "database", "network", "internet", "browser", "compiler", "terminal", "server", "algorithm", "variable", "function", "protocol", "security", "framework", "scripting", "interface"];
const ACADEMIC_WORDS = ["analysis", "hypothesis", "theory", "evidence", "conclusion", "methodology", "significant", "interpret", "identify", "evaluate", "context", "principle", "formula", "research", "academic", "definition"];
const SHIFT_WORDS = ["London", "Paris", "Tokyo", "Berlin", "New York", "Chicago", "Microsoft", "Google", "Apple", "React", "TypeScript", "Python", "JavaScript", "Linux", "Windows", "GitHub", "Vercel", "Prisma", "SQL"];

const PRO_SENTENCES = [
  "Please review the attached project documentation before our meeting tomorrow morning.",
  "Our deployment pipeline has successfully completed all staging integration checks.",
  "The system architect recommended refactoring the legacy authentication controller.",
  "Weekly analytics report indicates a twelve percent increase in search conversion rates.",
  "Please submit your feedback regarding the database schema updates by Friday evening."
];

const CODE_TEMPLATES = [
  "const calculateWpm = (chars, time) => {\n  return (chars / 5) / (time / 60);\n};",
  "def fetch_user_data(user_id):\n    return db.query('SELECT * FROM users WHERE id = %s', user_id)",
  "import { useState, useEffect } from 'react';\nexport const Toggle = () => {\n  const [on, setOn] = useState(false);\n};",
  ".card-glass {\n  background: rgba(15, 23, 42, 0.45);\n  backdrop-filter: blur(12px);\n  border: 1px solid var(--border);\n}",
  "{\"status\": \"success\", \"data\": {\"id\": 948, \"score\": 98.4, \"streak\": 7}}"
];

export const generateLesson = (lessonNum: number): LessonConfig => {
  // Determine Chapter details
  let chapterId = 1;
  let chapterTitle = "Getting Started";
  let difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master' = 'easy';
  let mode: 'block-on-error' | 'free-typing' = 'block-on-error';
  let specialType: 'normal' | 'speed-challenge' | 'accuracy-only' | 'blind' | 'code' | 'checkpoint' = 'normal';
  let targetKeys = "";
  let objective = "";
  let text = "";
  let minAccuracy = 90;
  let minWpm = 10;

  // Distribute 700 lessons into 12 Chapters
  if (lessonNum <= 20) {
    // Chapter 1: Getting Started (1-20)
    chapterId = 1;
    chapterTitle = "Getting Started";
    difficulty = 'easy';
    mode = 'block-on-error';
    
    // Key sequences
    if (lessonNum <= 4) {
      targetKeys = "f j";
      objective = "Introduce home row anchors: F and J. Feel the bumps on your keyboard.";
      text = "ff jj fjfj jfjf fff jjj f j f j fff jjj fjfj jfjf";
    } else if (lessonNum <= 8) {
      targetKeys = "d k";
      objective = "Introduce middle finger keys: D and K.";
      text = "dd kk dkdk kdkd ddd kkk d k d k ddd kkk dkdk kdkd";
    } else if (lessonNum <= 12) {
      targetKeys = "s l";
      objective = "Introduce ring finger keys: S and L.";
      text = "ss ll slsl lsls sss lll s l s l sss lll slsl lsls";
    } else if (lessonNum <= 16) {
      targetKeys = "a ;";
      objective = "Introduce pinky finger keys: A and Semicolon (;).";
      text = "aa ;; a;a; ;a;a aaa ;;; a ; a ; aaa ;;; a;a; ;a;a";
    } else {
      targetKeys = "asdf jkl;";
      objective = "Combine all home row keys. Establish comfortable finger posture.";
      text = "asdf jkl; fdsa ;lkj asdfjkl; fdsa;lkj fff jjj ddd kkk sss lll aaa ;;;";
    }
  } 
  else if (lessonNum <= 60) {
    // Chapter 2: Home Row Mastery (21-60)
    chapterId = 2;
    chapterTitle = "Home Row Mastery";
    difficulty = 'normal';
    mode = 'block-on-error';
    targetKeys = "asdf jkl;";
    
    const sampleWords = getSeededSample(HOME_ROW_WORDS, 5, lessonNum);
    text = sampleWords.join(" ") + " " + sampleWords.reverse().join(" ");
    objective = "Master home row combinations and start typing basic English words.";

    // Insert special checkpoint or accuracy-only modes
    if (lessonNum % 15 === 0) {
      specialType = 'accuracy-only';
      minAccuracy = 95;
      objective = "Checkpoint Exam! Maintain at least 95% accuracy to complete this lesson.";
    }
  }
  else if (lessonNum <= 140) {
    // Chapter 3: Top Row (61-140)
    chapterId = 3;
    chapterTitle = "Top Row";
    difficulty = 'normal';
    mode = 'block-on-error';
    
    // 10 top row keys distributed: Q, W, E, R, T, Y, U, I, O, P
    // Each key takes 8 lessons
    const keyOffset = Math.floor((lessonNum - 61) / 8);
    const topRowKeys = ['E', 'I', 'R', 'U', 'T', 'Y', 'W', 'O', 'Q', 'P'];
    const activeKey = topRowKeys[Math.min(keyOffset, 9)];
    targetKeys = activeKey.toLowerCase();
    
    const cycle = (lessonNum - 61) % 8;
    if (cycle === 0) {
      objective = `Introduce top row key: ${activeKey}. Slide your finger up, then return to home row.`;
      text = `${targetKeys}${targetKeys}f ${targetKeys}${targetKeys}j ${targetKeys}f${targetKeys} f${targetKeys}f j${targetKeys}j ${targetKeys}${targetKeys}f ${targetKeys}${targetKeys}j`;
    } else if (cycle <= 3) {
      objective = `Type words incorporating the letter ${activeKey}.`;
      // Filter words containing activeKey
      const matchingWords = ALPHABET_WORDS.filter(w => w.includes(targetKeys));
      const list = matchingWords.length > 0 ? matchingWords : ["use", "try", "wet", "row", "top"];
      text = getSeededSample(list, 5, lessonNum).join(" ");
    } else if (cycle <= 6) {
      mode = 'free-typing';
      objective = `Practice full sentences using top row key: ${activeKey}.`;
      const sentences = [
        `we write code using the keyboard daily.`,
        `try to look at the screen instead of your fingers.`,
        `quick typing speeds require patient home row anchor posture.`
      ];
      text = getSeededItem(sentences, lessonNum);
    } else {
      mode = 'free-typing';
      specialType = 'speed-challenge';
      minWpm = 25;
      objective = `Speed Challenge! Reach a minimum of 25 WPM typing top row combinations.`;
      text = "quiet write route power write type out root write wire wet";
    }
  }
  else if (lessonNum <= 220) {
    // Chapter 4: Bottom Row (141-220)
    chapterId = 4;
    chapterTitle = "Bottom Row";
    difficulty = 'normal';
    mode = 'block-on-error';

    // 10 bottom row keys: Z, X, C, V, B, N, M, comma, period, slash
    const keyOffset = Math.floor((lessonNum - 141) / 8);
    const bottomRowKeys = ['V', 'M', 'C', ',', 'X', '.', 'Z', '/', 'B', 'N'];
    const activeKey = bottomRowKeys[Math.min(keyOffset, 9)];
    targetKeys = activeKey.toLowerCase();

    const cycle = (lessonNum - 141) % 8;
    if (cycle === 0) {
      objective = `Introduce bottom row key: ${activeKey}. Slide your finger down, then return to home row.`;
      text = `${targetKeys}${targetKeys}f ${targetKeys}${targetKeys}j ${targetKeys}f${targetKeys} f${targetKeys}f j${targetKeys}j ${targetKeys}${targetKeys}f`;
    } else if (cycle <= 3) {
      objective = `Type words incorporating the bottom row key: ${activeKey}.`;
      const matchingWords = ALPHABET_WORDS.filter(w => w.includes(targetKeys));
      const list = matchingWords.length > 0 ? matchingWords : ["box", "van", "zip", "man", "cab"];
      text = getSeededSample(list, 5, lessonNum).join(" ");
    } else {
      mode = 'free-typing';
      objective = `Practice sentences using bottom row keys.`;
      const sentences = [
        "the zebra jumped over the brick box.",
        "maintain consistency and slow down on commas and periods.",
        "zinc normal cyclic vocal back normal zinc zone cab back normal."
      ];
      text = getSeededItem(sentences, lessonNum);
    }

    if (lessonNum % 16 === 0) {
      specialType = 'blind';
      objective = "Blind Typing! Focus purely on memory. Target text is shown, but typed letters are invisible.";
    }
  }
  else if (lessonNum <= 280) {
    // Chapter 5: Complete Alphabet (221-280)
    chapterId = 5;
    chapterTitle = "Complete Alphabet";
    difficulty = 'normal';
    mode = 'free-typing';
    targetKeys = "a-z";
    objective = "Practice mixed alphabet layouts. Achieve balanced left/right hand rhythms.";
    
    const sampleWords = getSeededSample(ALPHABET_WORDS, 8, lessonNum);
    text = sampleWords.join(" ");

    if (lessonNum % 20 === 0) {
      specialType = 'checkpoint';
      minAccuracy = 94;
      minWpm = 30;
      objective = "Chapter Checkpoint! Validate speed (30+ WPM) and accuracy (94%+) across all rows.";
    }
  }
  else if (lessonNum <= 340) {
    // Chapter 6: Capital Letters (281-340)
    chapterId = 6;
    chapterTitle = "Capital Letters";
    difficulty = 'normal';
    mode = 'free-typing';
    targetKeys = "Shift keys";
    objective = "Master Shift keys. Hold Shift with opposite pinky while typing the uppercase character.";

    if (lessonNum % 5 === 0) {
      text = getSeededSample(SHIFT_WORDS, 6, lessonNum).join(" ");
    } else {
      const sentences = [
        "The quick Brown Fox jumps over the lazy Dog.",
        "React is a Javascript library, while Python is widely used for AI.",
        "London, Paris, Berlin, and Tokyo are major cities across the Globe."
      ];
      text = getSeededItem(sentences, lessonNum);
    }
  }
  else if (lessonNum <= 420) {
    // Chapter 7: Numbers (341-420)
    chapterId = 7;
    chapterTitle = "Numbers";
    difficulty = 'hard';
    mode = 'free-typing';
    targetKeys = "0-9";
    objective = "Introduce top number row. Extend fingers upwards carefully.";

    const cycle = (lessonNum - 341) % 10;
    if (cycle < 5) {
      // Direct digits practice
      const nums = [];
      for (let i = 0; i < 8; i++) {
        nums.push(Math.floor(Math.random() * 100).toString());
      }
      text = nums.join(" ");
      objective = "Type numerical digit blocks.";
    } else {
      const mathSentences = [
        "The coordinates are 40.7128 degrees North and 74.0060 degrees West.",
        "In 2026, the company growth scaled by 15 percent, netting 349000 dollars.",
        "Contact sales support at 1800-459-2918 or email code 948-291."
      ];
      text = getSeededItem(mathSentences, lessonNum);
      objective = "Type numbers embedded in sentences.";
    }
  }
  else if (lessonNum <= 500) {
    // Chapter 8: Symbols & Punctuation (421-500)
    chapterId = 8;
    chapterTitle = "Symbols & Punctuation";
    difficulty = 'hard';
    mode = 'free-typing';
    targetKeys = "Special characters";
    objective = "Practice Shifted number keys and math operators.";

    const templates = [
      "Let's write a formula: total = (price * count) + tax; // 15% rate",
      "Is this user data: { id: 29, active: true, email: 'user@domain.com' }?",
      "Warning: code matches config [1..5], threshold >= 98%, status: 'OK'!",
      "Find code at path: /usr/local/bin/node. Is it active? Yes/No."
    ];
    text = getSeededItem(templates, lessonNum);
  }
  else if (lessonNum <= 560) {
    // Chapter 9: Word Mastery (501-560)
    chapterId = 9;
    chapterTitle = "Word Mastery";
    difficulty = 'hard';
    mode = 'free-typing';
    targetKeys = "Academic & Technical words";
    objective = "Fluently key academic, technology, and business vocabularies.";

    const wordPool = [...TECH_WORDS, ...ACADEMIC_WORDS];
    text = getSeededSample(wordPool, 8, lessonNum).join(" ");
  }
  else if (lessonNum <= 620) {
    // Chapter 10: Sentence Mastery (561-620)
    chapterId = 10;
    chapterTitle = "Sentence Mastery";
    difficulty = 'hard';
    mode = 'free-typing';
    targetKeys = "Sentences";
    objective = "Type complex English sentences with advanced grammar constructs.";

    text = getSeededItem(PRO_SENTENCES, lessonNum);
  }
  else if (lessonNum <= 660) {
    // Chapter 11: Paragraph Typing (621-660)
    chapterId = 11;
    chapterTitle = "Paragraph Typing";
    difficulty = 'expert';
    mode = 'free-typing';
    targetKeys = "Endurance paragraphs";
    objective = "Maintain speed and precision across dense paragraph stories.";

    const paragraphs = [
      "Developing fluent typing habits is similar to learning a musical instrument. At first, you must focus deliberately on every note or key. Over time, these actions sink deep into your motor cortex, transforming deliberate thoughts into automatic expressions.",
      "Vibrant colors, dark backgrounds, and smooth transitions are key aesthetics in premium user interface designs. When designing applications, developers always aim to merge aesthetic excellence with accessibility and light build payloads.",
      "The rapid rise of web frameworks revolutionized application scaling. Today, single page client engines can handle caching, state routing, and audio synthesis entirely on the client, delivering native desktop performance."
    ];
    text = getSeededItem(paragraphs, lessonNum);
  }
  else {
    // Chapter 12: Professional Typing (661-700)
    chapterId = 12;
    chapterTitle = "Professional Typing";
    difficulty = 'master';
    mode = 'free-typing';
    targetKeys = "Code & Reports";
    objective = "The absolute pro level. Type code blocks and technical documents.";

    if (lessonNum === 700) {
      specialType = 'checkpoint';
      minAccuracy = 96;
      minWpm = 45;
      objective = "The Final Checkpoint! Reach 45+ WPM with 96%+ accuracy to unlock your Typing Legend Rank!";
      text = "TypeLearner AI curriculum complete! Unlocked Professional Typist status at 100% precision.";
    } else if (lessonNum % 2 === 0) {
      specialType = 'code';
      text = getSeededItem(CODE_TEMPLATES, lessonNum);
    } else {
      text = getSeededItem(PRO_SENTENCES, lessonNum) + "\n" + getSeededItem(CODE_TEMPLATES, lessonNum);
    }
  }

  // Adjust thresholds based on difficulty
  if (difficulty === 'normal') {
    minAccuracy = Math.max(minAccuracy, 92);
    minWpm = Math.max(minWpm, 20);
  } else if (difficulty === 'hard') {
    minAccuracy = Math.max(minAccuracy, 94);
    minWpm = Math.max(minWpm, 30);
  } else if (difficulty === 'expert') {
    minAccuracy = Math.max(minAccuracy, 95);
    minWpm = Math.max(minWpm, 35);
  } else if (difficulty === 'master') {
    minAccuracy = Math.max(minAccuracy, 96);
    minWpm = Math.max(minWpm, 40);
  }

  return {
    number: lessonNum,
    chapterId,
    chapterTitle,
    title: `Lesson ${lessonNum}: ${targetKeys ? `Key ${targetKeys.toUpperCase()} drill` : "Drill"}`,
    objective,
    text,
    mode,
    specialType,
    targetKeys,
    minAccuracy,
    minWpm,
    difficulty
  };
};
