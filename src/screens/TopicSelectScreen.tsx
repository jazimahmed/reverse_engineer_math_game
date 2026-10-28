import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ModeLabels, ModeId } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { AppScreen, PageHeader, ui, useTheme } from '../components/ui';

const descriptions: Record<string, string> = {
  practice: 'Take your time. Try again.', quiz: 'Find the missing number.', duel: 'Two players. One challenge.',
  test: 'Is the equation true or false?', time: 'Think fast. Beat the clock.', play: 'Type it. Solve it.',
  learn: 'Worked examples, step by step.', hard: 'Ready for bigger numbers?', exam: 'One attempt. Make it count.',
  addition: 'Add numbers together.', subtract: 'Find the difference.', multiply: 'Multiply the numbers.', division: 'Divide and conquer.',
};

export function TopicSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params: { topicId } } = useRoute<RouteProp<RootStackParamList, 'TopicSelect'>>();
  const colors = useTheme();
  const config = TopicConfig[topicId as TopicId];
  return <AppScreen>
    <PageHeader title={config?.title || 'Choose a topic'} subtitle="Make it your kind of challenge." onBack={() => navigation.goBack()} />
    <View style={ui.grid}>
      {config?.modes.map((modeId, index) => <TouchableOpacity key={modeId} accessibilityRole="button"
        accessibilityLabel={ModeLabels[modeId as ModeId] || modeId}
        onPress={() => navigation.navigate('Game', { modeId, topicId })}
        style={[ui.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.fraction }}>0{index + 1} ↗</Text>
        <Text style={{ fontSize: 19, fontWeight: '700', color: colors.textPrimary }}>{ModeLabels[modeId as ModeId] || modeId}</Text>
        <Text style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>{descriptions[modeId]}</Text>
      </TouchableOpacity>)}
    </View>
  </AppScreen>;
}
