import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildMathPiecesGridConfig,
  calculateMathPiecesStars,
  checkMathPiecesEquations,
  isMathPiecesEquationCorrect,
  parseMathPiecesLevelDataset,
  transferMathPiece,
} from '../src/domain/mathPieces.ts';

const packagedMathPiecesData = JSON.parse(readFileSync(
  new URL('../src/domain/data/mathPiecesLevels.json', import.meta.url), 'utf8',
));

test('loads all packaged Math Pieces levels and preserves their initial cell data', () => {
  const levels = parseMathPiecesLevelDataset(packagedMathPiecesData);
  assert.equal(levels.length, 150);
  assert.equal(levels[0].cells.length, 56);
  assert.deepEqual(levels[0].cells[24], {
    cellTxt: '1',
    isDragable: true,
    lvl_id: 101,
  });
});

test('maps packaged cell counts to the APK grid dimensions', () => {
  assert.deepEqual(buildMathPiecesGridConfig(56), { columns: 7, rows: 8 });
  assert.deepEqual(buildMathPiecesGridConfig(72), { columns: 8, rows: 9 });
  assert.deepEqual(buildMathPiecesGridConfig(90), { columns: 9, rows: 10 });
  assert.throws(() => buildMathPiecesGridConfig(55), /Unsupported/);
});

test('rejects malformed Math Pieces datasets and cells', () => {
  assert.throws(() => parseMathPiecesLevelDataset({}), /dataset/);
  assert.throws(() => parseMathPiecesLevelDataset({ timerGameLevels: [{}] }), /level/);
  assert.throws(() => parseMathPiecesLevelDataset({
    timerGameLevels: [{
      cells: [{ cellTxt: '1', isDragable: 'yes', lvl_id: 101 }],
      isUnLocked: false,
      stars: 0,
    }],
  }), /cell/);
});

test('returns zero stars when there are no correct attempts', () => {
  assert.equal(calculateMathPiecesStars(0, 0), 0);
  assert.equal(calculateMathPiecesStars(0, 7), 0);
});

test('applies the APK percentage thresholds for one, two, and three stars', () => {
  assert.equal(calculateMathPiecesStars(1, 3), 1); // 25%
  assert.equal(calculateMathPiecesStars(2, 3), 2); // 40%, inclusive lower edge
  assert.equal(calculateMathPiecesStars(9, 1), 2); // 90%, inclusive upper edge
  assert.equal(calculateMathPiecesStars(10, 1), 3); // >90%
  assert.equal(calculateMathPiecesStars(1, 0), 3); // 100%
});

test('validates five-cell equations in either direction and all four operators', () => {
  assert.equal(isMathPiecesEquationCorrect(['2', '+', '3', '=', '5']), true);
  assert.equal(isMathPiecesEquationCorrect(['2', '=', '5', '-', '3']), true);
  assert.equal(isMathPiecesEquationCorrect(['3', '-', '8', '=', '5']), true); // absolute difference
  assert.equal(isMathPiecesEquationCorrect(['4', '×', '3', '=', '12']), true);
  assert.equal(isMathPiecesEquationCorrect(['7', '÷', '2', '=', '3']), true); // integer quotient
  assert.equal(
    isMathPiecesEquationCorrect(['16777216', '+', '1', '=', '16777216']),
    true, // DEX converts the int result to float before Math.round().
  );
  assert.equal(isMathPiecesEquationCorrect(['2', '+', '3', '=', '6']), false);
});

test('does not accept incomplete lines and preserves the DEX zero-divisor failure', () => {
  assert.equal(isMathPiecesEquationCorrect(['2', '+', '', '=', '2']), false);
  assert.throws(
    () => isMathPiecesEquationCorrect(['7', '÷', '0', '=', '0']),
    RangeError,
  );
});

test('models an accepted APK drag drop as target copy and source clear, not swap', () => {
  assert.deepEqual(transferMathPiece(['2', '+', '3', '', '5'], 0, 3), ['', '+', '3', '2', '5']);
  assert.deepEqual(transferMathPiece(['tile'], 0, 0), ['tile']);
  assert.throws(() => transferMathPiece(['tile'], 0, 1), RangeError);
});

test('ends the game only when every rebuilt equation is newly correct in one pass', () => {
  // Per DEX, each pass rebuilds PieceEquation objects with isCorrect=false, so
  // a faithful input starts every record as not-yet-correct.
  const freshFull = [
    { cells: ['2', '+', '3', '=', '5'], isCorrect: false },
    { cells: ['4', '=', '6', '-', '2'], isCorrect: false },
  ];
  const full = checkMathPiecesEquations(freshFull);
  assert.equal(full.gameComplete, true);
  assert.equal(full.newlyCorrectCount, 2);
  assert.deepEqual(full.newWrongAttemptCount, 0);
  assert.ok(full.equations.every((equation) => equation.isCorrect));

  const freshPartial = [
    { cells: ['2', '+', '3', '=', '5'], isCorrect: false },
    { cells: ['4', '+', '6', '=', '11'], isCorrect: false },
  ];
  const partial = checkMathPiecesEquations(freshPartial);
  assert.equal(partial.gameComplete, false);
  assert.equal(partial.newlyCorrectCount, 1);
  assert.deepEqual(partial.wrongEquationIndexes, [1]);
});

test('does not complete an empty pass, mirroring the DEX size-0 skip', () => {
  const empty = checkMathPiecesEquations([]);
  assert.equal(empty.gameComplete, false);
  assert.equal(empty.newlyCorrectCount, 0);
});

test('counts wrong attempts once per repeated equation key like equtaionTags', () => {
  const board = [
    { cells: ['1', '+', '1', '=', '3'], isCorrect: false },
    { cells: ['5', '+', '2', '=', '9'], isCorrect: false },
  ];
  const keys = ['row1', 'col2'];
  const reported = new Set();

  const first = checkMathPiecesEquations(board, { keys, reportedWrongKeys: reported });
  assert.equal(first.newWrongAttemptCount, 2);
  assert.deepEqual(first.reportedWrongKeys, ['row1', 'col2']);

  const repeat = checkMathPiecesEquations(board, { keys, reportedWrongKeys: reported });
  assert.equal(repeat.newWrongAttemptCount, 0);

  const recovered = checkMathPiecesEquations(
    [
      { cells: ['1', '+', '1', '=', '2'], isCorrect: false },
      { cells: ['5', '+', '2', '=', '7'], isCorrect: false },
    ],
    { keys, reportedWrongKeys: reported },
  );
  assert.equal(recovered.newWrongAttemptCount, 0, 'row1 key already reported');
  assert.equal(recovered.gameComplete, true);
});
