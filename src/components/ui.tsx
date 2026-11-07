import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';
import { PlayfulIcon, PlayfulIconName } from './PlayfulIcon';

export function useTheme() {
  const night = useSettingsStore((state) => state.night);
  return night ? Colors.dark : Colors.light;
}

export function AppScreen({ children }: PropsWithChildren) {
  const colors = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, overflow: 'hidden' }}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: colors.backgroundAlt, opacity: 0.7 }} />
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', bottom: -80, left: -100, width: 240, height: 240, borderRadius: 120, backgroundColor: colors.backgroundAlt2, opacity: 0.7 }} />
    <ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </SafeAreaView>;
}

export function PageHeader({ title, subtitle, onBack, action }: {
  title: string; subtitle?: string; onBack?: () => void; action?: React.ReactNode;
}) {
  const colors = useTheme();
  return <View style={ui.header}>
    {onBack && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={[ui.iconButton, { backgroundColor: colors.surface }]}>
      <PlayfulIcon name="back" size={28} />
      <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>Back</Text>
    </TouchableOpacity>}
    <View style={{ flex: 1 }}>
      <Text accessibilityRole="header" style={[ui.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[ui.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
    {action}
  </View>;
}

export function ActionButton({ label, onPress, secondary = false, disabled = false, icon, accessibilityLabel }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: PlayfulIconName; accessibilityLabel?: string;
}) {
  const colors = useTheme();
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[ui.button, { backgroundColor: secondary ? colors.surfaceDark : colors.restartBtn, borderBottomColor: secondary ? colors.border : '#403080', opacity: disabled ? 0.45 : 1 }]}>
    {icon && <PlayfulIcon name={icon} size={32} />}
    <Text style={[ui.buttonText, { color: secondary ? colors.textPrimary : '#FFFFFF', flexShrink: 1 }]}>{label}</Text>
  </TouchableOpacity>;
}

export function SurfaceCard({ children }: PropsWithChildren) {
  const colors = useTheme();
  return <View style={[ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

export const ui = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', padding: 16, gap: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 23, marginTop: 5 },
  iconButton: { minWidth: 48, minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 10 },
  button: { minHeight: 56, borderRadius: 20, borderBottomWidth: 4, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  card: { borderRadius: 24, padding: 22, gap: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 19, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { width: '48%', minHeight: 166, padding: 16, borderRadius: 24, gap: 10, borderWidth: 1, borderBottomWidth: 4 },
});
