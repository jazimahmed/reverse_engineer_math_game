/** Code-level behavior observed in RandomGameActivity.calResult(String[]). */
export type RandomNumberOperator = '+' | '-' | '×' | '÷';

const operators = new Set<string>(['+', '-', '×', '÷']);

/**
 * Mirrors RandomGameActivity.checkInput(String, int): slot 1 is the operator
 * slot; every other slot is treated as an operand slot. This checks operator
 * category only; it does not validate that a non-operator is a valid integer.
 */
export function isRandomNumberSelectionValid(value: string, slotIndex: number): boolean {
  const isOperator = operators.has(value);
  return slotIndex === 1 ? isOperator : !isOperator;
}

function parseJavaInt(value: string | undefined): number {
  // Java Integer.parseInt rejects whitespace, decimals, empty strings, and
  // values outside signed 32-bit range. The APK's supplied numbers are ASCII.
  if (value === undefined || !/^[+-]?\d+$/.test(value)) throw new Error('Invalid integer');
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < -2147483648 || parsed > 2147483647) {
    throw new Error('Integer out of range');
  }
  return parsed;
}

/**
 * Reproduces the APK evaluator: args are [left, operator, right]. Invalid
 * operands/operators and guarded division return 0, matching its catch/fallback.
 * Java integer overflow is preserved for the arithmetic operations.
 */
export function calculateRandomNumberExpression(parts: readonly string[]): number {
  try {
    const left = parseJavaInt(parts[0]);
    const operator = parts[1];
    const right = parseJavaInt(parts[2]);

    switch (operator) {
      case '+': return (left + right) | 0;
      case '-': return (left - right) | 0;
      case '×': return Math.imul(left, right);
      case '÷': return right !== 0 && left >= right ? Math.trunc(left / right) : 0;
      default: return 0;
    }
  } catch {
    return 0;
  }
}

export interface RandomNumberLevelData {
  numbers: readonly number[];
  randomNumber: number;
  hints: readonly string[];
  maxHints: number;
}

/** Parse the data-driven level format used by randomNumberData.json. */
export function parseRandomNumberLevelDataset(raw: unknown): RandomNumberLevelData[] {
  if (typeof raw !== 'object' || raw === null || !('levels' in raw) || !Array.isArray(raw.levels)) {
    throw new Error('Invalid random-number level dataset');
  }

  return raw.levels.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`Invalid random-number level at index ${index}`);
    }
    const candidate = entry as Record<string, unknown>;
    if (
      !Array.isArray(candidate.numbers) ||
      !candidate.numbers.every((value) => Number.isSafeInteger(value)) ||
      !Number.isSafeInteger(candidate.randomNumber) ||
      !Array.isArray(candidate.hints) ||
      !candidate.hints.every((hint) => typeof hint === 'string') ||
      !Number.isSafeInteger(candidate.maxHints) ||
      (candidate.maxHints as number) < 0
    ) {
      throw new Error(`Invalid random-number level at index ${index}`);
    }

    return {
      numbers: candidate.numbers as number[],
      randomNumber: candidate.randomNumber as number,
      hints: candidate.hints as string[],
      maxHints: candidate.maxHints as number,
    };
  });
}

export interface RandomNumberLevelConfig {
  numbers: readonly number[];
  target: number;
  hints: readonly string[];
  maxHints: number;
  equationRows: number;
  numberGridColumns: number;
  numberSelectionEnabledAtStart: true;
  operatorSelectionEnabledAtStart: false;
}

/** Mirrors RandomGameActivity.startGame() level-derived initialization values. */
export function buildRandomNumberLevelConfig(
  data: RandomNumberLevelData,
): RandomNumberLevelConfig {
  const equationRows = data.maxHints === 4 ? data.maxHints + 2 : data.maxHints + 1;
  return {
    numbers: data.numbers,
    target: data.randomNumber,
    hints: data.hints,
    maxHints: data.maxHints,
    equationRows,
    numberGridColumns: Math.floor(data.numbers.length / 2) + 2,
    numberSelectionEnabledAtStart: true,
    operatorSelectionEnabledAtStart: false,
  };
}

export interface RandomNumberHintRequest {
  clickCount: number;
  openDialog: boolean;
}

/** Mirrors showNewHint(): if hint data exists, open the dialog; clamp increments. */
export function requestRandomNumberHint(
  currentClickCount: number,
  maxHints: number,
  hasHintData: boolean,
): RandomNumberHintRequest {
  if (!hasHintData) return { clickCount: currentClickCount, openDialog: false };
  const next = currentClickCount + 1;
  return {
    clickCount: next <= maxHints ? next : currentClickCount,
    openDialog: true,
  };
}

export type RandomNumberHintClickAction = 'ignore' | 'show_hint' | 'show_rewarded_video';

/** Mirrors the hint-button branch in RandomGameActivity.onClick(). */
export function chooseRandomNumberHintClickAction(options: {
  clickable: boolean;
  unlimitedHints: boolean;
  clickCount: number;
  maxHints: number;
}): RandomNumberHintClickAction {
  if (!options.clickable) return 'ignore';
  if (options.unlimitedHints || options.clickCount < options.maxHints) return 'show_hint';
  return 'show_rewarded_video';
}

export type RandomNumberTargetBranch =
  | { kind: 'result_activity'; levelCompleted: true; savedHighestLevel: number }
  | { kind: 'next_row'; rowIndex: number; previousResult: number; numberSelectionEnabled: false; operatorSelectionEnabled: true }
  | { kind: 'target_feedback'; levelCompleted: false; playsSound: true; showsToast: true; animatesUndo: true }
  | { kind: 'no_transition'; levelCompleted: false };

/**
 * Mirrors completeEqTwo() after the current expression has been appended to
 * the result list. This deliberately describes code branches, not win/loss
 * meaning: the APK's gameOver() name and result screen do not establish that.
 */
export function resolveRandomNumberTargetBranch(options: {
  value: number;
  target: number;
  resultCount: number;
  maxRows: number;
  levelPosition: number;
  savedHighestLevel: number;
}): RandomNumberTargetBranch {
  if (options.value !== options.target) {
    const completedLevel = options.levelPosition + 1;
    return {
      kind: 'result_activity',
      levelCompleted: true,
      savedHighestLevel: completedLevel > options.savedHighestLevel
        ? completedLevel
        : options.savedHighestLevel,
    };
  }

  if (options.resultCount === options.maxRows && options.resultCount > 0) {
    return {
      kind: 'target_feedback',
      levelCompleted: false,
      playsSound: true,
      showsToast: true,
      animatesUndo: true,
    };
  }

  if (options.resultCount > 0 && options.resultCount < options.maxRows) {
    return {
      kind: 'next_row',
      rowIndex: options.resultCount,
      previousResult: options.value,
      numberSelectionEnabled: false,
      operatorSelectionEnabled: true,
    };
  }

  return { kind: 'no_transition', levelCompleted: false };
}

export interface RandomNumberNextLevelState {
  levelPosition: number;
  levelNumber: number;
  savedHighestLevel: number;
}

/** Mirrors Result_Game2Activity.nextLevel() for the RANDOM_NUMBER branch. */
export function advanceRandomNumberResultLevel(options: {
  currentLevelPosition: number;
  savedHighestLevel: number;
}): RandomNumberNextLevelState {
  const levelPosition = options.currentLevelPosition + 1;
  return {
    levelPosition,
    levelNumber: levelPosition + 1,
    savedHighestLevel: levelPosition > options.savedHighestLevel
      ? levelPosition
      : options.savedHighestLevel,
  };
}
