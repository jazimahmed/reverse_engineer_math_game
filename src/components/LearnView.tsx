// LearnView - Evidence: SPEC_ADDITION_LEARN.md, E-RT-026
// ENTRY ONLY - gameplay UNKNOWN
// Setup screen: 4 checkboxes for digit count ("3-5", "3", "4", "5") + Start button

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@constants/index';

interface CheckBoxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  color: string;
}

const CheckBox: React.FC<{ value: boolean; onValueChange: (value: boolean) => void; color: string }> = ({ value, onValueChange, color }) => (
  <TouchableOpacity
    style={[{ backgroundColor: 'transparent', borderWidth: 2, borderColor: '#4CAF50', width: 24, height: 24, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }]}
    onPress={() => onValueChange(!value)}
  >
    {value && <View style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: 'currentColor' }} />}
  </TouchableOpacity>
);

type DigitCountKey = '3-5' | '3' | '4' | '5';

interface LearnViewProps {
  questionIndex: number;
  totalQuestions: number;
  greenChip: number;
  redChip: number;
  currentQuestion: any;
  colors: typeof import('@constants/index').Colors.light;
  night: boolean;
  onAnswer: (userAnswer: any, isCorrect: boolean, firstTry: boolean) => void;
}

export function LearnView({
  questionIndex,
  totalQuestions,
  greenChip,
  redChip,
  currentQuestion,
  colors,
  night,
  onAnswer,
}: LearnViewProps) {
  const [digitCounts, setDigitCounts] = useState<Record<'3-5' | '3' | '4' | '5', boolean>>({
    '3-5': true,
    '3': false,
    '4': false,
    '5': false,
  });

  const toggleDigitCount = (key: '3-5' | '3' | '4' | '5') => {
    if (key === '3-5') {
      setDigitCounts({ '3-5': true, '3': false, '4': false, '5': false });
    } else {
      setDigitCounts((prev) => ({
        ...prev,
        '3-5': false,
        [key]: !prev[key],
      }));
    }
  };

  const handleStart = () => {
    // UNKNOWN - starts column addition gameplay
  };

  const digitOptions: { key: '3-5' | '3' | '4' | '5'; label: string }[] = [
    { key: '3-5', label: '3-5 digits (mixed)' },
    { key: '3', label: '3 digits' },
    { key: '4', label: '4 digits' },
    { key: '5', label: '5 digits' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Learn - Column Addition</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select operand digit count</Text>

        <View style={styles.checkboxGroup}>
          {digitOptions.map(({ key, label }) => (
            <View key={key} style={styles.checkboxRow}>
              <TouchableOpacity
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: colors.addition,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => toggleDigitCount(key)}
              >
                {digitCounts[key] && <View style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: colors.addition }} />}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.addition }]} onPress={handleStart}>
          <Text style={styles.startBtnText}>Start</Text>
        </TouchableOpacity>

        <View style={styles.unknownBadge}>
          <Text style={styles.unknownText}>⚠ Gameplay UNKNOWN (E-RT-026)</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#49C2FF', paddingHorizontal: 24 },
  header: { paddingTop: 40, paddingBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  checkboxGroup: { width: '100%', gap: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  checkboxLabel: { fontSize: 18, fontWeight: '500' },
  startBtn: {
    width: '80%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startBtnText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  unknownBadge: {
    marginTop: 24,
    backgroundColor: 'rgba(255,193,7,0.9)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  unknownText: { fontSize: 14, fontWeight: '600', color: '#1D2733' },
});