/** Multiplayer room quiz generator found in util.GenQuestions in the supplied APK. */
export type MultiplayerOperator = '+' | '-' | 'x';

export interface MultiplayerQuestion {
  id: number;
  left: number;
  right: number;
  operator: MultiplayerOperator;
  answer: number;
}

interface Pattern {
  left: readonly [min: number, maxExclusive: number];
  right: readonly [min: number, maxExclusive: number];
  operationCode: readonly [min: number, maxExclusive: number];
}

function patternFor(index: number): Pattern {
  if (index <= 2) return { left: [10, 50], right: [10, 20], operationCode: [1, 3] };
  if (index === 3) return { left: [20, 50], right: [1, 10], operationCode: [3, 4] };
  if (index <= 5) return { left: [20, 100], right: [10, 20], operationCode: [1, 3] };
  if (index <= 7) return { left: [300, 999], right: [99, 299], operationCode: [1, 3] };
  if (index === 8) return { left: [100, 500], right: [5, 10], operationCode: [3, 4] };
  if (index <= 10) return { left: [1000, 9999], right: [150, 500], operationCode: [1, 3] };
  if (index <= 15) return { left: [100, 999], right: [10, 20], operationCode: [1, 4] };
  return { left: [500, 999], right: [50, 100], operationCode: [1, 4] };
}

function nextInt(min: number, maxExclusive: number, random: () => number): number {
  return Math.floor(random() * (maxExclusive - min)) + min;
}

/** One GenQuestions.ChoseEquatinoPatern result, with APK half-open random ranges. */
export function generateMultiplayerQuestion(
  index: number,
  random: () => number = Math.random,
): MultiplayerQuestion {
  const pattern = patternFor(index);
  let left = nextInt(...pattern.left, random);
  let right = nextInt(...pattern.right, random);
  const operationCode = nextInt(...pattern.operationCode, random);

  let operator: MultiplayerOperator;
  let answer: number;
  if (operationCode === 3) {
    operator = 'x';
    answer = Math.imul(left, right);
  } else if (operationCode === 2) {
    operator = '-';
    if (left < right) [left, right] = [right, left];
    answer = left - right;
  } else {
    operator = '+';
    answer = left + right;
  }
  return { id: index, left, right, operator, answer };
}

/** Mirrors GenQuestions(count).getAllQusetions(). Negative count yields none. */
export function generateMultiplayerQuestions(
  count: number,
  random: () => number = Math.random,
): MultiplayerQuestion[] {
  const safeCount = Math.max(0, Math.trunc(count));
  return Array.from({ length: safeCount }, (_, index) => generateMultiplayerQuestion(index, random));
}
