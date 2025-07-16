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
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem('lastMessageIndex');
        const savedMsg = await AsyncStorage.getItem('customMessage');
        const lastDate = await AsyncStorage.getItem('lastOpenedDate');
        const today = new Date().toDateString();
        let currentStreak = parseInt(await AsyncStorage.getItem('streak') || '0');
        const savedDarkMode = await AsyncStorage.getItem('isDarkMode');

        if (lastDate !== today) {
          currentStreak += 1;
          await AsyncStorage.setItem('lastOpenedDate', today);
          await AsyncStorage.setItem('streak', currentStreak.toString());
        }

        setStreak(currentStreak);
        if (savedIndex !== null) setIndex(parseInt(savedIndex, 10));
        if (savedMsg !== null) setSavedCustomMessage(savedMsg);
        if (savedDarkMode !== null) setIsDarkMode(JSON.parse(savedDarkMode));
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const firstDate = await AsyncStorage.getItem('firstOpenDate');
        const today = new Date();
        if (!firstDate) {
          await AsyncStorage.setItem('firstOpenDate', today.toDateString());
          setDaysSinceStart(1);
        } else {
          const diff =
            (today.getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24);
          setDaysSinceStart(Math.floor(diff) + 1);
        }
      } catch (e) {
        console.error('Error calculating days since start:', e);
      }
    };
    checkFirstOpen();
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

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newDarkMode));
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.streak, isDarkMode && styles.darkStreak]}>🔥 Daily Check-ins: {streak}</Text>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Message of the Day</Text>
          <Text style={[styles.date, isDarkMode && styles.darkDate]}>{new Date().toLocaleDateString()}</Text>
          <Animated.Text style={[styles.message, { opacity: fadeAnim }, isDarkMode && styles.darkMessage]}>
            {msgs[index]}
          </Animated.Text>
          <Button title="New Message" onPress={refreshMessage} color={isDarkMode ? '#fff' : '#007AFF'} />
          <Button title="Share Message" onPress={shareMessage} color={isDarkMode ? '#fff' : '#007AFF'} />
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Add Your Own Message</Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Write your message here..."
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
          />
          <Button title="Save Message" onPress={saveCustomMessage} color={isDarkMode ? '#fff' : '#007AFF'} />
          {savedCustomMessage ? (
            <Text style={[styles.savedMessage, isDarkMode && styles.darkSavedMessage]}>Saved: "{savedCustomMessage}"</Text>
          ) : null}
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Quote of the Moment</Text>
          {loadingApi && <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#0000ff'} />}
          {!loadingApi && apiData && !errorApi && (
            <>
              <Text style={[styles.apiTitle, isDarkMode && styles.darkApiTitle]}>{apiData.title}</Text>
              <Text style={[styles.apiBody, isDarkMode && styles.darkApiBody]}>{apiData.body}</Text>
            </>
          )}
          {!loadingApi && errorApi && <Text style={[styles.error, isDarkMode && styles.darkError]}>{errorApi}</Text>}
          <Button title="Reload Quote" onPress={fetchApiData} color={isDarkMode ? '#fff' : '#007AFF'} />
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Current Date & Time</Text>
          <Text style={[styles.message, isDarkMode && styles.darkMessage]}>{currentTime}</Text>
          <Button title="Refresh Time" onPress={refreshTime} color={isDarkMode ? '#fff' : '#007AFF'} />
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>You've Had This App For</Text>
          <Text style={[styles.message, isDarkMode && styles.darkMessage]}>{daysSinceStart} day(s)</Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Button title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} onPress={toggleDarkMode} color={isDarkMode ? '#fff' : '#007AFF'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  darkContainer: { backgroundColor: '#1c2526' },
  scrollContainer: { padding: 16, justifyContent: 'center' },
  card: {
    padding: 21,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  darkCard: { backgroundColor: '#2c3e50', shadowColor: '#fff' },
  header: {
    height: 10,
    backgroundColor: '#007AFF',
    width: '100%',
  },
  darkHeader: { backgroundColor: '#34495e' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  darkTitle: { color: '#fff' },
  date: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
  darkDate: { color: '#bbb' },
  message: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
  },
  darkMessage: { color: '#ddd' },
  streak: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
  },
  darkStreak: { color: '#ddd' },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  darkInput: {
    borderColor: '#666',
    backgroundColor: '#34495e',
    color: '#fff',
  },
  savedMessage: {
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    color: 'green',
  },
  darkSavedMessage: { color: '#2ecc71' },
  apiTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  darkApiTitle: { color: '#fff' },
  apiBody: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  darkApiBody: { color: '#bbb' },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  darkError: { color: '#e74c3c' },
});