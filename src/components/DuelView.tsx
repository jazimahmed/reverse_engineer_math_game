// DuelView - Evidence: SPEC_ADDITION_DUEL.md, E-RT-022
// Split screen: top rotated 180°, bottom upright; same question both halves
// Cross-increment chips: bottom correct -> top chip++, top correct -> bottom chip++
// Wrong decrements corresponding chip

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { QuestionState, DuelQuestionState } from '@store/index';
import { Colors } from '@constants/index';

interface DuelViewProps {
  disabled?: boolean;
  questionIndex: number;
  totalQuestions: number;
  greenChip: number; // Not used in Duel
  redChip: number;   // Not used in Duel
  currentQuestion: QuestionState | DuelQuestionState | null;
  colors: typeof Colors.light;
  night: boolean;
  onAnswer: (userAnswer: number, isCorrect: boolean, firstTry: boolean) => void;
  onDuelAnswer: (half: 'top' | 'bottom', isCorrect: boolean) => void;
  duelChipTop: number;    // right11 (opponent)
  duelChipBottom: number; // right1 (player)
}

export function DuelView({
  disabled = false,
  questionIndex,
  totalQuestions,
  currentQuestion,
  colors,
  night,
  onDuelAnswer,
  duelChipTop,
  duelChipBottom,
}: DuelViewProps) {
  const [optionStates, setOptionStates] = useState<{
    top: Record<number, 'idle' | 'correct' | 'wrong'>;
    bottom: Record<number, 'idle' | 'correct' | 'wrong'>;
  }>({ top: {}, bottom: {} });
  const resolved = useRef(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    resolved.current = false;
    setAnswered(false);
    setOptionStates({ top: {}, bottom: {} });
  }, [currentQuestion, questionIndex]);

  const q = currentQuestion as DuelQuestionState | null;
  if (!q) return null;

  const topQ = q.top;
  const bottomQ = q.bottom;

  const handlePress = (half: 'top' | 'bottom', optionIndex: number, userAnswer: number) => {
    if (disabled || resolved.current) return;
    const correctValue = half === 'top' ? topQ.options[topQ.correctOptionIndex] : bottomQ.options[bottomQ.correctOptionIndex];
    const isCorrect = userAnswer === correctValue;
    if (isCorrect) {
      resolved.current = true;
      setAnswered(true);
    }

    setOptionStates((prev) => ({
      ...prev,
      [half]: { ...prev[half], [optionIndex]: isCorrect ? 'correct' : 'wrong' },
    }));

    onDuelAnswer(half, isCorrect);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top half (rotated 180°) - Opponent */}
      <View style={[styles.half, styles.halfTop, { transform: [{ rotate: '180deg' }] }]}>
        <View style={styles.chipContainer}>
          <View style={[styles.chip, { backgroundColor: colors.redChip }]}>
            <Text style={styles.chipText}>{duelChipTop}</Text>
          </View>
        </View>

        <View style={styles.equation}>
          <Text style={styles.eqNumber}>{topQ.n1}</Text>
          <Text style={styles.eqOperator}>{topQ.operator}</Text>
          <Text style={styles.eqNumber}>{topQ.n2 === '?' ? '?' : topQ.n2}</Text>
          <Text style={styles.eqOperator}>=</Text>
          <Text style={styles.eqAnswer}>?</Text>
        </View>

        <View style={styles.optionsGrid}>
          {topQ.options.map((opt: number, idx: number) => {
            const state = optionStates.top[idx] || 'idle';
            const isWrong = state === 'wrong';
            const isCorrect = state === 'correct';
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: isWrong ? colors.wrongOption : isCorrect ? colors.greenChip : colors.surface }]}
                onPress={() => handlePress('top', idx, opt)}
                disabled={disabled || answered}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28, fontWeight: '700', color: isWrong ? colors.wrongText : colors.textPrimary }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom half (upright) - Player */}
      <View style={styles.halfBottom}>
        <View style={styles.chipContainer}>
          <View style={[styles.chip, { backgroundColor: colors.greenChip }]}>
            <Text style={styles.chipText}>{duelChipBottom}</Text>
          </View>
        </View>

        <View style={styles.equation}>
          <Text style={styles.eqNumber}>{bottomQ.n1}</Text>
          <Text style={styles.eqOperator}>{bottomQ.operator}</Text>
          <Text style={styles.eqNumber}>{bottomQ.n2 === '?' ? '?' : bottomQ.n2}</Text>
          <Text style={styles.eqOperator}>=</Text>
          <Text style={styles.eqAnswer}>?</Text>
        </View>

        <View style={styles.optionsGrid}>
          {bottomQ.options.map((opt: number, idx: number) => {
            const state = optionStates.bottom[idx] || 'idle';
            const isWrong = state === 'wrong';
            const isCorrect = state === 'correct';
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: isWrong ? colors.wrongOption : isCorrect ? colors.greenChip : colors.surface }]}
                onPress={() => handlePress('bottom', idx, opt)}
                disabled={disabled || answered}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 28, fontWeight: '700', color: isWrong ? colors.wrongText : colors.textPrimary }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#49C2FF' },
  half: { flex: 1, paddingHorizontal: 16 },
  halfTop: { justifyContent: 'flex-end' },
  halfBottom: { justifyContent: 'flex-start', paddingTop: 20 },
  chipContainer: { alignItems: 'flex-end', padding: 8, marginBottom: 8 },
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
    gap: 8,
    paddingVertical: 16,
  },
  eqNumber: { fontSize: 36, fontWeight: '700', color: '#1D2733' },
  eqOperator: { fontSize: 36, fontWeight: '700', color: '#1D2733' },
  eqAnswer: { fontSize: 36, fontWeight: '700', color: '#4CAF50' },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
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
});
