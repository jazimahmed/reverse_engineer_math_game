// Game Screen - Evidence: SPEC_ADDITION_*.md, E-RT-005..E-RT-026
// Handles all Addition modes: Practice, Quiz, Duel, Test, Time, Play, Learn
// Routes to appropriate sub-component based on mode

import React, { useEffect, useCallback } from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { GameConstants } from '../constants/game';
import { useGameSessionStore, GameMode, QuestionState, DuelQuestionState } from '../store/gameSessionStore';
import { useSettingsStore } from '../store';
import { generatePracticeQuestion, generateQuizQuestion, generateTestQuestion } from '../utils/questionGenerator';
import { PracticeView } from '../components/PracticeView';
import { QuizView } from '../components/QuizView';
import { DuelView } from '../components/DuelView';
import { TestView } from '../components/TestView';
import { TimeView } from '../components/TimeView';
import { PlayView } from '../components/PlayView';
import { LearnView } from '../components/LearnView';

type GameRoute = RouteProp<RootStackParamList, 'Game'>;

// Type for the current question based on game mode
type CurrentQuestion = QuestionState | DuelQuestionState | null;

export function GameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { modeId, topicId } = route.params;

  const night = useSettingsStore((s) => s.night);
  const themeColors = night ? Colors.dark : Colors.light;

  const {
    mode,
    questionIndex,
    totalQuestions,
    greenChip,
    redChip,
    duelChipTop,
    duelChipBottom,
    currentQuestion,
    isActive,
    timeRemaining,
    startGame,
    nextQuestion,
    recordAnswer,
    recordDuelAnswer,
    setQuestion,
    tickTime,
    endGame,
    reset,
  } = useGameSessionStore();

  // Map modeId to internal GameMode
  const gameModeMap: Record<string, GameMode> = {
    practice: 'addition_practice',
    quiz: 'addition_quiz',
    duel: 'addition_duel',
    test: 'addition_test',
    time: 'addition_time',
    play: 'addition_play',
    learn: 'addition_learn',
    hard: 'addition_practice', // Fallback - UNKNOWN
  };

  const gameMode = gameModeMap[modeId] || 'addition_practice';

  // Initialize game on mount
  useEffect(() => {
    if (!isActive || mode !== gameMode) {
      startGame(gameMode, GameConstants.PRACTICE_QUESTIONS_PER_ROUND);
      loadNextQuestion();
    }
    return () => {
      // Don't reset on unmount - keep session for result screen
    };
  }, []);

  // Timer for Time mode
  useEffect(() => {
    if (gameMode !== 'addition_time' || !isActive) return;
    const interval = setInterval(() => tickTime(100), 100);
    return () => clearInterval(interval);
  }, [gameMode, isActive]);

  const loadNextQuestion = useCallback(() => {
    let q: CurrentQuestion;
    switch (gameMode) {
      case 'addition_practice':
        q = generatePracticeQuestion();
        break;
      case 'addition_quiz':
        q = generateQuizQuestion();
        break;
      case 'addition_test':
        q = generateTestQuestion();
        break;
      case 'addition_time':
        q = generateTestQuestion(); // Same format as Test
        break;
      case 'addition_duel':
        const base = generatePracticeQuestion();
        q = { top: base, bottom: base };
        break;
      default:
        q = generatePracticeQuestion();
    }
    setQuestion(q);
  }, [gameMode, setQuestion]);

  const handleAnswer = (userAnswer: number | boolean, isCorrect: boolean, firstTry: boolean) => {
    recordAnswer(userAnswer, isCorrect, firstTry);
    if (isCorrect) {
      if (questionIndex < totalQuestions) {
        setTimeout(loadNextQuestion, GameConstants.QUESTION_TRANSITION_MS);
      } else {
        endGame();
        navigateToResult();
      }
    }
    // Wrong answer: stay on same question (handled by recordAnswer)
  };

  const handleDuelAnswer = (half: 'top' | 'bottom', isCorrect: boolean) => {
    recordDuelAnswer(half, isCorrect);
    // In Duel, both halves advance together on correct
    if (isCorrect) {
      if (questionIndex < totalQuestions) {
        setTimeout(loadNextQuestion, GameConstants.QUESTION_TRANSITION_MS);
      } else {
        endGame();
        navigateToResult();
      }
    }
  };

  const navigateToResult = () => {
    const { greenChip, redChip, questionHistory, duelChipTop, duelChipBottom } = useGameSessionStore.getState();
    navigation.navigate('Result', {
      modeId,
      topicId,
      score: {
        greenChip,
        redChip,
        totalQuestions,
        questionHistory: questionHistory.map(h => ({
          ...h,
          question: `${h.question.n1} ${h.question.operator} ${h.question.n2} = ${h.question.answer}`,
        })),
        duelChipTop,
        duelChipBottom,
      },
    });
  };

  // Render appropriate view based on mode
  const renderGameView = () => {
    // Cast currentQuestion to the appropriate type for each view
    const practiceQuestion = currentQuestion as QuestionState | null;
    const quizQuestion = currentQuestion as QuestionState | null;
    const testQuestion = currentQuestion as QuestionState | null;
    const timeQuestion = currentQuestion as QuestionState | null;
    const playQuestion = currentQuestion as QuestionState | null;
    const learnQuestion = currentQuestion as QuestionState | null;
    const duelQuestion = currentQuestion as DuelQuestionState | null;

    const baseProps = {
      questionIndex,
      totalQuestions,
      greenChip,
      redChip,
      colors: themeColors as typeof import('@constants/index').Colors.light,
      night,
      onAnswer: handleAnswer,
      onDuelAnswer: handleDuelAnswer,
      timeRemaining,
    };

    switch (gameMode) {
      case 'addition_practice':
        return <PracticeView {...baseProps} currentQuestion={practiceQuestion} />;
      case 'addition_quiz':
        return <QuizView {...baseProps} currentQuestion={quizQuestion} />;
      case 'addition_duel':
        return <DuelView {...baseProps} currentQuestion={duelQuestion} duelChipTop={duelChipTop} duelChipBottom={duelChipBottom} />;
      case 'addition_test':
        return <TestView {...baseProps} currentQuestion={testQuestion} />;
      case 'addition_time':
        return <TimeView {...baseProps} currentQuestion={timeQuestion} />;
      case 'addition_play':
        return <PlayView {...baseProps} currentQuestion={playQuestion} />;
      case 'addition_learn':
        return <LearnView {...baseProps} currentQuestion={learnQuestion} />;
      default:
        return <PracticeView {...baseProps} currentQuestion={practiceQuestion} />;
    }
  };

  if (!isActive) {
    return null; // Will show Result screen via navigation
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {renderGameView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});