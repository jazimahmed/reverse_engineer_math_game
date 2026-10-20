// Color constants from runtime observation (E-RT-002, E-RT-005, E-RT-007, E-RT-011)

export const Colors = {
  // Light theme (default)
  light: {
    background: '#49C2FF',        // Practice idle (observed session 1)
    backgroundAlt: '#99CC00',     // Practice idle (observed session 2)
    backgroundAlt2: '#2A52A3',    // Practice idle (observed session 3)
    // Note: idle background cycles per session; semantic states below are stable
    correctFlash: '#0E7C00',      // Green flash on correct answer
    finalQuestion: '#FEB401',     // Orange on Q10
    wrongOption: '#FF0000',       // Red button on wrong tap
    wrongText: '#000000',         // Black text on wrong option
    surface: '#FFFFFF',
    surfaceDark: '#F4F6F8',
    textPrimary: '#1D2733',
    textSecondary: '#4B5968',
    border: '#E0E4E8',
    // Topic tile colors (observed)
    addition: '#4CAF50',          // Green
    subtraction: '#2196F3',       // Light blue
    multiplication: '#FF9800',    // Orange
    division: '#E91E63',          // Pink (drawn as checkmark)
    squareRoot: '#9C27B0',        // Purple
    decimal: '#00BCD4',           // Teal
    fraction: '#3F51B5',          // Blue
    games: '#2E7D32',             // Dark green
    // UI
    settingsBg: '#7B1FA2',        // Purple dialog
    nightBg: '#121212',           // Near-black
    nightSurface: '#1E1E1E',      // Dark grey tiles
    nightBorder: '#333333',       // Light grey borders
    nightText: '#FFFFFF',         // White glyphs
    // Counters
    greenChip: '#4CAF50',
    redChip: '#F44336',
    // Result screen
    restartBtn: '#00BCD4',        // Cyan
    exitBtn: '#9C27B0',           // Purple
    // Footer icons
    footerBg: '#F5F5F5',
  },

  // Dark theme (Night mode ON)
  dark: {
    background: '#121212',
    backgroundAlt: '#121212',
    backgroundAlt2: '#121212',
    correctFlash: '#2E7D32',
    finalQuestion: '#FF9800',
    wrongOption: '#EF5350',
    wrongText: '#FFFFFF',
    surface: '#1E1E1E',
    surfaceDark: '#2D2D2D',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0BEC5',
    border: '#333333',
    addition: '#4CAF50',
    subtraction: '#64B5F6',
    multiplication: '#FFB74D',
    division: '#F06292',
    squareRoot: '#BA68C8',
    decimal: '#4DD0E1',
    fraction: '#7986CB',
    games: '#66BB6A',
    settingsBg: '#4A148C',
    nightBg: '#121212',
    nightSurface: '#1E1E1E',
    nightBorder: '#333333',
    nightText: '#FFFFFF',
    greenChip: '#66BB6A',
    redChip: '#EF5350',
    restartBtn: '#4DD0E1',
    exitBtn: '#BA68C8',
    footerBg: '#1E1E1E',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorSet = typeof Colors.light;