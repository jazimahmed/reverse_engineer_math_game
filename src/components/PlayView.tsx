import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnswerViewProps } from './AnswerView';
import { ActionButton, ui } from './ui';
import { formatQuestion, isAnswerCorrect, parseAnswer } from '../utils/questionGenerator';

export function PlayView({ currentQuestion: q, questionIndex, totalQuestions, onAnswer, colors, disabled = false }: AnswerViewProps) {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('Enter your answer below.');
  const resolved = useRef(false);
  const retried = useRef(false);
  useEffect(() => {
    setInput(''); setMessage('Enter your answer below.'); resolved.current = false; retried.current = false;
  }, [q, questionIndex]);
  if (!q) return null;
  const locked = disabled || resolved.current;
  const submit = () => {
    if (disabled || resolved.current) return;
    if (parseAnswer(input) === null) { setMessage('Enter a number or a fraction, such as 3/4.'); return; }
    const correct = isAnswerCorrect(input, q);
    const firstTry = !retried.current;
    if (correct) resolved.current = true;
    else retried.current = true;
    setMessage(correct ? 'That’s it. Well done!' : 'Not quite. Edit your answer and try again.');
    onAnswer(parseAnswer(input)!, correct, firstTry);
  };
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
    <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>PLAY · {questionIndex} / {totalQuestions}</Text>
    <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text adjustsFontSizeToFit numberOfLines={2} style={{ color: colors.textPrimary, fontSize: 34, fontWeight: '800', textAlign: 'center' }}>{formatQuestion(q, true)}</Text>
      <TextInput accessibilityLabel="Your answer" value={input} editable={!locked} maxLength={24} showSoftInputOnFocus={false}
        onChangeText={(text) => setInput(text.replace(/[^\d./-]/g, '').slice(0, 24))} onSubmitEditing={submit}
        placeholder="?" placeholderTextColor={colors.textSecondary}
        style={{ borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: 16, borderRadius: 16, fontSize: 28, textAlign: 'center' }} />
      <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary, textAlign: 'center' }}>{message}</Text>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
      {['7', '8', '9', '⌫', '4', '5', '6', 'Clear', '1', '2', '3', '/', '−', '0', '.'].map((key) =>
        <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={key === '⌫' ? 'Backspace' : key} disabled={locked}
          onPress={() => setInput((value) => key === '⌫' ? value.slice(0, -1) : key === 'Clear' ? '' : (value + (key === '−' ? '-' : key)).slice(0, 24))}
          style={{ width: '23%', minHeight: 58, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textPrimary, fontSize: key === 'Clear' ? 15 : 24, fontWeight: '600' }}>{key}</Text>
        </TouchableOpacity>)}
    </View>
    <ActionButton label="Check answer" disabled={locked} onPress={submit} />
  </ScrollView>;
}
