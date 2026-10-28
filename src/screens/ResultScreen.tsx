import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { ActionButton, AppScreen, PageHeader, SurfaceCard, ui, useTheme } from '../components/ui';

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params: { score, modeId, topicId } } = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const colors = useTheme();
  const [review, setReview] = useState(false);
  const duel = modeId === 'duel';
  return <AppScreen>
    <PageHeader title="Round complete" subtitle="Every question is a step forward." />
    <SurfaceCard>
      <Text style={{ color: colors.fraction, fontSize: 44, fontWeight: '800', textAlign: 'center' }}>✓</Text>
      <Text style={[ui.title, { color: colors.textPrimary, textAlign: 'center' }]}>Nice work showing up.</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 }}>
        {[{ label: duel ? 'Bottom player' : modeId === 'learn' ? 'Learned' : 'First try', value: duel ? score.duelChipBottom : score.greenChip },
          { label: duel ? 'Top player' : 'Retry / missed', value: duel ? score.duelChipTop : score.redChip }].map(({ label, value }) =>
          <View key={label} style={{ alignItems: 'center', gap: 8 }}><Text style={{ fontSize: 38, fontWeight: '800', color: colors.textPrimary }}>{value}</Text><Text style={{ color: colors.textSecondary }}>{label}</Text></View>)}
      </View>
      <ActionButton label="Play another round" onPress={() => navigation.replace('Game', { modeId, topicId })} />
      <ActionButton label="Choose a mode" secondary onPress={() => navigation.popTo('TopicSelect', { topicId })} />
    </SurfaceCard>
    <ActionButton label="Review your answers" secondary onPress={() => setReview(true)} />
    <Modal visible={review} animationType="slide" transparent onRequestClose={() => setReview(false)}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000077' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close review" onPress={() => setReview(false)} style={{ flex: 1 }} />
        <View style={{ maxHeight: '80%', padding: 24, paddingBottom: 36, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, gap: 16 }}>
          <Text style={[ui.title, { color: colors.textPrimary }]}>Your round</Text>
          <ScrollView>{score.questionHistory.map((item, index) => <View key={index} style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 19 }}>{index + 1}. {item.question}</Text>
            <Text style={{ color: colors.textSecondary }}>{item.userAnswer === null ? 'Time ran out' : !item.correct ? 'Incorrect answer' : modeId === 'learn' ? 'Lesson completed' : item.firstTry ? 'Correct on the first try' : 'Solved after a retry'}</Text>
          </View>)}</ScrollView>
          <ActionButton label="Done" onPress={() => setReview(false)} />
        </View>
      </View>
    </Modal>
  </AppScreen>;
}
