import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { QuestionState } from '../store/gameSessionStore';
import { ColorSet } from '../constants/colors';
import { GameConstants } from '../constants/game';
import { ui } from './ui';
import { formatQuestion } from '../utils/questionGenerator';
import { PlayfulIcon } from './PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';

export interface AnswerViewProps {
  questionIndex: number; totalQuestions: number; greenChip: number; redChip: number;
  currentQuestion: QuestionState | null; colors: ColorSet; night: boolean; disabled?: boolean;
  timeRemaining?: number;
  onAnswer: (answer: number | boolean, correct: boolean, firstTry: boolean) => void;
}

export function AnswerView({ questionIndex, totalQuestions, greenChip, redChip, currentQuestion: q,
  colors, night, disabled = false, onAnswer, timeRemaining, kind }: AnswerViewProps & { kind: 'practice' | 'quiz' | 'test' | 'time' | 'exam' }) {
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
    if (correct || kind === 'exam') resolved.current = true;
    else retried.current = true;
    setSelected((previous) => ({ ...previous, [index]: correct }));
    onAnswer(verdict ? index === 0 : value, correct, firstTry);
  };
  const title = kind === 'quiz' ? 'Find the missing number' : verdict ? 'True or false?' : 'Find the answer';
  return <ScrollView contentContainerStyle={[ui.page, { justifyContent: 'center' }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text accessibilityLabel={`Question ${questionIndex} of ${totalQuestions}`} style={{ color: colors.textSecondary, fontWeight: '800' }}>{questionIndex} / {totalQuestions}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Text accessibilityLabel={`${greenChip} correct`} style={{ color: colors.textPrimary, backgroundColor: colors.correctFlash, padding: 10, borderRadius: 16, fontWeight: '800' }}>✓ {greenChip}</Text>
        <Text accessibilityLabel={`${redChip} retries or missed`} style={{ color: colors.textPrimary, backgroundColor: colors.backgroundAlt, padding: 10, borderRadius: 16, fontWeight: '800' }}>↻ {redChip}</Text>
      </View>
    </View>
    <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.surfaceDark, overflow: 'hidden' }}>
      <View style={{ height: 10, borderRadius: 6, width: `${(questionIndex / totalQuestions) * 100}%`, backgroundColor: colors.fraction }} />
    </View>
    {kind === 'time' && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 20, backgroundColor: colors.finalQuestion }}>
      <PlayfulIcon name="time" size={32} />
      <Text accessibilityLiveRegion="polite" style={{ color: colors.textPrimary, fontWeight: '800' }}>
        {Math.max(0, (timeRemaining ?? GameConstants.TIME_PER_QUESTION_MS) / 1000).toFixed(1)} seconds left
      </Text>
    </View>}
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center', paddingVertical: 24 }]}>
      <PlayfulIcon name={kind} size={60} />
      <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '700' }}>{title}</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={{ fontSize: 38, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', paddingVertical: 18 }}>
        {formatQuestion(q, kind === 'practice' || kind === 'exam')}
      </Text>
      <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary }}>
        {resolved.current ? Object.values(selected).includes(true) ? '✓ Nicely done!' : '✕ Next question coming up.' : retried.current ? '✕ Try again!' : kind === 'exam' ? 'One attempt per question.' : 'Pick an answer'}
      </Text>
    </View>
    <View style={ui.grid}>
      {q.options.map((option, index) => {
        const palette = PlayfulPalettes[index % PlayfulPalettes.length];
        return <TouchableOpacity key={index} accessibilityRole="button"
        accessibilityLabel={verdict ? index === 0 ? 'True' : 'False' : q.display?.options?.[index] ?? String(option)}
        accessibilityState={{ disabled: disabled || resolved.current }} disabled={disabled || resolved.current}
        onPress={() => press(option, index)} style={{ width: '48%', minHeight: 100, borderWidth: 1, borderBottomWidth: 5, borderColor: night ? palette.accent : palette.edge,
          borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 12,
          backgroundColor: selected[index] === true ? colors.correctFlash : selected[index] === false ? colors.wrongOption : night ? palette.darkFill : palette.fill }}>
        <Text style={{ fontSize: verdict ? 24 : 30, fontWeight: '800', color: selected[index] === false ? colors.wrongText : night || selected[index] === true ? colors.textPrimary : palette.ink }}>
          {verdict ? index === 0 ? 'True' : 'False' : q.display?.options?.[index] ?? option}
        </Text>
        {selected[index] !== undefined && <Text style={{ color: selected[index] ? colors.textPrimary : colors.wrongText, fontWeight: '700' }}>{selected[index] ? '✓ Correct' : kind === 'exam' ? '✕ Incorrect' : '✕ Try again'}</Text>}
      </TouchableOpacity>; })}
    </View>
  </ScrollView>;
}
