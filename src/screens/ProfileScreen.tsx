import React, { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '../store/settingsStore';
import { ActionButton, AppScreen, PageHeader, SurfaceCard, useTheme } from '../components/ui';

export function ProfileScreen() {
  const navigation = useNavigation();
  const colors = useTheme();
  const { profileName, setProfileName } = useSettingsStore();
  const [name, setName] = useState(profileName);
  const save = () => { setProfileName(name); navigation.goBack(); };
  return <AppScreen>
    <PageHeader title="Your space" subtitle="A little personalization goes a long way." onBack={() => navigation.goBack()} />
    <SurfaceCard>
      <Text style={{ color: colors.fraction, fontSize: 44, fontWeight: '800' }}>{(name.trim() || 'L').slice(0, 1).toUpperCase()}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>What should we call you?</Text>
      <TextInput accessibilityLabel="Profile name" value={name} onChangeText={setName} maxLength={30} autoCapitalize="words"
        placeholder="Your name" placeholderTextColor={colors.textSecondary} returnKeyType="done" onSubmitEditing={save}
        style={{ color: colors.textPrimary, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 18 }} />
      <Text style={{ color: colors.textSecondary, lineHeight: 21 }}>This is a local profile, saved on this device. No account or sign-in is needed.</Text>
    </SurfaceCard>
    <ActionButton label="Save profile" onPress={save} />
  </AppScreen>;
}
