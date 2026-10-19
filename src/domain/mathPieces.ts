/**
 * Mirrors Game_MathPieces_Activity.calculateResult() for nonnegative attempt
 * counts, as read from the supplied APK's DEX. This is static-code parity;
 * runtime behavior and the UI meaning of each star tier are unobserved.
 */
export function calculateMathPiecesStars(
  correctAttempts: number,
  wrongAttempts: number,
): 0 | 1 | 2 | 3 {
  if (correctAttempts === 0) return 0;

  const percentage = (correctAttempts / (correctAttempts + wrongAttempts)) * 100;
  if (percentage >= 40 && percentage <= 90) return 2;
  if (percentage > 90 && percentage <= 100) return 3;
  return 1;
}

export type MathPiecesEquationCells = readonly [string, string, string, string, string];

export interface MathPiecesCell {
  cellTxt: string;
  isDragable: boolean;
  lvl_id: number;
}

export interface MathPiecesLevel {
  cells: MathPiecesCell[];
  isUnLocked: boolean;
  stars: number;
}

export interface MathPiecesGridConfig {
  columns: 7 | 8 | 9;
  rows: 8 | 9 | 10;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Validates the timerGameLevels asset copied from this exact APK. */
export function parseMathPiecesLevelDataset(input: unknown): MathPiecesLevel[] {
  if (!isRecord(input) || !Array.isArray(input.timerGameLevels)) {
    throw new Error('Invalid Math Pieces level dataset');
  }

  return input.timerGameLevels.map((rawLevel, levelIndex) => {
    if (!isRecord(rawLevel) || !Array.isArray(rawLevel.cells)) {
      throw new Error(`Invalid Math Pieces level at index ${levelIndex}`);
    }

    const cells = rawLevel.cells.map((rawCell, cellIndex): MathPiecesCell => {
      if (
        !isRecord(rawCell)
        || typeof rawCell.cellTxt !== 'string'
        || typeof rawCell.isDragable !== 'boolean'
        || !Number.isInteger(rawCell.lvl_id)
      ) {
        throw new Error(`Invalid Math Pieces cell at level ${levelIndex}, cell ${cellIndex}`);
      }
      return {
        cellTxt: rawCell.cellTxt,
        isDragable: rawCell.isDragable,
        lvl_id: rawCell.lvl_id as number,
      };
    });

    if (
      typeof rawLevel.isUnLocked !== 'boolean'
      || !Number.isInteger(rawLevel.stars)
    ) {
      throw new Error(`Invalid Math Pieces progress fields at index ${levelIndex}`);
    }

    return {
      cells,
      isUnLocked: rawLevel.isUnLocked,
      stars: rawLevel.stars as number,
    };
  });
}

/** Mirrors setGridRowColumn() for the three cell counts in the APK asset. */
export function buildMathPiecesGridConfig(cellCount: number): MathPiecesGridConfig {
  switch (cellCount) {
    case 56:
      return { columns: 7, rows: 8 };
    case 72:
      return { columns: 8, rows: 9 };
    case 90:
      return { columns: 9, rows: 10 };
    default:
      throw new Error(`Unsupported Math Pieces cell count: ${cellCount}`);
  }
}

const equationOperators = new Set(['+', '-', '×', '÷']);
const nonNumberCells = new Set([...equationOperators, '=']);

function parseMathPiecesInteger(value: string): number | undefined {
  const normalized = value.trim();
  if (!/^[+-]?\d+$/.test(normalized)) return undefined;

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed < -2_147_483_648 || parsed > 2_147_483_647) {
    return undefined;
  }
  return parsed;
}

function roundThroughDexFloat(value: number): number {
  const floatValue = Math.fround(value);
  const rounded = Math.floor(floatValue + 0.5);
  return Math.min(2_147_483_647, Math.max(-2_147_483_648, rounded));
}

/**
 * Checks one complete five-cell Math Pieces row/column against the APK's
 * checkEquations(PieceEquation) logic. The DEX reads an arithmetic operator
 * with its adjacent operands, calculates an integer result, then searches the
 * line for that result at either end beside '='. This helper handles malformed
 * lines as false; the original code may throw while parsing malformed cells.
 */
export function isMathPiecesEquationCorrect(cells: MathPiecesEquationCells): boolean {
  for (let operatorIndex = 1; operatorIndex <= 3; operatorIndex += 1) {
    const operator = cells[operatorIndex];
    if (!equationOperators.has(operator)) continue;

    const leftText = cells[operatorIndex - 1];
    const rightText = cells[operatorIndex + 1];
    if (nonNumberCells.has(leftText) || nonNumberCells.has(rightText)) continue;

    const left = parseMathPiecesInteger(leftText);
    const right = parseMathPiecesInteger(rightText);
    if (left === undefined || right === undefined) continue;

    let result = 0;
    switch (operator) {
      case '+':
        result = (left + right) | 0;
        break;
      case '-':
        result = (left <= right ? right - left : left - right) | 0;
        break;
      case '×':
        result = Math.imul(left, right);
        break;
      case '÷':
        if (right === 0) throw new RangeError('Math Pieces equation divides by zero');
        result = Math.trunc(left / right) | 0;
        break;
    }

    result = roundThroughDexFloat(result);

    const resultText = String(result);
    for (let resultIndex = 0; resultIndex < cells.length; resultIndex += 1) {
      if (cells[resultIndex] !== resultText) continue;
      if (resultIndex === 0 && cells[1] === '=') return true;
      if (resultIndex === cells.length - 1 && cells[cells.length - 2] === '=') return true;
    }
  }

  return false;
}

