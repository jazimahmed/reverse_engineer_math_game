import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { ActionButton, AppScreen, PageHeader, SurfaceCard, ui, useTheme } from '../components/ui';
import { PlayfulIcon } from '../components/PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';

export function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params: { score, modeId, topicId } } = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const colors = useTheme();
  const [review, setReview] = useState(false);
  const duel = modeId === 'duel';
  const night = colors.background === colors.nightBg;
  return <AppScreen>
    <PageHeader title="You did it!" subtitle={`${score.totalQuestions} questions completed`} />
    <SurfaceCard>
      <View style={{ borderRadius: 28, paddingVertical: 24, paddingHorizontal: 12, backgroundColor: colors.finalQuestion, alignItems: 'center', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <PlayfulIcon name="star" size={36} />
          <PlayfulIcon name="trophy" size={128} />
          <PlayfulIcon name="star" size={36} />
        </View>
        <Text style={[ui.title, { color: colors.textPrimary, textAlign: 'center' }]}>Great learning!</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 8 }}>
        {[{ label: duel ? 'Bottom player' : modeId === 'learn' ? 'Learned' : 'First try', value: duel ? score.duelChipBottom : score.greenChip },
          { label: duel ? 'Top player' : 'Retry / missed', value: duel ? score.duelChipTop : score.redChip }].map(({ label, value }, index) => {
            const palette = PlayfulPalettes[index % PlayfulPalettes.length];
            return <View key={label} style={{ flex: 1, minWidth: 110, borderRadius: 22, padding: 16, alignItems: 'center', gap: 8, backgroundColor: night ? palette.darkFill : palette.fill }}>
              <PlayfulIcon name={duel ? 'duel' : index === 0 ? 'check' : 'retry'} size={36} />
              <Text style={{ fontSize: 38, fontWeight: '800', color: night ? colors.textPrimary : palette.ink }}>{value}</Text>
              <Text style={{ color: night ? colors.textPrimary : palette.ink, fontWeight: '700', textAlign: 'center' }}>{label}</Text>
            </View>;
          })}
      </View>
      <ActionButton label="Play again ▶" icon="retry" onPress={() => navigation.replace('Game', { modeId, topicId })} />
      <ActionButton label="Pick another game" icon="games" secondary onPress={() => navigation.popTo('TopicSelect', { topicId })} />
    </SurfaceCard>
    <ActionButton label="Review your answers" icon="learn" secondary onPress={() => setReview(true)} />
    <Modal visible={review} animationType="slide" transparent onRequestClose={() => setReview(false)}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000077' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close review" onPress={() => setReview(false)} style={{ flex: 1 }} />
        <View style={{ maxHeight: '80%', padding: 24, paddingBottom: 36, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.surface, gap: 16 }}>
          <Text style={[ui.title, { color: colors.textPrimary }]}>Your round</Text>
          <ScrollView>{score.questionHistory.map((item, index) => <View key={index} style={{ paddingVertical: 16, borderBottomWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 19 }}>{index + 1}. {item.question}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <PlayfulIcon name={item.userAnswer === null ? 'time' : item.correct ? 'check' : 'close'} size={28} />
              <Text style={{ color: colors.textSecondary, flex: 1 }}>{item.userAnswer === null ? 'Time ran out' : !item.correct ? 'Incorrect answer' : modeId === 'learn' ? 'Lesson completed' : item.firstTry ? 'Correct on the first try' : 'Solved after a retry'}</Text>
            </View>
          </View>)}</ScrollView>
          <ActionButton label="Done" onPress={() => setReview(false)} />
        </View>
      </View>
    </Modal>
  </AppScreen>;
}
