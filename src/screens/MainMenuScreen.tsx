// Main Menu Screen - Evidence: E-RT-002
// 4 utility tiles + 8 topic tiles in 2x4 grid, light-blue checkered background

import React from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { TopicConfig, TopicId } from '../constants/game';
import { useSettingsStore } from '../store';

const TOPICS: TopicId[] = [
  'addition', 'subtraction', 'multiplication', 'division',
  'squareRoot', 'decimal', 'fraction', 'games'
];

const TOPIC_ICONS: Record<TopicId, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '✓',
  squareRoot: '√',
  decimal: '0.1',
  fraction: '2/3',
  games: '🎮',
};

interface TopicItem {
  id: TopicId;
  title: string;
  icon: string;
  color: string;
}

export function MainMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;

  const handleTopicPress = (topicId: TopicId) => {
    if (topicId === 'games') {
      navigation.navigate('GamesHub');
    } else {
      navigation.navigate('TopicSelect', { topicId });
    }
  };

  const handleUtilityPress = (utility: string) => {
    if (utility === 'settings') {
      navigation.navigate('Settings');
    }
  };

  const topicItems: TopicItem[] = TOPICS.map((topicId) => {
    const config = TopicConfig[topicId];
    const tileColor = colors[topicId] || colors.addition;
    return {
      id: topicId,
      title: config.title,
      icon: TOPIC_ICONS[topicId],
      color: tileColor,
    };
  });

  const renderItem = ({ item }: { item: TopicItem }) => (
    <TouchableOpacity
      style={[styles.topicTile, { backgroundColor: item.color }]}
      onPress={() => handleTopicPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[styles.topicIcon, { color: night ? colors.nightText : '#FFFFFF' }]}>
        {item.icon}
      </Text>
      <Text style={[styles.topicLabel, { color: night ? colors.nightText : '#FFFFFF' }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.utilityBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.utilityTile} onPress={() => handleUtilityPress('profile')}>
          <Text style={[styles.utilityIcon, { color: night ? colors.nightText : '#E53935' }]}>👤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.utilityTile} onPress={() => handleUtilityPress('settings')}>
          <Text style={[styles.utilityIcon, { color: night ? colors.nightText : '#43A047' }]}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.utilityTile} onPress={() => handleUtilityPress('language')}>
          <Text style={[styles.utilityIcon, { color: night ? colors.nightText : '#1E88E5' }]}>文/A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.utilityTile} onPress={() => handleUtilityPress('reset')}>
          <Text style={[styles.utilityIcon, { color: night ? colors.nightText : '#E91E63' }]}>↻</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={topicItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[styles.gridContainer, { backgroundColor: colors.background, flex: 1 }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  utilityBar: {
    flexDirection: 'row',
    height: 80,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  utilityTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityIcon: { fontSize: 28 },
  gridContainer: { padding: 16 },
  topicTile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1%',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicIcon: { fontSize: 48, marginBottom: 8 },
  topicLabel: { fontSize: 18, fontWeight: '600' },
});