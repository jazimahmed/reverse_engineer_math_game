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
  | 'equations_easy';

export interface QuestionState {
  n1: number;
  n2: number | '?';
  operator: '+' | '-' | 'x' | '÷';
  answer: number | '?';
  options: number[];
  correctOptionIndex: number;
  isTrueFalse?: boolean;
  missingOperand?: 'n2' | 'n1';
}

export interface DuelQuestionState {
  top: QuestionState;
  bottom: QuestionState;
}

export interface GameSessionState {
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

  startGame: (mode: GameMode, totalQuestions?: number) => void;
  nextQuestion: () => void;
  recordAnswer: (userAnswer: number | boolean, isCorrect: boolean, firstTry: boolean) => void;
  recordDuelAnswer: (half: 'top' | 'bottom', isCorrect: boolean) => void;
  setQuestion: (q: QuestionState | DuelQuestionState) => void;
  setTimeRemaining: (ms: number) => void;
  tickTime: (deltaMs: number) => void;
  pause: () => void;
  resume: () => void;
  endGame: () => void;
  reset: () => void;
}

const initialState = {
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

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  ...initialState,

  startGame: (mode, totalQuestions = GameConstants.PRACTICE_QUESTIONS_PER_ROUND) => {
    const isTime = mode === 'addition_time';
    set({
      ...initialState,
      mode,
      totalQuestions,
      questionIndex: 1,
      isActive: true,
      isPaused: false,
      duelChipTop: 0,
      duelChipBottom: 0,
      timeRemaining: isTime ? GameConstants.TIME_PER_QUESTION_MS : 0,
    });
  },

  nextQuestion: () =>
    set((state) => ({
      questionIndex: state.questionIndex + 1,
      timeRemaining: state.mode === 'addition_time' ? GameConstants.TIME_PER_QUESTION_MS : state.timeRemaining,
    })),

  recordAnswer: (userAnswer, isCorrect, firstTry) =>
    set((state) => {
      const history = [
        ...state.questionHistory,
        { question: state.currentQuestion as QuestionState, userAnswer, correct: isCorrect, firstTry },
      ];
      if (isCorrect) {
        if (firstTry) {
          return { greenChip: state.greenChip + 1, questionHistory: history };
        } else {
          return { redChip: state.redChip + 1, questionHistory: history };
        }
      } else {
        return { questionHistory: history };
      }
    }),

  recordDuelAnswer: (half, isCorrect) =>
    set((state) => {
      if (half === 'bottom') {
        return { duelChipTop: state.duelChipTop + (isCorrect ? 1 : -1) };
      } else {
        return { duelChipBottom: state.duelChipBottom + (isCorrect ? 1 : -1) };
      }
    }),

  setQuestion: (q) => set({ currentQuestion: q }),

  setTimeRemaining: (ms) => set({ timeRemaining: ms }),

  tickTime: (deltaMs) =>
    set((state) => {
      if (!state.isActive || state.isPaused || state.mode !== 'addition_time') return state;
      const next = state.timeRemaining - deltaMs;
      if (next <= 0) {
        return { timeRemaining: GameConstants.TIME_PER_QUESTION_MS, questionIndex: state.questionIndex + 1 };
      }
      return { timeRemaining: next };
    }),

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),

  endGame: () => set({ isActive: false, isPaused: false }),

  reset: () => set(initialState),
}));