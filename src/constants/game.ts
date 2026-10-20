// Game constants from runtime observation (E-RT-005, E-RT-019, E-RT-020)

export const GameConstants = {
  // Round structure
  PRACTICE_QUESTIONS_PER_ROUND: 10,
  QUIZ_QUESTIONS_PER_ROUND: 10,
  TEST_QUESTIONS_PER_ROUND: 10,
  TIME_QUESTIONS_PER_ROUND: 10,

  // Time mode
  TIME_PER_QUESTION_MS: 4500,         // ~4.5s auto-advance (E-RT-024)

  // Addition Game 1 operand range (observed)
  ADDITION_GAME1_MIN_OPERAND: 0,
  ADDITION_GAME1_MAX_OPERAND: 10,

  // Options
  OPTIONS_PER_QUESTION: 4,
  OPTION_GRID_COLS: 2,
  OPTION_GRID_ROWS: 2,

  // Counters
  GREEN_CHIP_FIRST_TRY_ONLY: true,
  RED_CHIP_RETRY_COUNT: true,
  WRONG_ATTEMPT_DEDUP_PER_QUESTION: true,

  // Equations (Math Pieces Easy)
  EQUATIONS_EASY_GRID_SIZE: 5,        // 5x5
  EQUATIONS_EASY_TRAY_DIGITS: [1,2,3,4,5,6,7,8,9,0],
  EQUATIONS_EASY_TRAY_SPECIAL: ['backspace', 'ad_hint'],
  EQUATIONS_EASY_COUNTDOWN_START: 43, // Observed start value

  // Duel
  DUEL_CHIP_CROSS_INCREMENT: true,    // Bottom correct -> top chip++
  DUEL_WRONG_DECREMENTS: true,        // Wrong tap decrements chip
  DUEL_CHIPS_CAN_GO_NEGATIVE: true,

  // Test/Time True/False
  TEST_MODE_VERDICT_ONLY: true,
  TIME_MODE_AUTO_ADVANCE: true,

  // Settings
  SETTINGS_DEFAULTS: {
    music: true,
    sound: true,
    night: false,
  },

  // Navigation
  SPLASH_DURATION_MS: 12000,          // 10-15s observed
  QUESTION_TRANSITION_MS: 900,        // ~0.9s after correct

  // Persistence keys
  STORAGE_KEYS: {
    SETTINGS: 'mg_settings_v1',
    ADDITION_PROGRESS: 'mg_addition_progress_v1',
    EQUATIONS_PROGRESS: 'mg_equations_progress_v1',
    NIGHT_MODE: 'mg_night_mode_v1',
  },
} as const;

export type TopicId =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'squareRoot'
  | 'decimal'
  | 'fraction'
  | 'games';

export type AdditionModeId =
  | 'practice'
  | 'quiz'
  | 'duel'
  | 'play'
  | 'test'
  | 'time'
  | 'learn'
  | 'hard';

export type ModeId = AdditionModeId | string; // Other topics have different modes

export const TopicConfig: Record<TopicId, { title: string; modes: ModeId[] }> = {
  addition: { title: 'Addition', modes: ['practice', 'quiz', 'duel', 'play', 'test', 'time', 'learn', 'hard'] },
  subtraction: { title: 'Subtract', modes: ['practice', 'quiz', 'duel', 'play', 'test', 'time', 'learn', 'hard'] },
  multiplication: { title: 'Multiply', modes: ['learn', 'exam', 'practice', 'quiz', 'duel', 'play', 'test', 'time'] },
  division: { title: 'Division', modes: ['learn', 'exam', 'practice', 'quiz', 'duel', 'play', 'test', 'time'] },
  squareRoot: { title: 'Square Root', modes: ['learn', 'play', 'practice'] }, // 6 tiles, 3 unique labels
  decimal: { title: 'Decimals', modes: ['addition', 'subtract', 'duel', 'play'] }, // Cross-topic
  fraction: { title: 'Fractions', modes: ['addition', 'subtract', 'multiply', 'division', 'hard', 'play'] }, // Cross-topic
  games: { title: 'Games', modes: [] }, // Hub, not arithmetic
};