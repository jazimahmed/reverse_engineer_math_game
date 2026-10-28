// Active game session store (ephemeral, not persisted)
// Manages current question, counters, timer during a round

import { create } from 'zustand';
import { GameConstants } from '../constants/game';

export type GameMode =
  | 'addition_practice'
  | 'addition_quiz'
  | 'addition_duel'
  | 'addition_test'
  | 'addition_time'
  | 'addition_play'
  | 'addition_learn'
  | 'addition_exam'
  | 'equations_easy';

export interface QuestionState {
  n1: number;
  n2: number | '?';
  operator: '+' | '-' | 'x' | '÷' | '√';
  answer: number | '?';
  options: number[];
  correctOptionIndex: number;
  isTrueFalse?: boolean;
  missingOperand?: 'n2' | 'n1';
  display?: { n1?: string; n2?: string; answer?: string; options?: string[] };
  explanation?: string;
}

export interface DuelQuestionState {
  top: QuestionState;
  bottom: QuestionState;
}

export interface GameSessionState {
  sessionId: number;
  questionResolved: boolean;
  hadWrongAttempt: boolean;
  mode: GameMode | null;
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  duelChipTop: number;
  duelChipBottom: number;
  currentQuestion: QuestionState | DuelQuestionState | null;
  questionHistory: Array<{
    question: QuestionState;
    userAnswer: number | boolean | null;
    correct: boolean;
    firstTry: boolean;
  }>;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;

  startGame: (mode: GameMode, totalQuestions?: number, initialQuestion?: QuestionState | DuelQuestionState) => void;
  nextQuestion: (nextQuestion: QuestionState | DuelQuestionState, expectedSessionId?: number, expectedQuestionIndex?: number) => boolean;
  recordAnswer: (userAnswer: number | boolean, isCorrect: boolean, firstTry: boolean, expectedSessionId?: number, expectedQuestionIndex?: number) => boolean;
  recordDuelAnswer: (half: 'top' | 'bottom', isCorrect: boolean, expectedSessionId?: number, expectedQuestionIndex?: number) => boolean;
  setQuestion: (q: QuestionState | DuelQuestionState) => void;
  setTimeRemaining: (ms: number) => void;
  tickTime: (deltaMs: number, expectedSessionId?: number, expectedQuestionIndex?: number) => boolean;
  pause: () => void;
  resume: () => void;
  endGame: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: 0,
  questionResolved: false,
  hadWrongAttempt: false,
  mode: null,
  questionIndex: 0,
  totalQuestions: GameConstants.PRACTICE_QUESTIONS_PER_ROUND,
  greenChip: 0,
  redChip: 0,
  duelChipTop: 0,
  duelChipBottom: 0,
  currentQuestion: null,
  questionHistory: [],
  timeRemaining: 0,
  isActive: false,
  isPaused: false,
};

function isCurrent(state: GameSessionState, sessionId?: number, questionIndex?: number) {
  return state.isActive && !state.isPaused
    && (sessionId === undefined || state.sessionId === sessionId)
    && (questionIndex === undefined || state.questionIndex === questionIndex);
}

