// TestView - Evidence: SPEC_ADDITION_TEST.md, E-RT-021
// True/False on complete equation: a + b = c [True] [False]
// Wrong tap increments red immediately, does not advance
// Correct tap advances

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { QuestionState } from '@store/index';
import { Colors } from '@constants/index';

interface TestViewProps {
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  currentQuestion: QuestionState | null;
  colors: typeof Colors.light;
  night: boolean;
  onAnswer: (userAnswer: boolean, isCorrect: boolean, firstTry: boolean) => void;
}

export function TestView({
  questionIndex,
  totalQuestions,
  greenChip,
  redChip,
  currentQuestion,
  colors,
  night,
  onAnswer,
}: TestViewProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<'true' | 'false' | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [verdictStates, setVerdictStates] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const flashAnim = useRef(new Animated.Value(0)).current;

  const q = currentQuestion;
  if (!q || !q.isTrueFalse) return null;

  const isFinalQuestion = questionIndex === totalQuestions;
  const bgColor = showFlash
    ? colors.correctFlash
    : isFinalQuestion
      ? colors.finalQuestion
      : colors.background;

  // Correct verdict
  const correctVerdict = q.correctOptionIndex === 0 ? 'true' : 'false';

  const handlePress = (verdict: 'true' | 'false') => {
    if (selectedVerdict !== null) return;
    const isCorrect = verdict === correctVerdict;
    const firstTry = verdictStates[verdict] !== 'wrong';

    setSelectedVerdict(verdict);
    setVerdictStates((prev) => ({ ...prev, [verdict]: isCorrect ? 'correct' : 'wrong' }));

    if (isCorrect) {
      setShowFlash(true);
      // onAnswer advances the question
      onAnswer(verdict === 'true', true, firstTry);
      setTimeout(() => setShowFlash(false), 300);
    } else {
      // Wrong - immediate red increment, no advance
      onAnswer(verdict === 'true', false, firstTry);
    }
  };

  useEffect(() => {
    setSelectedVerdict(null);
    setVerdictStates({});
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
        <Text style={[styles.eqNumber, { color: colors.textPrimary }]}>{q.n2}</Text>
        <Text style={[styles.eqOperator, { color: colors.textPrimary }]}>=</Text>
        <Text style={[styles.eqAnswer, { color: colors.textPrimary }]}>{q.answer}</Text>
      </View>

      <View style={styles.verdictButtons}>
        {(['true', 'false'] as const).map((v: 'true' | 'false') => {
          const state = verdictStates[v] || 'idle';
          const isWrong = state === 'wrong';
          const isCorrect = state === 'correct';
          return (
            <TouchableOpacity
              key={v}
              style={[styles.verdictBtn, { backgroundColor: isWrong ? colors.wrongOption : isCorrect ? colors.greenChip : colors.surface }]}
              onPress={() => handlePress(v as 'true' | 'false')}
              disabled={selectedVerdict !== null}
              activeOpacity={0.8}
            >
              <Text style={[styles.verdictText, { color: isWrong ? colors.wrongText : colors.textPrimary }]}>
                {v === 'true' ? 'True' : 'False'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  verdictButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  verdictBtn: {
    width: '45%',
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verdictText: { fontSize: 32, fontWeight: '700' },
});