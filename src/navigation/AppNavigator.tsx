// Main navigation container
// Evidence: SPEC_NAVIGATION.md, E-RT-001..E-RT-010, E-RT-019

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { TopicSelectScreen } from '../screens/TopicSelectScreen';
import { ModeSelectScreen } from '../screens/ModeSelectScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GamesHubScreen } from '../screens/GamesHubScreen';
import { EquationsLevelsScreen } from '../screens/EquationsLevelsScreen';
import { EquationsBoardScreen } from '../screens/EquationsBoardScreen';
import { useSettingsStore } from '../store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const night = useSettingsStore((s) => s.night);

  return (
    <NavigationContainer theme={night ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={MainMenuScreen} />
        <Stack.Screen name="TopicSelect" component={TopicSelectScreen} />
        <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="GamesHub" component={GamesHubScreen} />
        <Stack.Screen name="EquationsLevels" component={EquationsLevelsScreen} />
        <Stack.Screen name="EquationsBoard" component={EquationsBoardScreen} />
        {/* Mini-games - placeholders */}
        <Stack.Screen name="Game2048" component={() => null} />
        <Stack.Screen name="GameFifteen" component={() => null} />
        <Stack.Screen name="GamePuzzle" component={() => null} />
        <Stack.Screen name="GameMatch" component={() => null} />
        <Stack.Screen name="GameSudoku" component={() => null} />
        <Stack.Screen name="GameMix" component={() => null} />
        <Stack.Screen name="GameMemory" component={() => null} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}