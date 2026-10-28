// Addition mode host: one controller owns round transitions and timer cleanup.
import React, { useCallback, useRef } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { AppState, SafeAreaView, StyleSheet } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useGameSessionStore, GameMode, QuestionState, DuelQuestionState } from '../store/gameSessionStore';
import { useSettingsStore } from '../store';
import { generatePracticeQuestion, generateQuizQuestion, generateTestQuestion } from '../utils/questionGenerator';
import { createGameRoundController } from '../utils/gameRoundController';
import { PracticeView } from '../components/PracticeView';
import { QuizView } from '../components/QuizView';
import { DuelView } from '../components/DuelView';
import { TestView } from '../components/TestView';
import { TimeView } from '../components/TimeView';
import { PlayView } from '../components/PlayView';
import { LearnView } from '../components/LearnView';

const gameModeMap: Record<string, GameMode> = {
  practice: 'addition_practice',
  quiz: 'addition_quiz',
  duel: 'addition_duel',
  test: 'addition_test',
  time: 'addition_time',
  play: 'addition_play',
  learn: 'addition_learn',
  hard: 'addition_practice', // Existing fallback; topic/mode coverage is a separate repair.
};

function createQuestion(mode: GameMode): QuestionState | DuelQuestionState {
  switch (mode) {
    case 'addition_quiz': return generateQuizQuestion();
    case 'addition_test':
    case 'addition_time': return generateTestQuestion();
    case 'addition_duel': {
      const question = generatePracticeQuestion();
      return { top: question, bottom: question };
    }
    default: return generatePracticeQuestion();
  }
}

export function GameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { modeId, topicId } = route.params;
  const gameMode = gameModeMap[modeId] || 'addition_practice';
  const night = useSettingsStore((s) => s.night);
  const themeColors = night ? Colors.dark : Colors.light;
  const session = useGameSessionStore();
  const controller = useRef<ReturnType<typeof createGameRoundController> | null>(null);

  useFocusEffect(useCallback(() => {
    const round = createGameRoundController({
      store: useGameSessionStore,
      mode: gameMode,
      createQuestion: () => createQuestion(gameMode),
      onComplete: (state) => {
        // Replace the completed game, so Android Back cannot reveal a blank game.
        navigation.replace('Result', {
          modeId,
          topicId,
          score: {
            greenChip: state.greenChip,
            redChip: state.redChip,
            totalQuestions: state.totalQuestions,
            questionHistory: state.questionHistory.map((entry) => ({
              ...entry,
              question: `${entry.question.n1} ${entry.question.operator} ${entry.question.n2} = ${entry.question.answer}`,
            })),
            duelChipTop: state.duelChipTop,
            duelChipBottom: state.duelChipBottom,
          },
        });
      },
    });
    controller.current = round;
    if (AppState.currentState !== 'active') round.pause();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') round.resume();
      else round.pause();
    });
    return () => {
      subscription.remove();
      round.dispose();
      if (controller.current === round) controller.current = null;
    };
  }, [gameMode, modeId, topicId, navigation]));

  const {
    sessionId, questionIndex, totalQuestions, greenChip, redChip,
    duelChipTop, duelChipBottom, currentQuestion, isActive,
    isPaused, questionResolved, timeRemaining,
  } = session;
  // Capture the controller for this render; late native events must not target
  // a replacement controller or question via a newly assigned ref.
  const activeController = controller.current;
  const baseProps = {
    questionIndex,
    totalQuestions,
    greenChip,
    redChip,
    colors: themeColors as typeof Colors.light,
    night,
    disabled: questionResolved || isPaused,
    onAnswer: (answer: number | boolean, correct: boolean, firstTry: boolean) =>
      activeController?.answer(answer, correct, firstTry, questionIndex),
    onDuelAnswer: (half: 'top' | 'bottom', correct: boolean) =>
      activeController?.duelAnswer(half, correct, questionIndex),
    timeRemaining,
  };

  if (!isActive || activeController?.sessionId !== sessionId) return null;

  const renderGameView = () => {
    const question = currentQuestion as QuestionState | null;
    switch (gameMode) {
      case 'addition_quiz': return <QuizView {...baseProps} currentQuestion={question} />;
      case 'addition_duel': return <DuelView {...baseProps} currentQuestion={currentQuestion as DuelQuestionState | null} duelChipTop={duelChipTop} duelChipBottom={duelChipBottom} />;
      case 'addition_test': return <TestView {...baseProps} currentQuestion={question} />;
      case 'addition_time': return <TimeView {...baseProps} currentQuestion={question} />;
      case 'addition_play': return <PlayView {...baseProps} currentQuestion={question} />;
      case 'addition_learn': return <LearnView {...baseProps} currentQuestion={question} />;
      default: return <PracticeView {...baseProps} currentQuestion={question} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {renderGameView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
