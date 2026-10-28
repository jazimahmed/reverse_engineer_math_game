import type { QuestionState, DuelQuestionState } from '../store/gameSessionStore';
import type { GameConfiguration } from '../domain/gameConfiguration';
import { resolveGameConfiguration } from '../domain/gameConfiguration';

type Random = () => number;
type Fraction = { numerator: number; denominator: number };
const integer = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const round = (value: number) => Math.round(value * 10000) / 10000;

function fraction(numerator: number, denominator: number): Fraction {
  let a = Math.abs(numerator), b = Math.abs(denominator);
  while (b) [a, b] = [b, a % b];
  return { numerator: numerator / (a || 1), denominator: denominator / (a || 1) };
}
const valueOf = (value: Fraction) => value.numerator / value.denominator;
const labelOf = (value: Fraction) => value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`;

function shuffle<T>(items: T[], random: Random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = integer(random, 0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Bounded candidates (no random retry loop), so even a constant RNG terminates.
function optionsFor(answer: Fraction, random: Random) {
  const candidates = shuffle([-3, -2, -1, 1, 2, 3], random)
    .filter((offset) => answer.numerator + offset >= 0)
    .slice(0, 3).map((offset) => fraction(answer.numerator + offset, answer.denominator));
  return shuffle([answer, ...candidates], random);
}

export function generateQuestion(config: GameConfiguration, random: Random = Math.random): QuestionState {
  const { topicId, operation, hard, view } = config;
  const max = hard ? 99 : 10;
  let left = fraction(integer(random, 0, max), 1);
  let right = fraction(integer(random, 1, topicId === 'multiplication' || topicId === 'division' ? 12 : max), 1);

  if (topicId === 'decimal') {
    // Non-whole tenths keep this recognizably a decimal exercise.
    left = fraction(integer(random, 0, 9) * 10 + integer(random, 1, 9), 10);
    right = fraction(integer(random, 0, 9) * 10 + integer(random, 1, 9), 10);
  } else if (topicId === 'fraction') {
    const denominator = hard ? 12 : 6;
    left = fraction(integer(random, 1, hard ? 11 : 5), integer(random, 2, denominator));
    right = fraction(integer(random, 1, hard ? 11 : 5), integer(random, 2, denominator));
  }

  if (operation === '-' && valueOf(left) < valueOf(right)) [left, right] = [right, left];
  if (operation === 'x' && view === 'quiz' && left.numerator === 0) left = fraction(1, 1);
  if (operation === '÷' && topicId !== 'fraction') {
    // Integer division exercises always have a non-zero divisor and exact quotient.
    left = fraction(integer(random, 1, hard ? 25 : 12) * right.numerator, right.denominator);
  }
  if (operation === '√') {
    const root = integer(random, 1, hard ? 25 : 12);
    left = fraction(root * root, 1);
    right = fraction(0, 1);
  }

  let solution: Fraction;
  switch (operation) {
    case '+': solution = fraction(left.numerator * right.denominator + right.numerator * left.denominator, left.denominator * right.denominator); break;
    case '-': solution = fraction(left.numerator * right.denominator - right.numerator * left.denominator, left.denominator * right.denominator); break;
    case 'x': solution = fraction(left.numerator * right.numerator, left.denominator * right.denominator); break;
    case '÷': solution = fraction(left.numerator * right.denominator, left.denominator * right.numerator); break;
    case '√': solution = fraction(Math.sqrt(valueOf(left)), 1); break;
  }

  const label = (number: Fraction) => topicId === 'decimal' ? String(round(valueOf(number))) : labelOf(number);
  const leftLabel = label(left), rightLabel = label(right), answerLabel = label(solution);
  const expression = operation === '√' ? `√${leftLabel}` : `${leftLabel} ${operation === 'x' ? '×' : operation} ${rightLabel}`;
  const explanations = {
    '+': 'Combine both amounts to find the total.',
    '-': 'Take the second amount away from the first.',
    'x': 'Multiply the two amounts together.',
    '÷': 'Divide the first amount into equal groups of the second.',
    '√': `Find the number that multiplies by itself to make ${leftLabel}. ${answerLabel} × ${answerLabel} = ${leftLabel}.`,
  };
  const fractionRule = topicId !== 'fraction' ? '' : operation === '+' || operation === '-'
    ? ' Use a common denominator, then combine the numerators and simplify.'
    : operation === 'x' ? ' Multiply numerators and denominators, then simplify.' : ' Multiply by the reciprocal of the second fraction, then simplify.';
  const decimalRule = topicId === 'decimal' ? ' Line up the decimal places before calculating.' : '';
  const question: QuestionState = {
    n1: valueOf(left), n2: valueOf(right), operator: operation, answer: valueOf(solution), options: [], correctOptionIndex: 0,
    display: { n1: leftLabel, n2: rightLabel, answer: answerLabel },
    explanation: `${explanations[operation]}${fractionRule}${decimalRule}\n${expression} = ${answerLabel}`,
  };

  if (view === 'test' || view === 'time') {
    const truthful = random() < 0.5;
    const shown = truthful ? solution : fraction(solution.numerator + integer(random, 1, 3), solution.denominator);
    question.answer = valueOf(shown);
    question.display!.answer = label(shown);
    question.options = [1, 0];
    question.display!.options = ['True', 'False'];
    question.correctOptionIndex = truthful ? 0 : 1;
    question.isTrueFalse = true;
  } else {
    // Quiz asks for the missing second operand, not the equation's result.
    const target = view === 'quiz' ? right : solution;
    if (view === 'quiz') {
      question.n2 = '?';
      question.display!.n2 = '?';
      question.missingOperand = 'n2';
    }
    const options = optionsFor(target, random);
    question.options = options.map(valueOf);
    question.display!.options = options.map(label);
    question.correctOptionIndex = question.options.indexOf(valueOf(target));
  }
  return question;
}

export function createRoundQuestion(config: GameConfiguration, random: Random = Math.random): QuestionState | DuelQuestionState {
  const question = generateQuestion(config, random);
  return config.view === 'duel' ? { top: question, bottom: question } : question;
}

export function formatQuestion(question: QuestionState, hideAnswer = false) {
  const left = question.display?.n1 ?? String(question.n1);
  const right = question.display?.n2 ?? String(question.n2);
  const answer = hideAnswer ? '?' : question.display?.answer ?? String(question.answer);
  return question.operator === '√' ? `√${left} = ${answer}`
    : `${left} ${question.operator === 'x' ? '×' : question.operator} ${right} = ${answer}`;
}

export function parseAnswer(text: string): number | null {
  const normalized = text.trim();
  if (/^-?\d+\s*\/\s*-?\d+$/.test(normalized)) {
    const [numerator, denominator] = normalized.split('/').map(Number);
    return denominator !== 0 && Number.isFinite(numerator / denominator) ? numerator / denominator : null;
  }
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function isAnswerCorrect(input: string, question: QuestionState) {
  const value = parseAnswer(input);
  const expected = question.options[question.correctOptionIndex];
  return value !== null && Math.abs(value - expected) < 1e-8;
}

// Compatibility for existing callers; new routes always pass explicit configuration.
export const generatePracticeQuestion = () => generateQuestion(resolveGameConfiguration('addition', 'practice')!);
export const generateQuizQuestion = () => generateQuestion(resolveGameConfiguration('addition', 'quiz')!);
export const generateTestQuestion = () => generateQuestion(resolveGameConfiguration('addition', 'test')!);
export const generateDuelQuestion = () => createRoundQuestion(resolveGameConfiguration('addition', 'duel')!) as DuelQuestionState;
