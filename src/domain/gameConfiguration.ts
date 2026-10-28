import { TopicConfig, TopicId } from '../constants/game';
import type { GameMode } from '../store/gameSessionStore';

export type ArithmeticTopic = Exclude<TopicId, 'games'>;
export type Operation = '+' | '-' | 'x' | '÷' | '√';
export type GameView = 'practice' | 'quiz' | 'duel' | 'test' | 'time' | 'play' | 'learn' | 'exam';
export interface GameConfiguration {
  topicId: ArithmeticTopic;
  modeId: string;
  operation: Operation;
  view: GameView;
  engineMode: GameMode;
  hard: boolean;
  title: string;
}

const operations: Record<ArithmeticTopic, Operation> = {
  addition: '+', subtraction: '-', multiplication: 'x', division: '÷', squareRoot: '√', decimal: '+', fraction: '+',
};
const engines: Record<GameView, GameMode> = {
  practice: 'addition_practice', quiz: 'addition_quiz', duel: 'addition_duel', test: 'addition_test',
  time: 'addition_time', play: 'addition_play', learn: 'addition_learn', exam: 'addition_exam',
};
const operationModes: Record<string, Operation> = { addition: '+', subtract: '-', multiply: 'x', division: '÷' };

export function resolveGameConfiguration(topicId: string, modeId: string): GameConfiguration | null {
  if (!Object.prototype.hasOwnProperty.call(operations, topicId)) return null;
  const topic = topicId as ArithmeticTopic;
  const config = TopicConfig[topic];
  if (!config.modes.includes(modeId)) return null;
  const view: GameView = modeId === 'hard' || Object.prototype.hasOwnProperty.call(operationModes, modeId) ? 'practice' : modeId as GameView;
  if (!Object.prototype.hasOwnProperty.call(engines, view)) return null;
  return { topicId: topic, modeId, operation: operationModes[modeId] ?? operations[topic], view,
    engineMode: engines[view], hard: modeId === 'hard', title: config.title };
}
