import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMultiplayerQuestion,
  generateMultiplayerQuestions,
} from '../src/domain/multiplayerQuestions.ts';

const fixed = (value) => () => value;

test('uses the exact index-based operand and operation ranges', () => {
  const first = generateMultiplayerQuestion(0, fixed(0));
  assert.deepEqual(first, { id: 0, left: 10, right: 10, operator: '+', answer: 20 });
  const multiplication = generateMultiplayerQuestion(3, fixed(0.5));
  assert.equal(multiplication.operator, 'x');
  assert.ok(multiplication.left >= 20 && multiplication.left < 50);
  assert.ok(multiplication.right >= 1 && multiplication.right < 10);
  assert.equal(multiplication.answer, multiplication.left * multiplication.right);
  const finalTier = generateMultiplayerQuestion(16, fixed(0.999999));
  assert.ok(finalTier.left >= 500 && finalTier.left < 999);
  assert.ok(finalTier.right >= 50 && finalTier.right < 100);
});

test('reorders subtraction operands to keep answers nonnegative', () => {
  const q = generateMultiplayerQuestion(1, fixed(0.999999));
  assert.equal(q.operator, '-');
  assert.ok(q.left >= q.right);
  assert.equal(q.answer, q.left - q.right);
});

test('returns requested question count and sequential IDs', () => {
  const questions = generateMultiplayerQuestions(24, fixed(0.25));
  assert.equal(questions.length, 24);
  assert.deepEqual(questions.map(({ id }) => id), Array.from({ length: 24 }, (_, i) => i));
  assert.deepEqual(generateMultiplayerQuestions(-1), []);
});


test('keeps every index tier within its documented half-open ranges', () => {
  const bounds = (index) => {
    if (index <= 2) return [[10, 50], [10, 20], ['+', '-']];
    if (index === 3) return [[20, 50], [1, 10], ['x']];
    if (index <= 5) return [[20, 100], [10, 20], ['+', '-']];
    if (index <= 7) return [[300, 999], [99, 299], ['+', '-']];
    if (index === 8) return [[100, 500], [5, 10], ['x']];
    if (index <= 10) return [[1000, 9999], [150, 500], ['+', '-']];
    if (index <= 15) return [[100, 999], [10, 20], ['+', '-', 'x']];
    return [[500, 999], [50, 100], ['+', '-', 'x']];
  };
  for (let index = 0; index < 24; index += 1) {
    for (const sample of [0, 0.999999]) {
      const q = generateMultiplayerQuestion(index, fixed(sample));
      const [leftRange, rightRange, operators] = bounds(index);
      assert.ok(q.left >= leftRange[0] && q.left < leftRange[1], `left operand at ${index}`);
      assert.ok(q.right >= rightRange[0] && q.right < rightRange[1], `right operand at ${index}`);
      assert.ok(operators.includes(q.operator), `operator at ${index}`);
      assert.equal(q.answer, q.operator === '+' ? q.left + q.right : q.operator === '-' ? q.left - q.right : q.left * q.right);
    }
  }
});
