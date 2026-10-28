import { GameConstants } from '../constants/game';
import type { GameMode, GameSessionState, QuestionState, DuelQuestionState } from '../store/gameSessionStore';

type Question = QuestionState | DuelQuestionState;
type SessionStore = { getState: () => GameSessionState };

export interface RoundClock {
  now: () => number;
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
  setInterval: (callback: () => void, ms: number) => unknown;
  clearInterval: (handle: unknown) => void;
}

const defaultClock: RoundClock = {
  now: () => Date.now(),
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  setInterval: (callback, ms) => setInterval(callback, ms),
  clearInterval: (handle) => clearInterval(handle as ReturnType<typeof setInterval>),
};

// Own the screen's timers and transitions together. Store guards also reject
// stale events, so an old screen/question cannot resolve a newer session.
export function createGameRoundController({
  store,
  mode,
  createQuestion,
  onComplete,
  totalQuestions = GameConstants.PRACTICE_QUESTIONS_PER_ROUND,
  clock = defaultClock,
}: {
  store: SessionStore;
  mode: GameMode;
  createQuestion: () => Question;
  onComplete: (state: GameSessionState) => void;
  totalQuestions?: number;
  clock?: RoundClock;
}) {
  store.getState().startGame(mode, totalQuestions, createQuestion());
  const sessionId = store.getState().sessionId;
  let disposed = false;
  let completed = false;
  let transition: unknown;
  let interval: unknown;
  let lastTick = clock.now();

  const ownsSession = () => !disposed && store.getState().sessionId === sessionId;
  const clearTransition = () => {
    if (transition !== undefined) clock.clearTimeout(transition);
    transition = undefined;
  };
  const clearTimers = () => {
    clearTransition();
    if (interval !== undefined) clock.clearInterval(interval);
    interval = undefined;
  };

  const advance = (questionIndex: number) => {
    if (!ownsSession()) return;
    const state = store.getState();
    if (!state.isActive || state.isPaused || !state.questionResolved || state.questionIndex !== questionIndex) return;
    const next = questionIndex < state.totalQuestions ? createQuestion() : state.currentQuestion!;
    if (!state.nextQuestion(next, sessionId, questionIndex)) return;
    lastTick = clock.now();
    const updated = store.getState();
    if (!updated.isActive && !completed) {
      completed = true;
      clearTimers();
      onComplete(updated);
    }
  };

  const scheduleAdvance = () => {
    if (!ownsSession()) return;
    const state = store.getState();
    if (!state.isActive || state.isPaused || !state.questionResolved || transition !== undefined) return;
    const index = state.questionIndex;
    if (mode === 'addition_time') {
      advance(index);
    } else {
      transition = clock.setTimeout(() => {
        transition = undefined;
        advance(index);
      }, GameConstants.QUESTION_TRANSITION_MS);
    }
  };

  const syncTime = () => {
    if (!ownsSession()) return;
    const now = clock.now();
    const elapsed = Math.max(0, now - lastTick);
    lastTick = now;
    const state = store.getState();
    if (mode === 'addition_time' && state.tickTime(elapsed, sessionId, state.questionIndex)) {
      scheduleAdvance();
    }
  };

  if (mode === 'addition_time') interval = clock.setInterval(syncTime, 100);

  return {
    sessionId,
    answer(userAnswer: number | boolean, isCorrect: boolean, firstTry: boolean, questionIndex: number) {
      if (!ownsSession()) return;
      // Check elapsed time before accepting input at the deadline. If it expired,
      // the old index is rejected rather than answering the newly loaded question.
      syncTime();
      if (store.getState().recordAnswer(userAnswer, isCorrect, firstTry, sessionId, questionIndex)) scheduleAdvance();
    },
    duelAnswer(half: 'top' | 'bottom', isCorrect: boolean, questionIndex: number) {
      if (!ownsSession()) return;
      if (store.getState().recordDuelAnswer(half, isCorrect, sessionId, questionIndex)) scheduleAdvance();
    },
    pause() {
      if (!ownsSession()) return;
      syncTime();
      store.getState().pause();
      clearTransition();
    },
    resume() {
      if (!ownsSession()) return;
      lastTick = clock.now();
      store.getState().resume();
      scheduleAdvance();
    },
    dispose() {
      clearTimers();
      if (ownsSession()) store.getState().endGame();
      disposed = true;
    },
  };
}
