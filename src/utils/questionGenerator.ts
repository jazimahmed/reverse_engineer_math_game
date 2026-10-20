// Question generators for Addition modes
// Evidence: E-RT-005, E-RT-018, E-RT-020, E-RT-021, E-RT-023, E-RT-024

import { QuestionState } from '../store/gameSessionStore';
import { GameConstants } from '../constants/game';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate 4 options including the correct answer
function generateOptions(correct: number, range: number = 20): number[] {
  const options = new Set<number>();
  options.add(correct);
  while (options.size < 4) {
    const variation = Math.floor(Math.random() * range) - range / 2;
    const opt = Math.max(0, correct + variation);
    if (opt !== correct) options.add(opt);
  }
  return shuffle(Array.from(options));
}

export interface GeneratedQuestion {
  n1: number;
  n2: number | '?';
  operator: '+' | '-' | 'x' | '÷';
  answer: number | '?';
  options: number[];
  correctOptionIndex: number;
  isTrueFalse?: boolean;
  missingOperand?: 'n2' | 'n1';
}

export function generatePracticeQuestion(): GeneratedQuestion {
  // Addition Game 1: operands 0..10 (E-RT-005, E-RT-018)
  const min = GameConstants.ADDITION_GAME1_MIN_OPERAND;
  const max = GameConstants.ADDITION_GAME1_MAX_OPERAND;
  const n1 = Math.floor(Math.random() * (max - min + 1)) + min;
  const n2 = Math.floor(Math.random() * (max - min + 1)) + min;
  const answer = n1 + n2;
  const options = generateOptions(answer);
  const correctOptionIndex = options.indexOf(answer);

  return {
    n1,
    n2,
    operator: '+',
    answer,
    options,
    correctOptionIndex,
  };
}

export function generateQuizQuestion(): GeneratedQuestion {
  // Missing operand: n1 + ? = answer (E-RT-023)
  const min = GameConstants.ADDITION_GAME1_MIN_OPERAND;
  const max = GameConstants.ADDITION_GAME1_MAX_OPERAND;
  const n1 = Math.floor(Math.random() * (max - min + 1)) + min;
  const n2 = Math.floor(Math.random() * (max - min + 1)) + min;
  const answer = n1 + n2;
  const options = generateOptions(n2);
  const correctOptionIndex = options.indexOf(n2);

  return {
    n1,
    n2: '?',
    operator: '+',
    answer,
    options,
    correctOptionIndex,
    missingOperand: 'n2',
  };
}

export function generateTestQuestion(): GeneratedQuestion {
  // True/False: complete equation, some correct some incorrect (E-RT-021, E-RT-024)
  const min = GameConstants.ADDITION_GAME1_MIN_OPERAND;
  const max = GameConstants.ADDITION_GAME1_MAX_OPERAND;
  const n1 = Math.floor(Math.random() * (max - min + 1)) + min;
  const n2 = Math.floor(Math.random() * (max - min + 1)) + min;
  const realAnswer = n1 + n2;
  const isCorrect = Math.random() < 0.5;
  const shownAnswer = isCorrect ? realAnswer : realAnswer + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);

  return {
    n1,
    n2,
    operator: '+',
    answer: shownAnswer,
    options: [1, 0], // True=1, False=0 (mapped to True/False in UI)
    correctOptionIndex: isCorrect ? 0 : 1,
    isTrueFalse: true,
  };
}

// For Duel - same question on both halves
export function generateDuelQuestion(): { top: GeneratedQuestion; bottom: GeneratedQuestion } {
  const q = generatePracticeQuestion();
  return { top: q, bottom: q };
}