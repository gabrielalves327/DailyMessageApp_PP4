import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  TextInput,
  Share,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messagesData from './assets/messages.json';

export default function App() {
  const msgs: string[] = messagesData.messages;
  const [index, setIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [savedCustomMessage, setSavedCustomMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('lastMessageIndex');
        const savedMsg = await AsyncStorage.getItem('customMessage');
        const lastDate = await AsyncStorage.getItem('lastOpenedDate');
        const today = new Date().toDateString();
        let currentStreak = parseInt(await AsyncStorage.getItem('streak') || '0');

        if (lastDate !== today) {
          currentStreak += 1;
          await AsyncStorage.setItem('lastOpenedDate', today);
          await AsyncStorage.setItem('streak', currentStreak.toString());
        }

        setStreak(currentStreak);
        if (savedIndex !== null) setIndex(parseInt(savedIndex, 10));
        if (savedMsg !== null) setSavedCustomMessage(savedMsg);
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, []);

  const refreshMessage = async () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    let next = Math.floor(Math.random() * msgs.length);
    if (next === index) next = (next + 1) % msgs.length;
    setIndex(next);
    await AsyncStorage.setItem('lastMessageIndex', next.toString());
  };

  const shareMessage = async () => {
    try {
      await Share.share({ message: msgs[index] });
    } catch (error) {
      console.error('Error sharing message:', error);
    }
  };

  const [apiData, setApiData] = useState<{ title: string; body: string } | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const fetchApiData = async () => {
    setLoadingApi(true);
    setErrorApi(null);
    setApiData(null);
    try {
      const res = await fetch('https://type.fit/api/quotes');
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      const allQuotes = await res.json();
      const random = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setApiData({
        title: random.text,
        body: random.author ? `— ${random.author}` : '— Unknown',
      });
    } catch (err: any) {
      console.error('API fetch error:', err);
      setErrorApi('Failed to load quote.');
      setApiData(null);
    } finally {
      setLoadingApi(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const refreshTime = () => {
    setCurrentTime(new Date().toLocaleString());
  };

  const saveCustomMessage = async () => {
    try {
      await AsyncStorage.setItem('customMessage', customMessage);
      setSavedCustomMessage(customMessage);
      setCustomMessage('');
    } catch (e) {
      console.error('Error saving custom message:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.streak}>🔥 Daily Check-ins: {streak}</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Message of the Day</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
            {msgs[index]}
          </Animated.Text>
          <Button title="New Message" onPress={refreshMessage} />
          <Button title="Share Message" onPress={shareMessage} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Add Your Own Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Write your message here..."
            value={customMessage}
            onChangeText={setCustomMessage}
          />
          <Button title="Save Message" onPress={saveCustomMessage} />
          {savedCustomMessage ? (
            <Text style={styles.savedMessage}>Saved: "{savedCustomMessage}"</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Quote of the Moment</Text>
          {loadingApi && <ActivityIndicator size="large" color="#0000ff" />}
          {!loadingApi && apiData && !errorApi && (
            <>
              <Text style={styles.apiTitle}>{apiData.title}</Text>
              <Text style={styles.apiBody}>{apiData.body}</Text>
            </>
          )}
          {!loadingApi && errorApi && <Text style={styles.error}>{errorApi}</Text>}
          <Button title="Reload Quote" onPress={fetchApiData} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Current Date & Time</Text>
          <Text style={styles.message}>{currentTime}</Text>
          <Button title="Refresh Time" onPress={refreshTime} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  scrollContainer: { padding: 16, justifyContent: 'center' },
  card: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    height: 10,
    backgroundColor: '#007AFF',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
  message: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
  },
  streak: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  savedMessage: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'green',
  },
  apiTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  apiBody: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});
