import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ColorSet } from '../constants/colors';
import { DuelQuestionState } from '../store/gameSessionStore';
import { formatQuestion } from '../utils/questionGenerator';
import { PlayfulIcon } from './PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';

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
  const night = colors.background === colors.nightBg;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    {(['top', 'bottom'] as const).map((half) => <ScrollView key={half} style={{ flex: 1, transform: [{ rotate: half === 'top' ? '180deg' : '0deg' }] }}
      contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: 'center', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <PlayfulIcon name="duel" size={36} />
        <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>ROUND {questionIndex}/{totalQuestions}</Text>
        <Text accessibilityLabel={`Score ${half === 'top' ? duelChipTop : duelChipBottom}`} style={{ color: colors.textPrimary, backgroundColor: colors.finalQuestion, padding: 10, borderRadius: 14, fontWeight: '800' }}>★ {half === 'top' ? duelChipTop : duelChipBottom}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 6, backgroundColor: colors.surfaceDark, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${questionIndex / totalQuestions * 100}%`, backgroundColor: half === 'top' ? colors.division : colors.subtraction }} />
      </View>
      <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 28, fontWeight: '800', textAlign: 'center', color: colors.textPrimary }}>{formatQuestion(q[half], true)}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
        {q[half].options.map((value, index) => {
          const palette = PlayfulPalettes[(index + (half === 'top' ? 2 : 0)) % PlayfulPalettes.length];
          const result = feedback[`${half}-${index}`];
          return <TouchableOpacity key={index} accessibilityRole="button" accessibilityLabel={`${half} answer ${value}`}
          accessibilityState={{ disabled: disabled || locked.current }}
          disabled={disabled || locked.current} onPress={() => {
            if (disabled || locked.current) return;
            const correct = value === q[half].options[q[half].correctOptionIndex];
            if (correct) locked.current = true;
            setFeedback((previous) => ({ ...previous, [`${half}-${index}`]: correct }));
            onDuelAnswer(half, correct);
          }} style={{ width: '48%', minHeight: 60, borderRadius: 16, padding: 10, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderColor: night ? palette.accent : palette.edge,
            backgroundColor: result === true ? colors.correctFlash : result === false ? colors.wrongOption : night ? palette.darkFill : palette.fill }}>
          <Text style={{ color: result === false ? colors.wrongText : night || result === true ? colors.textPrimary : palette.ink, fontSize: 24, fontWeight: '800' }}>{q[half].display?.options?.[index] ?? value}</Text>
          {result !== undefined && <Text style={{ color: result ? colors.textPrimary : colors.wrongText, fontWeight: '700' }}>{result ? '✓ Correct' : '✕ Try again'}</Text>}
        </TouchableOpacity>; })}
      </View>
    </ScrollView>)}
  </View>;
}
