// Equations Board Screen - Evidence: SPEC_EQUATIONS.md, E-RT-013..E-RT-016
// 5x5 crossword board, tray 1-9/0/backspace/AD hint, countdown timer, tutorial overlay

import React, { useState, useEffect } from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { GameConstants } from '../constants/game';
import { useSettingsStore } from '../store';

const TRAY_ROW1 = [1, 2, 3, 4, 5, 'backspace'];
const TRAY_ROW2 = [6, 7, 8, 9, 0, 'ad'];

export function EquationsBoardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EquationsBoard'>>();
  const { level } = route.params;
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;

  const [showOverlay, setShowOverlay] = useState(true);
  const [timer, setTimer] = useState<number>(GameConstants.EQUATIONS_EASY_COUNTDOWN_START);
  const [board, setBoard] = useState<string[][]>(Array(5).fill(null).map(() => Array(5).fill('')));

  // Countdown timer
  useEffect(() => {
    if (showOverlay) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // Timer expired - UNKNOWN what happens
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showOverlay]);

  const dismissOverlay = () => setShowOverlay(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter} />
        <View style={[styles.timerBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.timerText, { color: colors.textPrimary }]}>{timer}s</Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardContainer}>
        {board.map((row, rIdx) => (
          <View key={rIdx} style={styles.boardRow}>
            {row.map((cell, cIdx) => (
              <TouchableOpacity
                key={cIdx}
                style={[styles.cell, { backgroundColor: colors.surface }]}
                onPress={() => { /* Tap cell - UNKNOWN */ }}
              >
                <Text style={[styles.cellText, { color: colors.textPrimary }]}>{cell || ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Tray */}
      <View style={styles.tray}>
        <View style={styles.trayRow}>
          {TRAY_ROW1.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.trayBtn, { backgroundColor: colors.surface }]}
              onPress={() => { /* Drag piece - UNKNOWN */ }}
            >
              <Text style={[styles.trayText, { color: colors.textPrimary }]}>
                {item === 'backspace' ? '⌫' : item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.trayRow}>
          {TRAY_ROW2.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.trayBtn, { backgroundColor: colors.surface }]}
              onPress={() => { /* Drag piece - UNKNOWN */ }}
            >
              <Text style={[styles.trayText, { color: colors.textPrimary }]}>
                {item === 'ad' ? 'AD' : item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tutorial Overlay */}
      <Modal visible={showOverlay} animationType="fade" transparent={true}>
        <View style={styles.overlay} onTouchStart={() => {}}> {/* Block touches */}
          <Animated.View style={styles.overlayContent}>
            <View style={styles.overlayCircle}>
              <Text style={styles.overlayX}>✕</Text>
            </View>
            <TouchableOpacity style={styles.playBtn} onPress={dismissOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
            <Text style={styles.overlayNote}>⚠ Tutorial ends level (E-RT-015)</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* UNKNOWN badge */}
      <View style={styles.unknownBadge}>
        <Text style={styles.unknownText}>⚠ Drag/validation UNKNOWN (E-RT-016)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#49C2FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
  },
  backBtn: { width: 48, alignItems: 'center' },
  headerCenter: { flex: 1 },
  timerBox: {
    width: 80,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { fontSize: 18, fontWeight: '700' },
  boardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 8,
  },
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E4E8',
  },
  cellText: { fontSize: 24, fontWeight: '700' },
  tray: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  trayRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  trayBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trayText: { fontSize: 24, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: { alignItems: 'center', gap: 16 },
  overlayCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayX: { fontSize: 80, fontWeight: '700', color: '#FFFFFF' },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 40, color: '#FF0000' },
  overlayNote: { color: '#FFD700', fontSize: 14, fontWeight: '600', marginTop: 8 },
  unknownBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,193,7,0.9)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  unknownText: { fontSize: 12, fontWeight: '600', color: '#1D2733' },
});