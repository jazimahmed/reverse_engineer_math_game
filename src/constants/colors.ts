// Shared semantic palette. Feedback colors remain readable in either theme.
export const Colors = {
  light: {
    background: '#FFF9F0', backgroundAlt: '#EEE7FF', backgroundAlt2: '#E1F7ED',
    correctFlash: '#DDF5E9', finalQuestion: '#FFF4DB', wrongOption: '#FCE4E7', wrongText: '#A1263C',
    surface: '#FFFFFF', surfaceDark: '#F0EBFA', textPrimary: '#292244', textSecondary: '#655B78', border: '#DED5EE',
    addition: '#17785D', subtraction: '#2563C1', multiplication: '#A15B16', division: '#B4326A',
    squareRoot: '#7052C1', decimal: '#087F8C', fraction: '#4F5DBC', games: '#17785D',
    settingsBg: '#FFFFFF', nightBg: '#101827', nightSurface: '#1C2940', nightBorder: '#34445E', nightText: '#FFFFFF',
    greenChip: '#17785D', redChip: '#BF3450', restartBtn: '#6543C3', exitBtn: '#655B78', footerBg: '#EEE7FF',
  },
  dark: {
    background: '#101827', backgroundAlt: '#202C48', backgroundAlt2: '#173D39',
    correctFlash: '#173D39', finalQuestion: '#3C3320', wrongOption: '#52283A', wrongText: '#FFBDCB',
    surface: '#1C2940', surfaceDark: '#25344D', textPrimary: '#EFF4FF', textSecondary: '#AABAD4', border: '#34445E',
    addition: '#6AD7B0', subtraction: '#8DBBFF', multiplication: '#F4BE79', division: '#F8A4CA',
    squareRoot: '#C3ADFF', decimal: '#74D7E0', fraction: '#AFB9FF', games: '#6AD7B0',
    settingsBg: '#1C2940', nightBg: '#101827', nightSurface: '#1C2940', nightBorder: '#34445E', nightText: '#FFFFFF',
    greenChip: '#17785D', redChip: '#BF3450', restartBtn: '#6543C3', exitBtn: '#586780', footerBg: '#202C48',
  },
};
export type ThemeMode = 'light' | 'dark';
export type ColorSet = typeof Colors.light;
