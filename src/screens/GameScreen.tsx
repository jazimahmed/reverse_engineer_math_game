// Topic-aware host: one controller owns round transitions and timer cleanup.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { AppState, Modal, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useGameSessionStore, QuestionState, DuelQuestionState } from '../store/gameSessionStore';
import { useSettingsStore } from '../store';
import { createRoundQuestion, formatQuestion } from '../utils/questionGenerator';
import { resolveGameConfiguration } from '../domain/gameConfiguration';
import { useAdditionProgressStore } from '../store/additionProgressStore';
import { createGameRoundController } from '../utils/gameRoundController';
import { PracticeView } from '../components/PracticeView';
import { QuizView } from '../components/QuizView';
import { DuelView } from '../components/DuelView';
import { TestView } from '../components/TestView';
import { TimeView } from '../components/TimeView';
import { PlayView } from '../components/PlayView';
import { LearnView } from '../components/LearnView';
import { ActionButton, AppScreen, PageHeader, ui } from '../components/ui';
import { SettingsPanel } from '../components/SettingsPanel';
import { AnswerView } from '../components/AnswerView';

export function GameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { modeId, topicId } = route.params;
  const config = useMemo(() => resolveGameConfiguration(topicId, modeId), [topicId, modeId]);
  const night = useSettingsStore((s) => s.night);
  const themeColors = night ? Colors.dark : Colors.light;
  const session = useGameSessionStore();
  const controller = useRef<ReturnType<typeof createGameRoundController> | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsVisible = useRef(false);
  const openSettings = () => {
    settingsVisible.current = true;
    controller.current?.pause();
    setSettingsOpen(true);
  };
  const closeSettings = () => {
    settingsVisible.current = false;
    setSettingsOpen(false);
    if (AppState.currentState === 'active') controller.current?.resume();
  };

  useFocusEffect(useCallback(() => {
    if (!config) return;
    const round = createGameRoundController({
      store: useGameSessionStore,
      mode: config.engineMode,
      createQuestion: () => createRoundQuestion(config),
      onComplete: (state) => {
        const key = `${topicId}:${modeId}:game1`;
        const progress = useAdditionProgressStore.getState();
        const previous = progress.getTier(key);
        progress.updateTier(key, {
          completed: true,
          bestScore: Math.max(previous?.bestScore ?? 0, state.greenChip),
          bestRetryCount: previous?.completed ? Math.min(previous.bestRetryCount, state.redChip) : state.redChip,
        });
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
              question: formatQuestion(entry.question),
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
      if (state === 'active' && !settingsVisible.current) round.resume();
      else round.pause();
    });
    return () => {
      subscription.remove();
      round.dispose();
      if (controller.current === round) controller.current = null;
    };
  }, [config, modeId, topicId, navigation]));

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
    onAnswer: (answer: number | boolean, correct: boolean, firstTry: boolean) => {
      const before = useGameSessionStore.getState().questionHistory.length;
      activeController?.answer(answer, correct, firstTry, questionIndex);
      if (correct && useGameSessionStore.getState().questionHistory.length > before && useSettingsStore.getState().haptics
        && useGameSessionStore.getState().questionHistory.at(-1)?.correct) Vibration.vibrate(25);
    },
    onDuelAnswer: (half: 'top' | 'bottom', correct: boolean) => {
      const before = useGameSessionStore.getState().questionHistory.length;
      activeController?.duelAnswer(half, correct, questionIndex);
      if (correct && useGameSessionStore.getState().questionHistory.length > before && useSettingsStore.getState().haptics) Vibration.vibrate(25);
    },
    timeRemaining,
  };

  if (!config) return <AppScreen>
    <PageHeader title="This mode isn’t available" subtitle="Choose a supported topic and mode to keep learning." />
    <ActionButton label="Go back" onPress={() => navigation.goBack()} />
  </AppScreen>;
  if (!isActive || activeController?.sessionId !== sessionId) return null;

  const renderGameView = () => {
    const question = currentQuestion as QuestionState | null;
    switch (config.view) {
      case 'quiz': return <QuizView {...baseProps} currentQuestion={question} />;
      case 'duel': return <DuelView {...baseProps} currentQuestion={currentQuestion as DuelQuestionState | null} duelChipTop={duelChipTop} duelChipBottom={duelChipBottom} />;
      case 'test': return <TestView {...baseProps} currentQuestion={question} />;
      case 'time': return <TimeView {...baseProps} currentQuestion={question} />;
      case 'play': return <PlayView {...baseProps} currentQuestion={question} />;
      case 'learn': return <LearnView {...baseProps} currentQuestion={question} />;
      case 'exam': return <AnswerView {...baseProps} currentQuestion={question} kind="exam" />;
      default: return <PracticeView {...baseProps} currentQuestion={question} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Leave game" onPress={() => navigation.goBack()} style={ui.iconButton}><Text style={{ color: themeColors.textPrimary }}>‹ Back</Text></TouchableOpacity>
        <Text style={{ color: themeColors.textSecondary, flexShrink: 1 }}>{config.title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Game settings" onPress={openSettings} style={ui.iconButton}><Text style={{ color: themeColors.textPrimary }}>Settings</Text></TouchableOpacity>
      </View>
      {renderGameView()}
      <Modal visible={settingsOpen} animationType="slide" onRequestClose={closeSettings}>
        <AppScreen><SettingsPanel onClose={closeSettings} /></AppScreen>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
