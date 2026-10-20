// Navigation types and param lists
// Evidence: SPEC_NAVIGATION.md, E-RT-001..E-RT-010, E-RT-019

import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  TopicSelect: { topicId: string };
  ModeSelect: { topicId: string };
  Game: { modeId: string; topicId: string; gameTier?: number };
  Result: { modeId: string; topicId: string; score: GameScore };
  Settings: undefined;
  GamesHub: undefined;
  EquationsLevels: undefined;
  EquationsBoard: { level: number };
  // Other mini-games (UNKNOWN)
  Game2048: undefined;
  GameFifteen: undefined;
  GamePuzzle: undefined;
  GameMatch: undefined;
  GameSudoku: undefined;
  GameMix: undefined;
  GameMemory: undefined;
};

export interface GameScore {
  greenChip: number;    // First-try correct
  redChip: number;      // Retry count
  totalQuestions: number;
  questionHistory: Array<{
    question: string;
    userAnswer: number | boolean | null;
    correct: boolean;
    firstTry: boolean;
  }>;
  // Duel
  duelChipTop?: number;
  duelChipBottom?: number;
  // Time
  timeElapsed?: number;
}

export type MainTabParamList = {
  Home: undefined; // Main menu
  // Future: Profile, Leaderboards, etc.
};

export type TopicId =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'squareRoot'
  | 'decimal'
  | 'fraction'
  | 'games';

// All mode IDs across all topics
export type ModeId =
  | 'practice'
  | 'quiz'
  | 'duel'
  | 'play'
  | 'test'
  | 'time'
  | 'learn'
  | 'hard'
  | 'exam'
  | 'subtract'
  | 'multiply'
  | 'addition'
  | 'division';

export type AdditionModeId =
  | 'practice'
  | 'quiz'
  | 'duel'
  | 'play'
  | 'test'
  | 'time'
  | 'learn'
  | 'hard';

export const TopicConfigs: Record<TopicId, { title: string; modes: ModeId[]; activity: string }> = {
  addition: { title: 'Addition', modes: ['practice', 'quiz', 'duel', 'play', 'test', 'time', 'learn', 'hard'], activity: 'AdditionActivity' },
  subtraction: { title: 'Subtract', modes: ['practice', 'quiz', 'duel', 'play', 'test', 'time', 'learn', 'hard'], activity: 'SubtractionActivity' },
  multiplication: { title: 'Multiply', modes: ['learn', 'exam', 'practice', 'quiz', 'duel', 'play', 'test', 'time'], activity: 'MultiplicationActivity' },
  division: { title: 'Division', modes: ['learn', 'exam', 'practice', 'quiz', 'duel', 'play', 'test', 'time'], activity: 'DivisionActivity' },
  squareRoot: { title: 'Square Root', modes: ['learn', 'play', 'practice'], activity: 'ExponentialActivity' },
  decimal: { title: 'Decimals', modes: ['addition', 'subtract', 'duel', 'play'], activity: 'DecimalActivity' },
  fraction: { title: 'Fractions', modes: ['addition', 'subtract', 'multiply', 'division', 'hard', 'play'], activity: 'FractionActivity' },
  games: { title: 'Games', modes: [], activity: 'GameActivity' },
};

export const ModeLabels: Record<ModeId, string> = {
  practice: 'Practice',
  quiz: 'Quiz',
  duel: 'Duel',
  play: 'Play',
  test: 'Test',
  time: 'Time',
  learn: 'Learn',
  hard: 'Hard',
  exam: 'Exam',
  subtract: 'Subtract',
  multiply: 'Multiply',
  addition: 'Addition',
  division: 'Division',
};