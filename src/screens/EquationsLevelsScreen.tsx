// Equations Levels Screen - Evidence: E-RT-012
// 4-column grid, level 1 unlocked, others padlocked, long scrollable list

import React from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useSettingsStore, useEquationsProgressStore } from '../store';
import { GameConstants } from '../constants/game';

const TOTAL_LEVELS = 150; // Packaged asset has 150

export function EquationsLevelsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;
  const { getLevel, unlockLevel } = useEquationsProgressStore();

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Equations</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {levels.map((level) => {
          const progress = getLevel(level);
          const unlocked = progress.unlocked;
          return (
            <TouchableOpacity
              key={level}
              style={[styles.levelTile, { backgroundColor: unlocked ? colors.surface : colors.surfaceDark }]}
              onPress={() => {
                if (unlocked) navigation.navigate('EquationsBoard', { level });
              }}
              disabled={!unlocked}
              activeOpacity={0.8}
            >
              <Text style={[styles.levelNumber, { color: unlocked ? colors.textPrimary : colors.textSecondary }]}>
                {level}
              </Text>
              {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
              {progress.stars > 0 && (
                <View style={styles.stars}>
                  {Array.from({ length: progress.stars }).map((_, i) => (
                    <Text key={i} style={styles.star}>★</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4E8',
  },
  backBtn: { width: 48, alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '700' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    flexGrow: 1,
  },
  levelTile: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelNumber: { fontSize: 28, fontWeight: '700' },
  lockIcon: { position: 'absolute', fontSize: 24 },
  stars: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    gap: 2,
  },
  star: { fontSize: 14, color: '#FFD700' },
});
