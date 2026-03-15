import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContinueButton from '../../../components/ui/ContinueButton';

export default function StylistCompleteScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>WELCOME TO THE COMMUNITY</Text>
        <Text style={styles.title}>
          Your CRWN{'\n'}profile is <Text style={styles.italic}>live.</Text>
        </Text>
      </View>
      <ContinueButton
        label="Continue"
        variant="dark"
        onPress={() => navigation.replace('MainApp')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ECE6DC',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  eyebrow: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#52463C',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 42,
    color: '#251C15',
    lineHeight: 52,
  },
  italic: {
    fontStyle: 'italic',
    color: '#BF9466',
  },
});
