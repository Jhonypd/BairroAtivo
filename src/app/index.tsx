import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>BairroAtivo</Text>
      <Text style={styles.subtitle}>Uma comunidade melhor começa com a participação de todos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F8F2',
  },
  title: {
    color: '#1E5631',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 12,
    color: '#405447',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