/**
 * Models the text transfer performed by MyDragListener for an accepted drop.
 * The APK copies dragged text to the target and clears the source; it does not
 * swap the two texts. Drop acceptance and Android keyed-tag bookkeeping are
 * intentionally outside this helper.
 */
export function transferMathPiece(
  cells: readonly string[],
  sourceIndex: number,
  targetIndex: number,
): string[] {
  if (
    !Number.isInteger(sourceIndex)
    || !Number.isInteger(targetIndex)
    || sourceIndex < 0
    || targetIndex < 0
    || sourceIndex >= cells.length
    || targetIndex >= cells.length
  ) {
    throw new RangeError('Math Pieces cell index is out of range');
  }
  const next = [...cells];
  if (sourceIndex === targetIndex) return next;
  next[targetIndex] = cells[sourceIndex];
  next[sourceIndex] = '';
  return next;
}

export interface MathPiecesEquationState {
  cells: MathPiecesEquationCells;
  isCorrect: boolean;
}

export interface MathPiecesCheckResult {
  equations: MathPiecesEquationState[];
  newlyCorrectCount: number;
  wrongEquationIndexes: number[];
  /**
   * Failures not previously reported for their key. Mirrors the APK's
   * `equtaionTags` (sic) de-duplication: a failing equation's container tag
   * increments wrongAttempts only the first time it appears. Caller-owned key
   * state; when no keys are supplied, every failure counts.
   */
  newWrongAttemptCount: number;
  /** Keys recorded as reported-after-wrong by this call (DEX: equtaionTags). */
  reportedWrongKeys: Array<string | number>;
  gameComplete: boolean;
}

export interface MathPiecesCheckOptions {
  /**
   * Key per equation, parallel to `equations`. The APK keys its passes by
   * each row/column container's LinearLayout tag, so one key per equation
   * record is the matching granularity.
   */
  keys?: readonly (string | number)[];
  /** Mutable caller-owned set of key values already counted as wrong. */
  reportedWrongKeys?: Set<string | number>;
}

/**
 * Mirrors the state portion of checkCorrectEquation() (DEX verified, E-APK-020).
 * The APK rebuilds every PieceEquation for a pass from the live cell views with
 * isCorrect=false, resets a local score, marks valid lines correct, and calls
 * onGameComplete() only when that score reaches the master `equations` list
 * size, which loadData() establishes as rows + columns per level via
 * reset()/setTextOnCells(). Callers must therefore rebuild this input array
 * with isCorrect=false on every pass to preserve DEX parity; a persistent
 * isCorrect=true input models state the APK does not carry across passes
 * and changes the completion decision.
 *
 * Styling-only PieceEquation callbacks (checkEquationCorrect/onWrongEquation)
 * never touch the attempt counters: correctAttempts (DEX field `o`) grows only
 * by +equations.size() on a completing pass inside checkCorrectEquation(), and
 * wrongAttempts (DEX field `p`) grows only inside checkEquations()
 * de-duplicated per container tag; both reset to zero in the class constructor
 * and in reset().
 */
export function checkMathPiecesEquations(
  equations: readonly MathPiecesEquationState[],
  options: MathPiecesCheckOptions = {},
): MathPiecesCheckResult {
  let newlyCorrectCount = 0;
  let newWrongAttemptCount = 0;
  const reportedWrongKeys: Array<string | number> = [];
  const wrongEquationIndexes: number[] = [];
  const next = equations.map((equation, index) => {
    const valid = isMathPiecesEquationCorrect(equation.cells);
    if (!valid) {
      wrongEquationIndexes.push(index);
      if (options.keys !== undefined && options.reportedWrongKeys !== undefined) {
        const key = options.keys[index];
        if (!options.reportedWrongKeys.has(key)) {
          options.reportedWrongKeys.add(key);
          reportedWrongKeys.push(key);
          newWrongAttemptCount += 1;
        }
      }
      return { ...equation };
    }
    if (equation.isCorrect) return { ...equation };
    newlyCorrectCount += 1;
    return { ...equation, isCorrect: true };
  });

  return {
    equations: next,
    newlyCorrectCount,
    wrongEquationIndexes,
    newWrongAttemptCount,
    reportedWrongKeys,
    gameComplete: next.length > 0 && newlyCorrectCount === next.length,
  };
}
