// Settings Screen - Evidence: E-RT-011
// Purple dialog with Music/Sound/Night toggles, shared footer, Night persists

import React from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/colors';
import { useSettingsStore } from '../store';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { music, sound, night, setMusic, setSound, setNight } = useSettingsStore();
  const themeNight = useSettingsStore((s) => s.night);
  const colors = themeNight ? Colors.dark : Colors.light;

  // Settings is a modal dialog in the reference app
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={styles.overlay} onTouchStart={() => navigation.goBack()}>
        <View style={[styles.dialog, { backgroundColor: colors.settingsBg }]}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: colors.nightText }]}>Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.closeIcon, { color: colors.nightText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Toggles */}
          <View style={styles.toggleList}>
            {[
              { label: 'Music', icon: '🎵', key: 'music', value: music, onChange: setMusic },
              { label: 'Sound', icon: '🔊', key: 'sound', value: sound, onChange: setSound },
              { label: 'Night', icon: '🌙', key: 'night', value: night, onChange: setNight },
            ].map(({ label, icon, key, value, onChange }) => (
              <View key={key} style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleIcon, { color: colors.nightText }]}>{icon}</Text>
                  <Text style={[styles.toggleLabel, { color: colors.nightText }]}>{label}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  thumbColor={value ? '#E53935' : '#FFFFFF'}
                  trackColor={{ true: '#4CAF50', false: '#757575' }}
                />
              </View>
            ))}
          </View>

          {/* Shared footer (same as Result screen) */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerBtn}>
              <Text style={[styles.footerIcon, { color: colors.nightText }]}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn}>
              <Text style={[styles.footerIcon, { color: colors.nightText }]}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerBtn}>
              <View style={[styles.footerPink, { backgroundColor: '#E91E63' }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  toggleList: {
    paddingVertical: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleIcon: {
    fontSize: 24,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },
  footerBtn: {
    padding: 8,
  },
  footerIcon: {
    fontSize: 28,
  },
  footerPink: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});