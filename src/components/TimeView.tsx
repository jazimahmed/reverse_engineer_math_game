// TimeView - Evidence: SPEC_ADDITION_TIME.md, E-RT-024
// Same as Test but with auto-advance countdown (~4.5s/question)
// Wrong tap increments red immediately; correct tap advances
// Timer auto-advances question every ~4.5s

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { QuestionState } from '@store/index';
import { Colors } from '@constants/index';
import { GameConstants } from '@constants/index';

interface TimeViewProps {
  disabled?: boolean;
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  currentQuestion: QuestionState | null;
  colors: typeof Colors.light;
  night: boolean;
  onAnswer: (userAnswer: boolean, isCorrect: boolean, firstTry: boolean) => void;
  timeRemaining: number;
}

export function TimeView({
  disabled = false,
  questionIndex,
  totalQuestions,
  greenChip,
  redChip,
  currentQuestion,
  colors,
  night,
  onAnswer,
  timeRemaining,
}: TimeViewProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<'true' | 'false' | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [verdictStates, setVerdictStates] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const resolved = useRef(false);
  const hadWrongAnswer = useRef(false);

  useEffect(() => {
    resolved.current = false;
    hadWrongAnswer.current = false;
    setSelectedVerdict(null);
    setVerdictStates({});
    setShowFlash(false);
  }, [currentQuestion, questionIndex]);

  useEffect(() => {
    if (!showFlash) return;
    const timer = setTimeout(() => setShowFlash(false), 300);
    return () => clearTimeout(timer);
  }, [showFlash, currentQuestion, questionIndex]);

  const q = currentQuestion;
  if (!q || !q.isTrueFalse) return null;

  const isFinalQuestion = questionIndex === totalQuestions;
  const bgColor = showFlash
    ? colors.correctFlash
    : isFinalQuestion
      ? colors.finalQuestion
      : colors.background;

  const correctVerdict = q.correctOptionIndex === 0 ? 'true' : 'false';
  const progress = timeRemaining / GameConstants.TIME_PER_QUESTION_MS;

  const handlePress = (verdict: 'true' | 'false') => {
    if (disabled || resolved.current) return;
    const isCorrect = verdict === correctVerdict;
    const firstTry = !hadWrongAnswer.current;

    if (isCorrect) {
      resolved.current = true;
      setSelectedVerdict(verdict);
    } else {
      hadWrongAnswer.current = true;
    }
    setVerdictStates((prev) => ({ ...prev, [verdict]: isCorrect ? 'correct' : 'wrong' }));

    if (isCorrect) {
      setShowFlash(true);
      onAnswer(verdict === 'true', true, firstTry);
    } else {
      onAnswer(verdict === 'true', false, firstTry);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Timer bar at top */}
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerProgress,
            { width: `${progress * 100}%`, backgroundColor: progress > 0.3 ? '#4CAF50' : '#F44336' },
          ]}
        />
      </View>

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
        {['true', 'false'].map((v) => {
          const state = verdictStates[v] || 'idle';
          const isWrong = state === 'wrong';
          const isCorrect = state === 'correct';
          return (
            <TouchableOpacity
              key={v}
              style={[styles.verdictBtn, { backgroundColor: isWrong ? colors.wrongOption : isCorrect ? colors.greenChip : colors.surface }]}
              onPress={() => handlePress(v as 'true' | 'false')}
              disabled={disabled || selectedVerdict !== null}
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
  timerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 10,
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
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
