import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
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
    <Image source={require('../assets/brand/icon.png')} accessibilityLabel="Smiling math calculator" style={{ width: 144, height: 144, borderRadius: 32 }} />
    <Text style={{ color: colors.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center' }}>Let’s play with numbers!</Text>
  </View>;
}
