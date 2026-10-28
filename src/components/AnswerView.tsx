import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { QuestionState } from '../store/gameSessionStore';
import { ColorSet } from '../constants/colors';
import { GameConstants } from '../constants/game';
import { ui } from './ui';

export interface AnswerViewProps {
  questionIndex: number; totalQuestions: number; greenChip: number; redChip: number;
  currentQuestion: QuestionState | null; colors: ColorSet; night: boolean; disabled?: boolean;
  timeRemaining?: number;
  onAnswer: (answer: number | boolean, correct: boolean, firstTry: boolean) => void;
}

export function AnswerView({ questionIndex, totalQuestions, greenChip, redChip, currentQuestion: q,
  colors, disabled = false, onAnswer, timeRemaining, kind }: AnswerViewProps & { kind: 'practice' | 'quiz' | 'test' | 'time' }) {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const resolved = useRef(false);
  const retried = useRef(false);
  useEffect(() => { resolved.current = false; retried.current = false; setSelected({}); }, [q, questionIndex]);
  if (!q) return null;
  const verdict = kind === 'test' || kind === 'time';
  const correctValue = q.options[q.correctOptionIndex];
  const press = (value: number, index: number) => {
    if (disabled || resolved.current) return;
    const correct = value === correctValue;
    const firstTry = !retried.current;
    if (correct) resolved.current = true;
    else retried.current = true;
    setSelected((previous) => ({ ...previous, [index]: correct }));
    onAnswer(verdict ? index === 0 : value, correct, firstTry);
  };
  const title = kind === 'quiz' ? 'Find the missing number' : verdict ? 'True or false?' : 'Find the answer';
  return <ScrollView contentContainerStyle={[ui.page, { justifyContent: 'center' }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>QUESTION {questionIndex} / {totalQuestions}</Text>
      <Text style={{ color: colors.textSecondary }}>✓ {greenChip}   ↻ {redChip}</Text>
    </View>
    <View style={{ height: 6, borderRadius: 6, backgroundColor: colors.surfaceDark, overflow: 'hidden' }}>
      <View style={{ height: 6, width: `${(questionIndex / totalQuestions) * 100}%`, backgroundColor: colors.fraction }} />
    </View>
    {kind === 'time' && <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary, textAlign: 'center' }}>
      {Math.max(0, (timeRemaining ?? GameConstants.TIME_PER_QUESTION_MS) / 1000).toFixed(1)} seconds left
    </Text>}
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center', paddingVertical: 36 }]}>
      <Text style={{ color: colors.textSecondary, fontSize: 15 }}>{title}</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={{ fontSize: 38, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', paddingVertical: 18 }}>
        {q.n1} {q.operator} {q.n2} = {kind === 'practice' ? '?' : q.answer}
      </Text>
      <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary }}>
        {resolved.current ? 'Nicely done!' : retried.current ? 'Not quite. Give it another try.' : 'You’ve got this.'}
      </Text>
    </View>
    <View style={ui.grid}>
      {q.options.map((option, index) => <TouchableOpacity key={index} accessibilityRole="button"
        accessibilityLabel={verdict ? index === 0 ? 'True' : 'False' : String(option)}
        accessibilityState={{ disabled: disabled || resolved.current }} disabled={disabled || resolved.current}
        onPress={() => press(option, index)} style={{ width: '48%', minHeight: 88, borderWidth: 1, borderColor: colors.border,
          borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 12,
          backgroundColor: selected[index] === true ? colors.correctFlash : selected[index] === false ? colors.wrongOption : colors.surface }}>
        <Text style={{ fontSize: verdict ? 24 : 30, fontWeight: '700', color: selected[index] === false ? colors.wrongText : colors.textPrimary }}>
          {verdict ? index === 0 ? 'True' : 'False' : option}
        </Text>
      </TouchableOpacity>)}
    </View>
  </ScrollView>;
}
