import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Button } from 'react-native';
import messagesData from './assets/messages.json';

export default function App() {
  const msgs: string[] = messagesData.messages;

  // state to hold current index
  const [index, setIndex] = useState(
    Math.floor(Math.random() * msgs.length)
  );

  // function to pick a new random index (and avoid an immediate repeat)
  const refreshMessage = () => {
    let next = Math.floor(Math.random() * msgs.length);
    if (next === index) {
      next = (next + 1) % msgs.length;
    }
    setIndex(next);
  };

  const todayMsg = msgs[index];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Message of the Day</Text>
        <Text style={styles.message}>{todayMsg}</Text>
      </View>

      {/* New Message button */}
      <Button title="New Message" onPress={refreshMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
  },
  card: {
    padding: 20,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
});
