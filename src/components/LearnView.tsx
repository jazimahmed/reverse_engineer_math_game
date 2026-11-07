import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AnswerViewProps } from './AnswerView';
import { ActionButton, ui } from './ui';
import { formatQuestion } from '../utils/questionGenerator';
import { PlayfulIcon } from './PlayfulIcon';

export function LearnView({ currentQuestion: q, questionIndex, totalQuestions, colors, disabled = false, onAnswer }: AnswerViewProps) {
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const locked = useRef(false);
  useEffect(() => { setRevealed(false); setCompleted(false); locked.current = false; }, [q, questionIndex]);
  if (!q) return null;
  return <ScrollView contentContainerStyle={ui.page}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <PlayfulIcon name="learn" size={56} />
      <Text style={{ color: colors.textSecondary, fontWeight: '800' }}>LEARN · {questionIndex} / {totalQuestions}</Text>
    </View>
    <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.surfaceDark, overflow: 'hidden' }}>
      <View style={{ height: 10, borderRadius: 6, width: `${questionIndex / totalQuestions * 100}%`, backgroundColor: colors.addition }} />
    </View>
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Let’s work it out.</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={{ color: colors.textPrimary, fontSize: 36, fontWeight: '800', paddingVertical: 20, textAlign: 'center' }}>{formatQuestion(q, !revealed)}</Text>
      <View style={{ padding: 18, borderRadius: 20, gap: 10, backgroundColor: revealed ? colors.backgroundAlt2 : colors.finalQuestion }}>
        <PlayfulIcon name={revealed ? 'check' : 'star'} size={36} />
        <Text accessibilityLiveRegion="polite" style={{ color: colors.textPrimary, lineHeight: 25, fontSize: 16 }}>
          {revealed ? q.explanation : 'Think of an answer. Tap below to see how it works.'}
        </Text>
      </View>
    </View>
    {!revealed ? <ActionButton label="Show explanation" icon="learn" disabled={disabled} onPress={() => setRevealed(true)} /> :
      <ActionButton label={questionIndex === totalQuestions ? 'Complete lesson' : 'Got it. Next question'} icon={questionIndex === totalQuestions ? 'trophy' : 'check'} disabled={disabled || completed} onPress={() => {
        if (locked.current || disabled) return;
        locked.current = true; setCompleted(true);
        onAnswer(q.options[q.correctOptionIndex], true, true);
      }} />}
  </ScrollView>;
}
