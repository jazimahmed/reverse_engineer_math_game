import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import loadTypeScript from './helpers/loadTypeScript.cjs';

const cache = new Map();
const load = (path) => loadTypeScript(fileURLToPath(new URL(path, import.meta.url)), cache);
const { TopicConfig } = load('../src/constants/game.ts');
const { resolveGameConfiguration } = load('../src/domain/gameConfiguration.ts');
const { generateQuestion, createRoundQuestion, formatQuestion, parseAnswer, isAnswerCorrect } = load('../src/utils/questionGenerator.ts');

function seededRandom(seed = 9841) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
function calculate(a, operator, b) {
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case 'x': return a * b;
    case '÷': return a / b;
    case '√': return Math.sqrt(a);
    default: assert.fail(`Unsupported operator ${operator}`);
  }
}
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

for (const [topic, { modes }] of Object.entries(TopicConfig)) {
  if (topic === 'games') continue;
  test(`${topic}: every advertised mode has valid topic-specific questions and unique correct choices`, () => {
    const random = seededRandom();
    const operationByTopic = { addition: '+', subtraction: '-', multiplication: 'x', division: '÷', squareRoot: '√', decimal: '+', fraction: '+' };
    const operationByMode = { addition: '+', subtract: '-', multiply: 'x', division: '÷' };
    for (const mode of modes) {
      const config = resolveGameConfiguration(topic, mode);
      assert.ok(config, `${topic}/${mode}`);
      for (let sample = 0; sample < 100; sample++) {
        const q = generateQuestion(config, random);
        assert.equal(q.operator, operationByMode[mode] ?? operationByTopic[topic]);
        assert.ok(Number.isFinite(q.n1));
        assert.ok(Number.isFinite(q.answer));
        close(parseAnswer(q.display.n1), q.n1);
        close(parseAnswer(q.display.answer), q.answer);
        const missing = config.view === 'quiz';
        const n2 = missing ? q.options[q.correctOptionIndex] : q.n2;
        const actual = calculate(q.n1, q.operator, n2);
        if (q.operator === '÷') assert.notEqual(n2, 0);
        if (topic === 'division') assert.equal(actual, Math.floor(actual));
        if (topic === 'squareRoot') assert.equal(actual, Math.floor(actual));
        if (topic === 'decimal') {
          assert.notEqual(q.n1, Math.floor(q.n1));
          assert.notEqual(n2, Math.floor(n2));
        }
        if (q.isTrueFalse) {
          assert.equal(Math.abs(actual - q.answer) < 1e-8, q.correctOptionIndex === 0);
          assert.deepEqual(q.options, [1, 0]);
        } else {
          close(actual, q.answer);
          assert.equal(q.options.length, 4);
          assert.equal(new Set(q.options).size, 4);
          q.options.forEach((option, index) => {
            assert.ok(Number.isFinite(option));
            close(parseAnswer(q.display.options[index]), option);
            assert.equal(isAnswerCorrect(q.display.options[index], q), index === q.correctOptionIndex);
          });
          if (!missing) close(q.options[q.correctOptionIndex], actual);
          else {
            assert.equal(q.n2, '?');
            assert.equal(q.display.n2, '?');
            if (q.operator === 'x') assert.notEqual(q.n1, 0, 'missing multiplier must have a unique solution');
          }
        }
        assert.ok(q.explanation.length > 20);
        assert.equal(formatQuestion(q).includes('undefined'), false);
      }
    }
  });
}

test('unknown topics/modes and unadvertised combinations are explicitly rejected', () => {
  for (const [topic, mode] of [['games', 'practice'], ['subtraction', 'exam'], ['squareRoot', 'quiz'], ['addition', 'bogus'], ['bogus', 'practice'], ['__proto__', 'practice'], ['addition', 'constructor']]) {
    assert.equal(resolveGameConfiguration(topic, mode), null);
  }
});

test('constant random sources terminate, hard uses larger operands, and Duel mirrors one question', () => {
  for (const value of [0, 0.999999]) {
    for (const [topic, { modes }] of Object.entries(TopicConfig)) {
      if (topic === 'games') continue;
      for (const mode of modes) {
        const config = resolveGameConfiguration(topic, mode);
        const q = createRoundQuestion(config, () => value);
        if (config.view === 'duel') assert.equal(q.top, q.bottom);
        else assert.ok(Number.isFinite(q.answer));
      }
    }
  }
  const hard = generateQuestion(resolveGameConfiguration('addition', 'hard'), () => 0.999999);
  const standard = generateQuestion(resolveGameConfiguration('addition', 'practice'), () => 0.999999);
  assert.ok(hard.n1 > standard.n1);
  assert.equal(resolveGameConfiguration('multiplication', 'exam').engineMode, 'addition_exam');
});

test('answer parsing accepts decimals/equivalent fractions but rejects incomplete or invalid input', () => {
  assert.equal(parseAnswer(' 0.25 '), 0.25);
  assert.equal(parseAnswer('2 / 8'), 0.25);
  assert.equal(parseAnswer('-3/4'), -0.75);
  assert.equal(parseAnswer('.5'), 0.5);
  for (const input of ['', ' ', '/', '1/0', '0/0', '1/2/3', '3..2', 'NaN', 'Infinity', '1e3', '1abc', '--1']) assert.equal(parseAnswer(input), null, input);
  const q = { options: [0.25, 0.5, 0.75, 1], correctOptionIndex: 0 };
  assert.equal(isAnswerCorrect('1/4', q), true);
  assert.equal(isAnswerCorrect('2/8', q), true);
  assert.equal(isAnswerCorrect('0.25', q), true);
  assert.equal(isAnswerCorrect('0.2501', q), false);
});

test('root notation is unary, decimal notation is clean, and fractions retain exact labels', () => {
  const root = generateQuestion(resolveGameConfiguration('squareRoot', 'practice'), () => 0.5);
  assert.match(formatQuestion(root, true), /^√\d+ = \?$/);
  assert.equal(formatQuestion(root).includes(' 0 '), false);
  const decimal = generateQuestion(resolveGameConfiguration('decimal', 'addition'), () => 0.1);
  assert.match(formatQuestion(decimal), /\d\.\d \+ \d\.\d = \d(?:\.\d)?/);
  const frac = generateQuestion(resolveGameConfiguration('fraction', 'division'), () => 0);
  assert.equal(frac.display.n1, '1/2');
  assert.equal(frac.display.n2, '1/2');
  assert.equal(frac.display.answer, '1');
});
