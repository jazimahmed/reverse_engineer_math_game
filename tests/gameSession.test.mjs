import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import loadTypeScript from './helpers/loadTypeScript.cjs';

const { useGameSessionStore: store } = loadTypeScript(fileURLToPath(new URL('../src/store/gameSessionStore.ts', import.meta.url)));
const state = () => store.getState();
const question = (n = 1) => ({ n1: n, n2: 2, operator: '+', answer: n + 2, options: [n + 2, n + 3], correctOptionIndex: 0 });
const start = (mode = 'addition_practice', total = 10) => state().startGame(mode, total, question());
const identity = () => [state().sessionId, state().questionIndex];
beforeEach(() => state().reset());

test('ten questions advance atomically, reset question state, and complete once at index ten', () => {
  start();
  const observations = [];
  const unsubscribe = store.subscribe((next) => observations.push(next));
  try {
    for (let i = 1; i <= 10; i++) {
      const ids = identity();
      assert.equal(state().questionIndex, i);
      assert.equal(state().currentQuestion.n1, i);
      assert.equal(state().nextQuestion(question(99), ...ids), false);
      assert.equal(state().recordAnswer(0, false, true, ...ids), false);
      assert.equal(state().recordAnswer(i + 2, true, true, ...ids), true);
      const beforeAdvance = observations.length;
      assert.equal(state().nextQuestion(question(i + 1), ...ids), true);
      assert.equal(observations.length, beforeAdvance + 1);
      if (i < 10) {
        assert.equal(state().questionIndex, i + 1);
        assert.equal(state().currentQuestion.n1, i + 1);
        assert.equal(state().questionResolved, false);
        assert.equal(state().hadWrongAttempt, false);
      }
      assert.equal(state().nextQuestion(question(99), ...ids), false);
    }
    assert.equal(state().questionIndex, 10);
    assert.equal(state().isActive, false);
    assert.equal(state().redChip, 10);
    assert.equal(state().greenChip, 0);
    assert.equal(state().questionHistory.length, 10);
    assert.deepEqual(state().questionHistory.map((row) => row.question.n1), [1,2,3,4,5,6,7,8,9,10]);
  } finally { unsubscribe(); }
});

for (const mode of ['addition_practice', 'addition_quiz', 'addition_test', 'addition_time']) {
  test(`${mode}: wrong-wrong-correct deduplicates score/history and ignores caller firstTry`, () => {
    start(mode);
    const verdict = mode === 'addition_test' || mode === 'addition_time';
    assert.equal(state().recordAnswer(4, false, true), false);
    assert.equal(state().redChip, verdict ? 1 : 0);
    assert.equal(state().recordAnswer(4, false, true), false);
    assert.equal(state().questionHistory.length, 0);
    assert.equal(state().questionResolved, false);
    assert.equal(state().recordAnswer(3, true, true), true);
    assert.equal(state().redChip, 1);
    assert.equal(state().greenChip, 0);
    assert.deepEqual(state().questionHistory, [{ question: question(), userAnswer: 3, correct: true, firstTry: false }]);
    const resolved = state();
    assert.equal(state().recordAnswer(3, true, false), false);
    assert.equal(state().recordAnswer(4, false, true), false);
    assert.equal(state(), resolved);
    state().nextQuestion(question(2));
    assert.equal(state().recordAnswer(4, true, false), true);
    assert.equal(state().greenChip, 1);
    assert.equal(state().questionHistory[1].firstTry, true);
  });
}

for (const wrongFirst of [false, true]) {
  test(`timeout records one red outcome, prior wrong=${wrongFirst}`, () => {
    start('addition_time');
    if (wrongFirst) state().recordAnswer(false, false, true);
    assert.equal(state().timeRemaining, 4500);
    assert.equal(state().tickTime(1000), false);
    assert.equal(state().timeRemaining, 3500);
    assert.equal(state().tickTime(4000), true);
    assert.equal(state().timeRemaining, 0);
    assert.equal(state().questionIndex, 1);
    assert.equal(state().questionResolved, true);
    assert.equal(state().redChip, 1);
    assert.deepEqual(state().questionHistory, [{ question: question(), userAnswer: null, correct: false, firstTry: false }]);
    const expired = state();
    assert.equal(state().tickTime(4500), false);
    assert.equal(state(), expired);
    assert.equal(state().nextQuestion(question(2)), true);
    assert.equal(state().timeRemaining, 4500);
    assert.equal(state().hadWrongAttempt, false);
    assert.equal(state().questionResolved, false);
  });
}

