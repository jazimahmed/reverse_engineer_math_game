import type { TopicId } from './game';

// Keep text and symbols together: children need more than color to find a game.
export const TopicPresentation: Record<TopicId, { label: string; symbol: string; description: string; light: string; dark: string }> = {
  addition: { label: 'Add', symbol: '+', description: 'Put numbers together', light: '#DDF5E9', dark: '#173D39' },
  subtraction: { label: 'Subtract', symbol: '−', description: 'Take numbers away', light: '#DCEEFF', dark: '#1C3453' },
  multiplication: { label: 'Multiply', symbol: '×', description: 'Count equal groups', light: '#FFEBCB', dark: '#433321' },
  division: { label: 'Divide', symbol: '÷', description: 'Share into equal groups', light: '#FFE1ED', dark: '#482D42' },
  squareRoot: { label: 'Square roots', symbol: '√', description: 'Find a number’s square root', light: '#ECE2FF', dark: '#362B50' },
  decimal: { label: 'Decimals', symbol: '0.1', description: 'Play with decimal numbers', light: '#D9F4F5', dark: '#183B42' },
  fraction: { label: 'Fractions', symbol: '½', description: 'Explore parts of a whole', light: '#E2E7FF', dark: '#2A3153' },
  games: { label: 'More games', symbol: '🎲', description: 'See what’s coming soon', light: '#FFF0BD', dark: '#3C3722' },
};

export const ModePresentation: Record<string, { label: string; symbol: string; description: string }> = {
  practice: { label: 'Practice', symbol: '🎯', description: 'Pick an answer. Try again if you need to!' },
  quiz: { label: 'Missing number', symbol: '?', description: 'Find the number hiding behind the ?' },
  duel: { label: 'Play with a friend', symbol: '👫', description: 'Two players share one screen.' },
  test: { label: 'True or false?', symbol: '✓ ✕', description: 'Does the number sentence look right?' },
  time: { label: 'Beat the clock', symbol: '⏱', description: 'Answer before the time runs out!' },
  play: { label: 'Type the answer', symbol: '123', description: 'Use the number buttons to answer.' },
  learn: { label: 'Learn together', symbol: '📖', description: 'See how to solve each question.' },
  hard: { label: 'Big challenge', symbol: '🚀', description: 'Try some bigger numbers!' },
  exam: { label: 'One-try challenge', symbol: '⭐', description: 'Choose carefully. You get one try.' },
  addition: { label: 'Add', symbol: '+', description: 'Put the numbers together.' },
  subtract: { label: 'Subtract', symbol: '−', description: 'Take the second number away.' },
  multiply: { label: 'Multiply', symbol: '×', description: 'Multiply the numbers together.' },
  division: { label: 'Divide', symbol: '÷', description: 'Share the first number into groups.' },
};
