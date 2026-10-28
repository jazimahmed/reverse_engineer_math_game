import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import loadTypeScript from './helpers/loadTypeScript.cjs';

// Run the actual controller/store without Metro or a native runtime.
const cache = new Map();
const load = (path) => loadTypeScript(fileURLToPath(new URL(path, import.meta.url)), cache);
const { createGameRoundController } = load('../src/utils/gameRoundController.ts');
const { useGameSessionStore: store } = load('../src/store/gameSessionStore.ts');

function fakeClock() {
  let now = 0;
  let nextId = 0;
  const tasks = new Map();
  const add = (callback, ms, repeat) => {
    const id = ++nextId;
    tasks.set(id, { callback, due: now + ms, ms, repeat });
    return id;
  };
  return {
    now: () => now,
    setTimeout: (callback, ms) => add(callback, ms, false),
    clearTimeout: (id) => tasks.delete(id),
    setInterval: (callback, ms) => add(callback, ms, true),
    clearInterval: (id) => tasks.delete(id),
    pending: () => tasks.size,
    elapseWithoutCallbacks: (ms) => { now += ms; },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const entry = [...tasks].filter(([, task]) => task.due <= end)
          .sort((a, b) => a[1].due - b[1].due)[0];
        if (!entry) break;
        const [id, task] = entry;
        now = Math.max(now, task.due);
        if (task.repeat) task.due = now + task.ms;
        else tasks.delete(id);
        task.callback();
      }
      now = end;
    },
  };
}

function setup(mode = 'addition_practice', totalQuestions = 10, suppliedClock) {
  const clock = suppliedClock || fakeClock();
  const results = [];
  let generated = 0;
  const controller = createGameRoundController({
    store, mode, totalQuestions, clock,
    createQuestion: () => {
      generated++;
      const q = { n1: generated, n2: 1, operator: '+', answer: generated + 1,
        options: [generated + 1, 0, 1, 2], correctOptionIndex: 0,
        isTrueFalse: mode === 'addition_test' || mode === 'addition_time' };
      return mode === 'addition_duel' ? { top: q, bottom: q } : q;
    },
    onComplete: (state) => results.push(state),
  });
  return { controller, clock, results, generated: () => generated };
}

test('controller completes ten questions once with fresh questions and settled result scores', () => {
  const { controller, clock, results, generated } = setup();
  for (let index = 1; index <= 10; index++) {
    assert.equal(store.getState().questionIndex, index);
    assert.equal(store.getState().currentQuestion.n1, index);
    controller.answer(index + 1, true, true, index);
    controller.answer(index + 1, true, true, index); // duplicate native event
    clock.advance(899);
    assert.equal(store.getState().questionIndex, index);
    clock.advance(1);
  }
  assert.equal(generated(), 10);
  assert.equal(results.length, 1);
  assert.equal(results[0].greenChip, 10);
  assert.equal(results[0].questionHistory.length, 10);
  assert.equal(store.getState().questionIndex, 10);
  assert.equal(store.getState().isActive, false);
  clock.advance(10000);
  assert.equal(results.length, 1);
  assert.equal(clock.pending(), 0);
  controller.dispose();
});

test('controller permits retries then schedules only one transition', () => {
  const { controller, clock } = setup('addition_quiz');
  controller.answer(0, false, true, 1);
  controller.answer(1, false, true, 1);
  assert.equal(clock.pending(), 0);
  assert.equal(store.getState().questionIndex, 1);
  controller.answer(2, true, true, 1); // store must ignore caller's incorrect firstTry
  clock.advance(900);
  assert.equal(store.getState().questionIndex, 2);
  assert.equal(store.getState().greenChip, 0);
  assert.equal(store.getState().redChip, 1);
  assert.equal(store.getState().questionHistory.length, 1);
  controller.dispose();
});

