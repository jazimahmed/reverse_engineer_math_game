import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ColorSet } from '../constants/colors';
import { DuelQuestionState } from '../store/gameSessionStore';
import { formatQuestion } from '../utils/questionGenerator';

export function DuelView({ currentQuestion: q, questionIndex, totalQuestions, colors, disabled = false,
  duelChipTop, duelChipBottom, onDuelAnswer }: {
  currentQuestion: DuelQuestionState | null; questionIndex: number; totalQuestions: number; colors: ColorSet;
  disabled?: boolean; duelChipTop: number; duelChipBottom: number;
  onDuelAnswer: (half: 'top' | 'bottom', correct: boolean) => void;
}) {
  const locked = useRef(false);
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  useEffect(() => { locked.current = false; setFeedback({}); }, [q, questionIndex]);
  if (!q) return null;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    {(['top', 'bottom'] as const).map((half) => <ScrollView key={half} style={{ flex: 1, transform: [{ rotate: half === 'top' ? '180deg' : '0deg' }] }}
      contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'center', gap: 12 }}>
      <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>ROUND {questionIndex}/{totalQuestions} · SCORE {half === 'top' ? duelChipTop : duelChipBottom}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 28, fontWeight: '800', textAlign: 'center', color: colors.textPrimary }}>{formatQuestion(q[half], true)}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
        {q[half].options.map((value, index) => <TouchableOpacity key={index} accessibilityRole="button" accessibilityLabel={`${half} answer ${value}`}
          disabled={disabled || locked.current} onPress={() => {
            if (disabled || locked.current) return;
            const correct = value === q[half].options[q[half].correctOptionIndex];
            if (correct) locked.current = true;
            setFeedback((previous) => ({ ...previous, [`${half}-${index}`]: correct }));
            onDuelAnswer(half, correct);
          }} style={{ width: '48%', minHeight: 56, borderRadius: 16, padding: 10, alignItems: 'center', justifyContent: 'center',
            backgroundColor: feedback[`${half}-${index}`] === true ? colors.correctFlash : feedback[`${half}-${index}`] === false ? colors.wrongOption : colors.surface }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700' }}>{q[half].display?.options?.[index] ?? value}</Text>
        </TouchableOpacity>)}
      </View>
    </ScrollView>)}
  </View>;
}
