// QuizView - Evidence: SPEC_ADDITION_QUIZ.md, E-RT-023
// Missing-operand format: n1 + ? = answer, 4 options, same scoring as Practice

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { QuestionState } from '@store/index';
import { Colors } from '@constants/index';
import { GameConstants } from '@constants/index';

interface QuizViewProps {
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  currentQuestion: QuestionState | null;
  colors: typeof Colors.light;
  night: boolean;
  onAnswer: (userAnswer: number, isCorrect: boolean, firstTry: boolean) => void;
}

export function QuizView({
  questionIndex,
  totalQuestions,
  greenChip,
  redChip,
  currentQuestion,
  colors,
  night,
  onAnswer,
}: QuizViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [optionStates, setOptionStates] = useState<Record<number, 'idle' | 'correct' | 'wrong'>>({});
  const flashAnim = useRef(new Animated.Value(0)).current;

  const q = currentQuestion;
  if (!q) return null;

  const isFinalQuestion = questionIndex === totalQuestions;
  const bgColor = showFlash
    ? colors.correctFlash
    : isFinalQuestion
      ? colors.finalQuestion
      : colors.background;

  const handlePress = (optionIndex: number, userAnswer: number) => {
    if (selectedOption !== null) return;
    const isCorrect = userAnswer === q.correctOptionIndex ? true : userAnswer === q.options[q.correctOptionIndex];
    // Correct answer is the missing operand (n2)
    const correctValue = q.options[q.correctOptionIndex];
    const isCorrectAnswer = userAnswer === correctValue;
    const firstTry = optionStates[optionIndex] !== 'wrong';

    setSelectedOption(optionIndex);
    setOptionStates((prev) => ({ ...prev, [optionIndex]: isCorrectAnswer ? 'correct' : 'wrong' }));

    if (isCorrectAnswer) {
      setShowFlash(true);
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowFlash(false));

      onAnswer(userAnswer, true, firstTry);
    } else {
      onAnswer(userAnswer, false, firstTry);
    }
  };

  useEffect(() => {
    setSelectedOption(null);
    setOptionStates({});
    setShowFlash(false);
  }, [questionIndex]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Text style={[styles.qno, { color: colors.textPrimary }]}>{questionIndex}</Text>
          <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>/{totalQuestions}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => {}}>
          <Text style={{ fontSize: 24, color: night ? colors.nightText : '#E91E63' }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.counters}>
        <View style={[styles.chip, { backgroundColor: colors.greenChip }]}>
          <Text style={styles.chipText}>{greenChip}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.redChip }]}>
          <Text style={styles.chipText}>{redChip}</Text>
        </View>
      </View>

      <View style={styles.equation}>
        <Text style={[styles.eqNumber, { color: colors.textPrimary }]}>{q.n1}</Text>
        <Text style={[styles.eqOperator, { color: colors.textPrimary }]}>{q.operator}</Text>
        <Text style={[styles.eqNumber, { color: colors.textPrimary, fontStyle: 'italic' }]}>?</Text>
        <Text style={[styles.eqOperator, { color: colors.textPrimary }]}>=</Text>
        <Text style={[styles.eqAnswer, { color: colors.textPrimary }]}>{q.answer}</Text>
      </View>

      <View style={styles.optionsGrid}>
        {q.options.map((opt: number, idx: number) => {
          const state = optionStates[idx] || 'idle';
          const isWrong = state === 'wrong';
          const isCorrect = state === 'correct';
          const btnColor = isWrong ? colors.wrongOption : isCorrect ? colors.greenChip : colors.surface;
          const textColor = isWrong ? colors.wrongText : colors.textPrimary;

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.optionBtn, { backgroundColor: btnColor }]}
              onPress={() => handlePress(idx, opt)}
              disabled={selectedOption !== null}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.pencilBtn} onPress={() => {}}>
        <Text style={{ fontSize: 24, color: '#E53935' }}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
  },
  headerLeft: { width: 50 },
  headerCenter: { flex: 1, alignItems: 'center' },
  qno: { fontSize: 28, fontWeight: '700' },
  questionLabel: { fontSize: 20, fontWeight: '400' },
  settingsBtn: { width: 50, alignItems: 'flex-end' },
  counters: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  equation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  eqNumber: { fontSize: 48, fontWeight: '700' },
  eqOperator: { fontSize: 48, fontWeight: '700' },
  eqAnswer: { fontSize: 48, fontWeight: '700', color: '#4CAF50' },
  optionsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  optionBtn: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: { fontSize: 36, fontWeight: '700' },
  pencilBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});