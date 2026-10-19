import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildRandomNumberLevelConfig,
  advanceRandomNumberResultLevel,
  chooseRandomNumberHintClickAction,
  calculateRandomNumberExpression as calculate,
  isRandomNumberSelectionValid as acceptsSelection,
  resolveRandomNumberTargetBranch,
  requestRandomNumberHint,
  parseRandomNumberLevelDataset,
} from '../src/domain/randomNumber.ts';

const packagedRandomNumberData = JSON.parse(readFileSync(
  new URL('../src/domain/data/randomNumberLevels.json', import.meta.url), 'utf8',
));

test('evaluates the four operators with APK integer semantics', () => {
  assert.equal(calculate(['12', '+', '8']), 20);
  assert.equal(calculate(['12', '-', '8']), 4);
  assert.equal(calculate(['12', '\u00d7', '8']), 96);
  assert.equal(calculate(['12', '\u00f7', '5']), 2);
});

test('returns zero for guarded division, invalid Java integers, and overflow', () => {
  assert.equal(calculate(['3', '\u00f7', '5']), 0);
  assert.equal(calculate(['3', '\u00f7', '0']), 0);
  assert.equal(calculate(['3.5', '+', '2']), 0);
  assert.equal(calculate([' 3', '+', '2']), 0);
  assert.equal(calculate(['2147483648', '+', '2']), 0);
  assert.equal(calculate(['3', '^', '2']), 0);
  assert.equal(calculate(['2147483647', '+', '1']), -2147483648);
});

test('accepts operators only in slot 1 and non-operators elsewhere', () => {
  for (const op of ['+', '-', '\u00d7', '\u00f7']) {
    assert.equal(acceptsSelection(op, 1), true);
    assert.equal(acceptsSelection(op, 0), false);
    assert.equal(acceptsSelection(op, 2), false);
  }
  assert.equal(acceptsSelection('9', 1), false);
  assert.equal(acceptsSelection('9', 0), true);
  assert.equal(acceptsSelection('9', 2), true);
  assert.equal(acceptsSelection('', 0), true);
});


test('derives initial grid and equation layout from the level data', () => {
  const fourHints = buildRandomNumberLevelConfig({
    numbers: [5, 3, 7, 9], randomNumber: 45, hints: ['5 x 9 = 45'], maxHints: 4,
  });
  assert.equal(fourHints.equationRows, 6);
  assert.equal(fourHints.numberGridColumns, 4);
  assert.equal(fourHints.target, 45);
  assert.equal(fourHints.numberSelectionEnabledAtStart, true);
  assert.equal(fourHints.operatorSelectionEnabledAtStart, false);

  const other = buildRandomNumberLevelConfig({
    numbers: [1, 2, 3, 4, 5, 6], randomNumber: 20, hints: [], maxHints: 2,
  });
  assert.equal(other.equationRows, 3);
  assert.equal(other.numberGridColumns, 5);
});


test('opens hint dialog with data and caps the click counter', () => {
  assert.deepEqual(requestRandomNumberHint(1, 3, true), { clickCount: 2, openDialog: true });
  assert.deepEqual(requestRandomNumberHint(3, 3, true), { clickCount: 3, openDialog: true });
  assert.deepEqual(requestRandomNumberHint(4, 3, true), { clickCount: 4, openDialog: true });
  assert.deepEqual(requestRandomNumberHint(1, 3, false), { clickCount: 1, openDialog: false });
});


test('selects hint, rewarded-video, or ignored action from click gates', () => {
  assert.equal(chooseRandomNumberHintClickAction({ clickable: false, unlimitedHints: true, clickCount: 0, maxHints: 2 }), 'ignore');
  assert.equal(chooseRandomNumberHintClickAction({ clickable: true, unlimitedHints: true, clickCount: 2, maxHints: 2 }), 'show_hint');
  assert.equal(chooseRandomNumberHintClickAction({ clickable: true, unlimitedHints: false, clickCount: 1, maxHints: 2 }), 'show_hint');
  assert.equal(chooseRandomNumberHintClickAction({ clickable: true, unlimitedHints: false, clickCount: 2, maxHints: 2 }), 'show_rewarded_video');
});

test('mirrors target mismatch result transition and highest-level persistence', () => {
  assert.deepEqual(resolveRandomNumberTargetBranch({
    value: 16, target: 20, resultCount: 1, maxRows: 3, levelPosition: 4, savedHighestLevel: 3,
  }), { kind: 'result_activity', levelCompleted: true, savedHighestLevel: 5 });
  assert.deepEqual(resolveRandomNumberTargetBranch({
    value: 16, target: 20, resultCount: 1, maxRows: 3, levelPosition: 4, savedHighestLevel: 8,
  }), { kind: 'result_activity', levelCompleted: true, savedHighestLevel: 8 });
});

test('mirrors target-match next-row, max-row feedback, and empty-result branches', () => {
  assert.deepEqual(resolveRandomNumberTargetBranch({
    value: 20, target: 20, resultCount: 1, maxRows: 3, levelPosition: 0, savedHighestLevel: 1,
  }), {
    kind: 'next_row', rowIndex: 1, previousResult: 20,
    numberSelectionEnabled: false, operatorSelectionEnabled: true,
  });
  assert.deepEqual(resolveRandomNumberTargetBranch({
    value: 20, target: 20, resultCount: 3, maxRows: 3, levelPosition: 0, savedHighestLevel: 1,
  }), {
    kind: 'target_feedback', levelCompleted: false,
    playsSound: true, showsToast: true, animatesUndo: true,
  });
  assert.deepEqual(resolveRandomNumberTargetBranch({
    value: 20, target: 20, resultCount: 0, maxRows: 3, levelPosition: 0, savedHighestLevel: 1,
  }), { kind: 'no_transition', levelCompleted: false });
});

test('advances result level index and saves the new highest unlocked position', () => {
  assert.deepEqual(advanceRandomNumberResultLevel({
    currentLevelPosition: 0, savedHighestLevel: 0,
  }), { levelPosition: 1, levelNumber: 2, savedHighestLevel: 1 });
  assert.deepEqual(advanceRandomNumberResultLevel({
    currentLevelPosition: 10, savedHighestLevel: 15,
  }), { levelPosition: 11, levelNumber: 12, savedHighestLevel: 15 });
});

test('loads all 250 packaged random-number level records', () => {
  const levels = parseRandomNumberLevelDataset(packagedRandomNumberData);
  assert.equal(levels.length, 250);
  assert.deepEqual(levels[0], {
    hints: ['5 x 9 = 45'], maxHints: 1, numbers: [5, 3, 7, 9], randomNumber: 45,
  });
  assert.equal(levels[2].hints[0], '11 × 5 = 55');
  assert.equal(levels[0].randomNumber, 45);
  assert.deepEqual(levels.reduce((counts, level) => {
    counts[level.numbers.length] = (counts[level.numbers.length] ?? 0) + 1;
    return counts;
  }, {}), { 4: 20, 6: 50, 8: 180 });
  assert.ok(levels.every((level) => level.hints.length === level.maxHints));
});

test('rejects malformed level dataset fields', () => {
  assert.throws(() => parseRandomNumberLevelDataset(null), /Invalid random-number level dataset/);
  assert.throws(() => parseRandomNumberLevelDataset({ levels: [{ ...packagedRandomNumberData.levels[0], maxHints: -1 }] }), /index 0/);
  assert.throws(() => parseRandomNumberLevelDataset({ levels: [{ ...packagedRandomNumberData.levels[0], numbers: ['5'] }] }), /index 0/);
});
