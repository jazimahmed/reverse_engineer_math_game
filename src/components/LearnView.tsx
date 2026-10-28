import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AnswerViewProps } from './AnswerView';
import { ActionButton, ui } from './ui';
import { formatQuestion } from '../utils/questionGenerator';

export function LearnView({ currentQuestion: q, questionIndex, totalQuestions, colors, disabled = false, onAnswer }: AnswerViewProps) {
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const locked = useRef(false);
  useEffect(() => { setRevealed(false); setCompleted(false); locked.current = false; }, [q, questionIndex]);
  if (!q) return null;
  return <ScrollView contentContainerStyle={ui.page}>
    <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>LEARN · {questionIndex} / {totalQuestions}</Text>
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ color: colors.textPrimary, fontSize: 25, fontWeight: '700' }}>Let’s work it out.</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={{ color: colors.textPrimary, fontSize: 36, fontWeight: '800', paddingVertical: 20 }}>{formatQuestion(q, !revealed)}</Text>
      <Text style={{ color: colors.textSecondary, lineHeight: 25, fontSize: 16 }}>
        {revealed ? q.explanation : 'Think about the answer, then open the explanation to see how it works.'}
      </Text>
    </View>
    {!revealed ? <ActionButton label="Show explanation" disabled={disabled} onPress={() => setRevealed(true)} /> :
      <ActionButton label={questionIndex === totalQuestions ? 'Complete lesson' : 'Got it. Next question'} disabled={disabled || completed} onPress={() => {
        if (locked.current || disabled) return;
        locked.current = true; setCompleted(true);
        onAnswer(q.options[q.correctOptionIndex], true, true);
      }} />}
  </ScrollView>;
}
