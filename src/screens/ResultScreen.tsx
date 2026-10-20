// ResultScreen - Evidence: E-RT-008, E-RT-009, E-RT-010
// Score, Correct/Wrong, RESTART/EXIT, review sheet (checklist icon), shared footer

import React, { useState } from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { GameScore } from '../navigation/types';
import { useSettingsStore } from '../store';

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { score, modeId, topicId } = route.params;
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;

  const [showReview, setShowReview] = useState(false);

  const handleRestart = () => {
    navigation.navigate('Game', { modeId, topicId });
  };

  const handleExit = () => {
    navigation.navigate('ModeSelect', { topicId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>Score</Text>

        {/* Counters */}
        <View style={styles.counterRow}>
          <View style={styles.counterBox}>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Correct</Text>
            <Text style={[styles.counterValue, { color: colors.greenChip }]}>{score.greenChip}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.counterBox}>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>Wrong</Text>
            <Text style={[styles.counterValue, { color: colors.redChip }]}>{score.redChip}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.restartBtn }]} onPress={handleRestart}>
            <Text style={styles.actionBtnText}>RESTART</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.exitBtn }]} onPress={handleExit}>
            <Text style={styles.actionBtnText}>EXIT</Text>
          </TouchableOpacity>
        </View>

        {/* Review sheet button */}
        <TouchableOpacity style={styles.reviewBtn} onPress={() => setShowReview(true)}>
          <Text style={{ fontSize: 32, color: colors.greenChip }}>✓</Text>
        </TouchableOpacity>

        {/* Shared footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={{ fontSize: 28, color: colors.nightText }}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn}>
            <Text style={{ fontSize: 28, color: colors.nightText }}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerBtn}>
            <View style={[styles.footerPink, { backgroundColor: '#E91E63' }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Review Sheet Modal */}
      <Modal visible={showReview} animationType="slide" transparent={true}>
        <View style={styles.reviewOverlay} onTouchStart={() => setShowReview(false)}>
          <View style={[styles.reviewSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewTitle, { color: colors.textPrimary }]}>Review</Text>
              <TouchableOpacity onPress={() => setShowReview(false)}>
                <Text style={{ fontSize: 24, color: colors.redChip }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {score.questionHistory.map((item: any, idx: number) => (
                <View key={idx} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.reviewQuestion, { color: colors.textPrimary }]}>
                    {item.question}
                  </Text>
                  <View style={styles.reviewResult}>
                    <Text style={[
                      styles.reviewAnswer,
                      { color: item.correct ? colors.greenChip : colors.redChip }
                    ]}>
                      {item.correct ? '✓' : '✕'} {item.firstTry ? '(1st)' : '(retry)'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', gap: 24 },
  title: { fontSize: 32, fontWeight: '700', textDecorationLine: 'underline' },
  counterRow: {
    flexDirection: 'row',
    width: '80%',
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  counterBox: { flex: 1, paddingVertical: 24, alignItems: 'center' },
  divider: { width: 2 },
  counterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  counterValue: { fontSize: 36, fontWeight: '700' },
  buttonRow: {
    flexDirection: 'row',
    width: '80%',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
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
  actionBtnText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  reviewBtn: { marginTop: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
  },
  footerBtn: { padding: 8 },
  footerPink: { width: 56, height: 56, borderRadius: 28 },
  reviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reviewSheet: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  reviewTitle: { fontSize: 22, fontWeight: '700' },
  reviewItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  reviewQuestion: { fontSize: 18 },
  reviewResult: { alignItems: 'flex-end' },
  reviewAnswer: { fontSize: 16, fontWeight: '600' },
});