test('ten expiries finish the round; inactive and beyond-round ticks cannot mutate it', () => {
  const idle = state();
  assert.equal(state().tickTime(4500), false);
  assert.equal(state(), idle);
  start('addition_time');
  for (let i = 1; i <= 10; i++) {
    assert.equal(state().tickTime(4500), true);
    assert.equal(state().questionIndex, i);
    assert.equal(state().nextQuestion(question(i + 1)), true);
  }
  const finished = state();
  assert.equal(state().tickTime(90000), false);
  assert.equal(state().recordAnswer(true, true, true), false);
  assert.equal(state().nextQuestion(question(12)), false);
  assert.equal(state(), finished);
  assert.equal(state().isActive, false);
  assert.equal(state().questionIndex, 10);
  assert.equal(state().redChip, 10);
  assert.equal(state().questionHistory.length, 10);
});

for (const answerFirst of [true, false]) {
  test(`answer/expiry race resolves once, answer first=${answerFirst}`, () => {
    start('addition_time');
    const ids = identity();
    const answer = () => state().recordAnswer(true, true, true, ...ids);
    const expire = () => state().tickTime(4500, ...ids);
    assert.equal(answerFirst ? answer() : expire(), true);
    assert.equal(answerFirst ? expire() : answer(), false);
    assert.equal(state().greenChip, answerFirst ? 1 : 0);
    assert.equal(state().redChip, answerFirst ? 0 : 1);
    assert.equal(state().questionHistory.length, 1);
    assert.equal(state().nextQuestion(question(2), ...ids), true);
    const next = state();
    assert.equal(answer(), false);
    assert.equal(expire(), false);
    assert.equal(state().nextQuestion(question(3), ...ids), false);
    assert.equal(state(), next);
  });
}

test('duel preserves cross-chip penalties and locks both players after first correct answer', () => {
  state().startGame('addition_duel', 10, { top: question(1), bottom: question(2) });
  assert.equal(state().recordDuelAnswer('top', false), false);
  assert.equal(state().duelChipBottom, -1);
  assert.equal(state().recordDuelAnswer('bottom', false), false);
  assert.equal(state().duelChipTop, -1);
  assert.equal(state().recordDuelAnswer('bottom', true), true);
  assert.equal(state().duelChipTop, 0);
  assert.equal(state().questionHistory.length, 1);
  assert.deepEqual(state().questionHistory[0].question, question(2));
  const resolved = state();
  for (const half of ['top', 'bottom']) {
    for (const correct of [true, false]) assert.equal(state().recordDuelAnswer(half, correct), false);
  }
  assert.equal(state(), resolved);
  const oldIds = identity();
  state().nextQuestion({ top: question(3), bottom: question(4) });
  assert.equal(state().recordDuelAnswer('top', true, ...oldIds), false);
  assert.equal(state().recordDuelAnswer('top', true), true);
  assert.equal(state().duelChipBottom, 0);
});

test('pause blocks submissions, ticking, and progression; resume preserves timer', () => {
  start('addition_time');
  state().tickTime(1000);
  state().pause();
  const paused = state();
  assert.equal(state().recordAnswer(true, true, true), false);
  assert.equal(state().recordAnswer(false, false, true), false);
  assert.equal(state().tickTime(4500), false);
  assert.equal(state().nextQuestion(question(2)), false);
  assert.equal(state(), paused);
  state().resume();
  assert.equal(state().timeRemaining, 3500);
  assert.equal(state().recordAnswer(true, true, false), true);
  state().pause();
  assert.equal(state().nextQuestion(question(2)), false);
  state().resume();
  assert.equal(state().nextQuestion(question(2)), true);
  state().endGame();
  const ended = state();
  state().resume();
  state().pause();
  assert.equal(state().recordAnswer(true, true, true), false);
  assert.equal(state().tickTime(4500), false);
  assert.equal(state(), ended);
});