test('unanswered Time round loads new questions and finishes at ten with timeout history', () => {
  const { controller, clock, results, generated } = setup('addition_time');
  clock.advance(45000);
  assert.equal(generated(), 10);
  assert.equal(results.length, 1);
  assert.equal(results[0].redChip, 10);
  assert.equal(results[0].questionHistory.length, 10);
  assert.ok(results[0].questionHistory.every((row) => row.userAnswer === null && !row.correct));
  assert.equal(store.getState().questionIndex, 10);
  assert.equal(clock.pending(), 0);
  controller.dispose();
});

test('Time wrong answer does not restart timer or count red twice on expiry', () => {
  const { controller, clock } = setup('addition_time');
  clock.advance(4000);
  controller.answer(false, false, true, 1);
  assert.equal(store.getState().redChip, 1);
  assert.equal(store.getState().timeRemaining, 500);
  clock.advance(500);
  assert.equal(store.getState().questionIndex, 2);
  assert.equal(store.getState().redChip, 1);
  controller.dispose();
});

test('answer just before expiry cancels old deadline and ignores stale answer callbacks', () => {
  const { controller, clock } = setup('addition_time');
  clock.advance(4400);
  controller.answer(true, true, true, 1);
  assert.equal(store.getState().questionIndex, 2);
  controller.answer(true, true, true, 1);
  clock.advance(100);
  assert.equal(store.getState().questionIndex, 2);
  assert.equal(store.getState().greenChip, 1);
  assert.equal(store.getState().timeRemaining, 4400);
  controller.dispose();
});

test('answer at deadline expires old question even before interval callback runs', () => {
  const { controller, clock } = setup('addition_time');
  clock.elapseWithoutCallbacks(4500);
  controller.answer(true, true, true, 1);
  assert.equal(store.getState().questionIndex, 2);
  assert.equal(store.getState().greenChip, 0);
  assert.equal(store.getState().redChip, 1);
  assert.equal(store.getState().questionHistory.length, 1);
  controller.dispose();
});

test('background pause excludes elapsed time and resumes with remaining duration', () => {
  const { controller, clock } = setup('addition_time');
  clock.advance(1000);
  controller.pause();
  clock.advance(60000);
  controller.answer(true, true, true, 1);
  assert.equal(store.getState().questionIndex, 1);
  assert.equal(store.getState().timeRemaining, 3500);
  controller.resume();
  clock.advance(3499);
  assert.equal(store.getState().questionIndex, 1);
  clock.advance(1);
  assert.equal(store.getState().questionIndex, 2);
  controller.dispose();
});

test('pause holds a resolved question and resumes exactly one deferred transition', () => {
  const { controller, clock } = setup();
  controller.answer(2, true, true, 1);
  clock.advance(500);
  controller.pause();
  clock.advance(5000);
  assert.equal(store.getState().questionIndex, 1);
  controller.resume();
  controller.resume();
  assert.equal(clock.pending(), 1);
  clock.advance(900);
  assert.equal(store.getState().questionIndex, 2);
  controller.dispose();
});

test('dispose cancels delayed navigation/mutation and restart owns a fresh session', () => {
  const first = setup('addition_practice', 1);
  first.controller.answer(2, true, true, 1);
  first.controller.dispose();
  const second = setup('addition_practice', 1, first.clock);
  first.controller.answer(2, true, true, 1);
  first.clock.advance(5000);
  assert.equal(first.results.length, 0);
  assert.equal(second.results.length, 0);
  assert.equal(store.getState().greenChip, 0);
  assert.equal(store.getState().isActive, true);
  second.controller.answer(2, true, true, 1);
  second.clock.advance(900);
  assert.equal(second.results.length, 1);
  second.controller.dispose();
});

test('Duel simultaneous correct events resolve once and finish a bounded round', () => {
  const { controller, clock, results } = setup('addition_duel', 1);
  controller.duelAnswer('bottom', true, 1);
  controller.duelAnswer('top', true, 1);
  controller.duelAnswer('bottom', true, 1);
  clock.advance(900);
  assert.equal(results.length, 1);
  assert.equal(results[0].duelChipTop, 1);
  assert.equal(results[0].duelChipBottom, 0);
  controller.dispose();
});
