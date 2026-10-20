// Topic Mode Select Screen - Evidence: E-RT-004, E-RT-019
// Topic-specific mode grids (8, 6, or 4 modes per topic)

import React from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { TopicConfig, TopicId, ModeId } from '../constants/game';
import { useSettingsStore } from '../store';

const MODE_ICONS: Record<ModeId, string> = {
  practice: '📖',
  quiz: '🤔',
  duel: '👥',
  play: '▶️',
  test: '✓✗',
  time: '⏱',
  learn: '📦',
  hard: '🧮',
  exam: '📝',
  subtract: '−',
  multiply: '×',
  addition: '+',
};

export function TopicSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TopicSelect'>>();
  const { topicId } = route.params;
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;

  const config = TopicConfig[topicId as TopicId];
  const modes = config?.modes || [];

  if (!config) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.textPrimary }]}>Unknown topic</Text>
      </SafeAreaView>
    );
  }

  const handleModePress = (modeId: ModeId) => {
    navigation.navigate('Game', { modeId, topicId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{config.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Play ▶</Text>
        </View>
        <TouchableOpacity style={styles.gearButton} onPress={() => { /* Gear with "1" - UNKNOWN */ }}>
          <Text style={[styles.gearIcon, { color: '#E53935' }]}>⚙️ 1</Text>
        </TouchableOpacity>
      </View>

      {/* Mode grid - scrollable */}
      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {modes.map((modeId, index) => (
          <TouchableOpacity
            key={modeId}
            style={[styles.modeTile, { backgroundColor: colors.surface }]}
            onPress={() => handleModePress(modeId)}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeIcon, { color: colors.textPrimary }]}>
              {MODE_ICONS[modeId] || '❓'}
            </Text>
            <Text style={[styles.modeLabel, { color: colors.textPrimary }]}>
              {config.title === 'Square Root' && ['play', 'practice'].includes(modeId)
                ? `${MODE_LABELS[modeId]}²` // Superscript artifact observed
                : MODE_LABELS[modeId] || modeId}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Mode labels (shared with navigation/types)
const MODE_LABELS: Record<ModeId, string> = {
  practice: 'Practice',
  quiz: 'Quiz',
  duel: 'Duel',
  play: 'Play',
  test: 'Test',
  time: 'Time',
  learn: 'Learn',
  hard: 'Hard',
  exam: 'Exam',
  subtract: 'Subtract',
  multiply: 'Multiply',
  addition: 'Addition',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4E8',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  gearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 20,
  },
  gridContainer: {
    padding: 16,
    flexGrow: 1,
  },
  modeTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
});