// Splash Screen - Evidence: E-RT-001, E-RT-017
// GA STUDIOS logo, "v14.2", green progress dot, 10-15s then Main

import React, { useEffect } from 'react';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 12000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>GA STUDIOS</Text>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
        <Text style={styles.version}>v14.2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D2733',
    marginBottom: 24,
    letterSpacing: 2,
  },
  spinner: {
    marginVertical: 32,
  },
  version: {
    fontSize: 16,
    color: '#4B5968',
    fontWeight: '500',
  },
});