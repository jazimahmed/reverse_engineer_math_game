import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme() {
  const night = useSettingsStore((state) => state.night);
  return night ? Colors.dark : Colors.light;
}

export function AppScreen({ children }: PropsWithChildren) {
  const colors = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </SafeAreaView>;
}

export function PageHeader({ title, subtitle, onBack, action }: {
  title: string; subtitle?: string; onBack?: () => void; action?: React.ReactNode;
}) {
  const colors = useTheme();
  return <View style={ui.header}>
    {onBack && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={[ui.iconButton, { backgroundColor: colors.surface }]}>
      <Text style={{ color: colors.textPrimary, fontSize: 24 }}>‹</Text>
    </TouchableOpacity>}
    <View style={{ flex: 1 }}>
      <Text accessibilityRole="header" style={[ui.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[ui.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
    {action}
  </View>;
}

export function ActionButton({ label, onPress, secondary = false, disabled = false }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean;
}) {
  const colors = useTheme();
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[ui.button, { backgroundColor: secondary ? colors.surfaceDark : colors.restartBtn, opacity: disabled ? 0.45 : 1 }]}>
    <Text style={[ui.buttonText, { color: secondary ? colors.textPrimary : '#FFFFFF' }]}>{label}</Text>
  </TouchableOpacity>;
}

export function SurfaceCard({ children }: PropsWithChildren) {
  const colors = useTheme();
  return <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

export const ui = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, gap: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  iconButton: { minWidth: 48, minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 10 },
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  card: { borderRadius: 24, padding: 22, gap: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 19, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { width: '48%', minHeight: 146, padding: 18, borderRadius: 22, gap: 10, borderWidth: 1 },
});