export const useGameSessionStore = create<GameSessionState>((set) => ({
  ...initialState,

  startGame: (mode, totalQuestions = GameConstants.PRACTICE_QUESTIONS_PER_ROUND, initialQuestion) => {
    set((state) => ({
      ...initialState,
      sessionId: state.sessionId + 1,
      questionHistory: [],
      mode,
      totalQuestions: Number.isFinite(totalQuestions) ? Math.max(1, Math.floor(totalQuestions)) : GameConstants.PRACTICE_QUESTIONS_PER_ROUND,
      questionIndex: 1,
      isActive: true,
      currentQuestion: initialQuestion ?? null,
      timeRemaining: mode === 'addition_time' ? GameConstants.TIME_PER_QUESTION_MS : 0,
    }));
  },

  nextQuestion: (nextQuestion, sessionId, questionIndex) => {
    let accepted = false;
    set((state) => {
      if (!isCurrent(state, sessionId, questionIndex) || !state.questionResolved) return state;
      accepted = true;
      if (state.questionIndex >= state.totalQuestions) return { isActive: false, isPaused: false };
      return {
        questionIndex: state.questionIndex + 1,
        currentQuestion: nextQuestion,
        questionResolved: false,
        hadWrongAttempt: false,
        timeRemaining: state.mode === 'addition_time' ? GameConstants.TIME_PER_QUESTION_MS : 0,
      };
    });
    return accepted;
  },

  recordAnswer: (userAnswer, isCorrect, _firstTry, sessionId, questionIndex) => {
    let resolved = false;
    set((state) => {
      if (!isCurrent(state, sessionId, questionIndex) || state.questionResolved
        || !state.currentQuestion || 'top' in state.currentQuestion) return state;
      const verdictMode = state.mode === 'addition_test' || state.mode === 'addition_time';
      if (!isCorrect) {
        // Exam is single-attempt: a wrong choice resolves the question.
        if (state.mode === 'addition_exam') {
          resolved = true;
          return {
            questionResolved: true, hadWrongAttempt: true, redChip: state.redChip + 1,
            questionHistory: [...state.questionHistory, { question: state.currentQuestion, userAnswer, correct: false, firstTry: true }],
          };
        }
        if (state.hadWrongAttempt) return state;
        return { hadWrongAttempt: true, redChip: state.redChip + (verdictMode ? 1 : 0) };
      }
      resolved = true;
      const firstTry = !state.hadWrongAttempt;
      return {
        questionResolved: true,
        greenChip: state.greenChip + (firstTry ? 1 : 0),
        redChip: state.redChip + (!firstTry && !verdictMode ? 1 : 0),
        questionHistory: [...state.questionHistory, { question: state.currentQuestion, userAnswer, correct: true, firstTry }],
      };
    });
    return resolved;
  },

  recordDuelAnswer: (half, isCorrect, sessionId, questionIndex) => {
    let resolved = false;
    set((state) => {
      if (!isCurrent(state, sessionId, questionIndex) || state.questionResolved
        || state.mode !== 'addition_duel' || !state.currentQuestion || !('top' in state.currentQuestion)) return state;
      const chips = half === 'bottom'
        ? { duelChipTop: state.duelChipTop + (isCorrect ? 1 : -1) }
        : { duelChipBottom: state.duelChipBottom + (isCorrect ? 1 : -1) };
      if (!isCorrect) return { ...chips, hadWrongAttempt: true };
      resolved = true;
      const question = state.currentQuestion[half];
      return {
        ...chips,
        questionResolved: true,
        questionHistory: [...state.questionHistory, {
          question, userAnswer: question.options[question.correctOptionIndex], correct: true, firstTry: !state.hadWrongAttempt,
        }],
      };
    });
    return resolved;
  },

  // Legacy initialization only; live replacements belong to nextQuestion.
  setQuestion: (q) => set((state) => isCurrent(state) && !state.currentQuestion && !state.questionResolved ? { currentQuestion: q } : state),

  setTimeRemaining: (ms) => set((state) => isCurrent(state) && !state.questionResolved && Number.isFinite(ms) ? { timeRemaining: Math.max(0, ms) } : state),

  tickTime: (deltaMs, sessionId, questionIndex) => {
    let expired = false;
    set((state) => {
      if (!isCurrent(state, sessionId, questionIndex) || state.questionResolved || state.mode !== 'addition_time'
        || !state.currentQuestion || 'top' in state.currentQuestion || !Number.isFinite(deltaMs) || deltaMs <= 0) return state;
      const remaining = Math.max(0, state.timeRemaining - deltaMs);
      if (remaining > 0) return { timeRemaining: remaining };
      expired = true;
      return {
        timeRemaining: 0,
        questionResolved: true,
        // Product policy: timeout is one red outcome, including after a wrong verdict.
        redChip: state.redChip + (state.hadWrongAttempt ? 0 : 1),
        questionHistory: [...state.questionHistory, {
          question: state.currentQuestion, userAnswer: null, correct: false, firstTry: false,
        }],
      };
    });
    return expired;
  },

  pause: () => set((state) => state.isActive && !state.isPaused ? { isPaused: true } : state),
  resume: () => set((state) => state.isActive && state.isPaused ? { isPaused: false } : state),

  endGame: () => set({ isActive: false, isPaused: false }),

  reset: () => set((state) => ({ ...initialState, sessionId: state.sessionId + 1, questionHistory: [] })),
}));
