import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Temporary app entry. Game screens are intentionally withheld until the
 * supplied reference APK can be observed or the relevant screen behavior is
 * otherwise established by attributable evidence.
 */
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Math Games research build</Text>
      <Text style={styles.body}>
        Reference screen flows are not yet verified. The current implementation
        contains isolated rules derived from the supplied APK.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#1d2733',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#4b5968',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 360,
    textAlign: 'center',
  },
});
