import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../components/ui';

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Main'), 450);
    return () => clearTimeout(timer);
  }, [navigation]);
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background }}>
    <Text style={{ fontSize: 64, color: colors.fraction, fontWeight: '800' }}>m.</Text>
    <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '700' }}>A little math. Every day.</Text>
  </View>;
}
