import type { ComponentProps } from 'react';
import type { PlayfulIcon } from '../components/PlayfulIcon';
import type { TopicId } from './game';

// Short visible labels pair with illustrations; descriptions remain available as hints.
export const TopicPresentation: Record<TopicId, { label: string; description: string }> = {
  addition: { label: 'Add', description: 'Put numbers together' },
  subtraction: { label: 'Subtract', description: 'Take numbers away' },
  multiplication: { label: 'Multiply', description: 'Count equal groups' },
  division: { label: 'Divide', description: 'Share into equal groups' },
  squareRoot: { label: 'Square roots', description: 'Find a number’s square root' },
  decimal: { label: 'Decimals', description: 'Play with decimal numbers' },
  fraction: { label: 'Fractions', description: 'Explore parts of a whole' },
  games: { label: 'More games', description: 'See what’s coming soon' },
};

export const ModePresentation: Record<string, { label: string; shortLabel: string; icon: ComponentProps<typeof PlayfulIcon>['name']; description: string }> = {
  practice: { label: 'Practice', shortLabel: 'Practice', icon: 'practice', description: 'Pick an answer. Try again if you need to!' },
  quiz: { label: 'Missing number', shortLabel: 'Missing number', icon: 'quiz', description: 'Find the number hiding behind the ?' },
  duel: { label: 'Play with a friend', shortLabel: 'Two players', icon: 'duel', description: 'Two players share one screen.' },
  test: { label: 'True or false?', shortLabel: 'True or false?', icon: 'test', description: 'Does the number sentence look right?' },
  time: { label: 'Beat the clock', shortLabel: 'Beat the clock', icon: 'time', description: 'Answer before the time runs out!' },
  play: { label: 'Type the answer', shortLabel: 'Type it!', icon: 'play', description: 'Use the number buttons to answer.' },
  learn: { label: 'Learn together', shortLabel: 'Learn', icon: 'learn', description: 'See how to solve each question.' },
  hard: { label: 'Big challenge', shortLabel: 'Big challenge', icon: 'hard', description: 'Try some bigger numbers!' },
  exam: { label: 'One-try challenge', shortLabel: 'One try!', icon: 'exam', description: 'Choose carefully. You get one try.' },
  addition: { label: 'Add', shortLabel: 'Add', icon: 'addition', description: 'Put the numbers together.' },
  subtract: { label: 'Subtract', shortLabel: 'Subtract', icon: 'subtraction', description: 'Take the second number away.' },
  multiply: { label: 'Multiply', shortLabel: 'Multiply', icon: 'multiplication', description: 'Multiply the numbers together.' },
  division: { label: 'Divide', shortLabel: 'Divide', icon: 'division', description: 'Share the first number into groups.' },
};
