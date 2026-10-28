import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { AppScreen } from '../components/ui';
import { SettingsPanel } from '../components/SettingsPanel';

export function SettingsScreen() {
  const navigation = useNavigation();
  return <AppScreen><SettingsPanel onClose={() => navigation.goBack()} /></AppScreen>;
}
