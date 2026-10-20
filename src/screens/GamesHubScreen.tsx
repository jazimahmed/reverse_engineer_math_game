// Games Hub Screen - Evidence: E-RT-003
// 8 mini-games: 2048, Fifteen, Puzzle, Match, Sudoku, Mix, Memory, Equations
// Crown icon -> Google Sign-In

import React from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useSettingsStore } from '../store';

const GAMES = [
  { id: '2048', label: '2048', icon: '2️⃣0️⃣4️⃣8️⃣' },
  { id: 'fifteen', label: 'Fifteen', icon: '1️⃣5️⃣' },
  { id: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { id: 'match', label: 'Match', icon: '🃏' },
  { id: 'sudoku', label: 'Sudoku', icon: '🔢' },
  { id: 'mix', label: 'Mix', icon: '🌀' },
  { id: 'memory', label: 'Memory', icon: '🧠' },
  { id: 'equations', label: 'Equations', icon: '🧮' },
];

export function GamesHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const night = useSettingsStore((s) => s.night);
  const colors = night ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Games</Text>
        <TouchableOpacity style={styles.crownBtn} onPress={() => { /* Google Sign-In */ }}>
          <Text style={{ fontSize: 28 }}>👑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameTile, { backgroundColor: colors.surface }]}
            onPress={() => {
              if (game.id === 'equations') {
                navigation.navigate('EquationsLevels');
              } else {
                // Other games - UNKNOWN
              }
            }}
            activeOpacity={0.8}
            disabled={game.id !== 'equations'}
          >
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <Text style={[styles.gameLabel, { color: colors.textPrimary }]}>{game.label}</Text>
            {game.id !== 'equations' && (
              <View style={styles.comingSoon}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
  crownBtn: { width: 48, alignItems: 'flex-end' },
  gridContainer: {
    padding: 16,
    flexGrow: 1,
  },
  gameTile: {
    width: '48%',
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
  gameIcon: { fontSize: 48, marginBottom: 8 },
  gameLabel: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  comingSoon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
});