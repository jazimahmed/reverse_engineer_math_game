// PlayView - Evidence: SPEC_ADDITION_PLAY.md, E-RT-025
// LAYOUT ONLY - gameplay UNKNOWN
// 3 simultaneous equations + on-screen keypad 0-9
// No visible counters, timer, or progress

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { QuestionState } from '@store/index';
import { Colors } from '@constants/index';

interface PlayViewProps {
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  currentQuestion: QuestionState | null;
  colors: typeof Colors.light;
  night: boolean;
  onAnswer: (userAnswer: number, isCorrect: boolean, firstTry: boolean) => void;
}

export function PlayView({
  questionIndex,
  totalQuestions,
  greenChip,
  redChip,
  currentQuestion,
  colors,
  night,
  onAnswer,
}: PlayViewProps) {
  const [focusedAns, setFocusedAns] = useState<'ans' | 'ans1' | 'ans2' | 'ans3'>('ans');
  const [answers, setAnswers] = useState<Record<string, string>>({
    ans: '', ans1: '', ans2: '', ans3: '',
  });

  const q = currentQuestion;
  if (!q) return null;

  const equations = [
    { label: 'ans', n1: q.n1, op: q.operator, n2: q.n2, ans: q.answer },
    // Additional equations from currentQuestion if present (n11, n12, etc.)
    { label: 'ans1', n1: (q as any).n11, op: (q as any).sgn1, n2: (q as any).n21, ans: (q as any).ans1 },
    { label: 'ans2', n1: (q as any).n12, op: (q as any).sgn2, n2: (q as any).n22, ans: (q as any).ans2 },
  ].filter(eq => eq.n1 !== undefined && eq.n1 !== '');

  const handleKeypad = (digit: number) => {
    setAnswers((prev) => ({
      ...prev,
      [focusedAns]: prev[focusedAns] + digit.toString(),
    }));
  };

  const handleBackspace = () => {
    setAnswers((prev) => ({
      ...prev,
      [focusedAns]: prev[focusedAns].slice(0, -1),
    }));
  };

  const handleSubmit = () => {
    // UNKNOWN - what constitutes submission?
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Equations area */}
      <View style={styles.equationsArea}>
        {equations.map((eq: any, idx: number) => (
          <View key={idx} style={styles.equationRow}>
            <Text style={styles.eqNumber}>{eq.n1}</Text>
            <Text style={styles.eqOperator}>{eq.op}</Text>
            <Text style={styles.eqNumber}>{eq.n2}</Text>
            <Text style={styles.eqOperator}>=</Text>
            <TouchableOpacity
              style={[styles.answerSlot, focusedAns === eq.label && styles.answerSlotFocused]}
              onPress={() => setFocusedAns(eq.label as any)}
            >
              <Text style={[
                styles.answerText,
                answers[eq.label] ? { color: colors.textPrimary } : { color: colors.textSecondary }
              ]}>
                {answers[eq.label] || '?'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          ['backspace', 0, 'submit'],
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((key: string | number, kIdx: number) => (
              <TouchableOpacity
                key={kIdx}
                style={[styles.keyBtn, key === 'backspace' && styles.keyWide, key === 'submit' && styles.keyWide]}
                onPress={() => {
                  if (key === 'backspace') handleBackspace();
                  else if (key === 'submit') handleSubmit();
                  else handleKeypad(key as number);
                }}
              >
                <Text style={styles.keyText}>
                  {key === 'backspace' ? '⌫' : key === 'submit' ? '✓' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* UNKNOWN badge */}
      <View style={styles.unknownBadge}>
        <Text style={styles.unknownText}>⚠ Gameplay UNKNOWN (E-RT-025)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#49C2FF' },
  equationsArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 16,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  eqNumber: { fontSize: 36, fontWeight: '700', color: '#1D2733' },
  eqOperator: { fontSize: 36, fontWeight: '700', color: '#1D2733' },
  answerSlot: {
    width: 100,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E4E8',
  },
  answerSlotFocused: { borderColor: '#4CAF50', borderWidth: 3 },
  answerText: { fontSize: 28, fontWeight: '700' },
  keypad: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  keyBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyWide: { width: '30%' },
  keyText: { fontSize: 32, fontWeight: '700', color: '#1D2733' },
  unknownBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,193,7,0.9)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  unknownText: { fontSize: 12, fontWeight: '600', color: '#1D2733' },
});