test('restart/reset create monotonic identities, clear state, and reject stale callbacks', () => {
  start('addition_time');
  const oldIds = identity();
  state().recordAnswer(false, false, true);
  state().tickTime(4500);
  state().pause();
  start('addition_time');
  assert.equal(state().sessionId, oldIds[0] + 1);
  assert.equal(state().questionIndex, 1);
  assert.equal(state().isPaused, false);
  assert.equal(state().questionResolved, false);
  assert.equal(state().hadWrongAttempt, false);
  assert.equal(state().greenChip, 0);
  assert.equal(state().redChip, 0);
  assert.equal(state().timeRemaining, 4500);
  assert.deepEqual(state().questionHistory, []);
  const restarted = state();
  assert.equal(state().recordAnswer(true, true, true, ...oldIds), false);
  assert.equal(state().recordDuelAnswer('top', true, ...oldIds), false);
  assert.equal(state().tickTime(4500, ...oldIds), false);
  assert.equal(state().nextQuestion(question(2), ...oldIds), false);
  assert.equal(state(), restarted);
  state().reset();
  assert.equal(state().sessionId, oldIds[0] + 2);
  assert.equal(state().mode, null);
  assert.equal(state().questionIndex, 0);
  assert.equal(state().currentQuestion, null);
  assert.equal(state().isActive, false);
  assert.equal(state().timeRemaining, 0);
  assert.deepEqual(state().questionHistory, []);
  start('addition_practice');
  assert.equal(state().sessionId, oldIds[0] + 3);
});

test('invalid timer deltas and ticks outside Time are inert', () => {
  start('addition_time');
  const active = state();
  for (const delta of [-1, 0, NaN, Infinity]) assert.equal(state().tickTime(delta), false);
  assert.equal(state(), active);
  start();
  const practice = state();
  assert.equal(state().tickTime(4500), false);
  assert.equal(state(), practice);
});

test('stale callbacks cannot advance a newly resolved question or another session', () => {
  start();
  const firstIds = identity();
  state().recordAnswer(3, true, true);
  state().nextQuestion(question(2));
  state().recordAnswer(4, true, true);
  const secondResolved = state();
  assert.equal(state().nextQuestion(question(99), ...firstIds), false);
  assert.equal(state(), secondResolved);
  start();
  state().recordAnswer(3, true, true);
  const restartedResolved = state();
  assert.equal(state().nextQuestion(question(99), ...firstIds), false);
  assert.equal(state(), restartedResolved);
});

test('duel paused/inactive/stale submissions are inert and restart clears both chips', () => {
  const pair = { top: question(1), bottom: question(2) };
  state().startGame('addition_duel', 10, pair);
  const oldIds = identity();
  state().recordDuelAnswer('top', false);
  state().recordDuelAnswer('bottom', false);
  state().pause();
  const paused = state();
  assert.equal(state().recordDuelAnswer('top', true), false);
  assert.equal(state().recordDuelAnswer('bottom', false), false);
  assert.equal(state(), paused);
  state().startGame('addition_duel', 10, pair);
  const restarted = state();
  assert.equal(state().duelChipTop, 0);
  assert.equal(state().duelChipBottom, 0);
  assert.equal(state().recordDuelAnswer('top', true, ...oldIds), false);
  assert.equal(state(), restarted);
  state().endGame();
  const ended = state();
  assert.equal(state().recordDuelAnswer('bottom', true), false);
  assert.equal(state(), ended);
});

test('optional initial question supports legacy initialization without mid-question replacement', () => {
  state().startGame('addition_time');
  const empty = state();
  assert.equal(state().recordAnswer(true, true, true), false);
  assert.equal(state().tickTime(4500), false);
  assert.equal(state(), empty);
  state().setQuestion(question());
  assert.deepEqual(state().currentQuestion, question());
  const initialized = state();
  state().setQuestion(question(2));
  assert.equal(state(), initialized);
});
