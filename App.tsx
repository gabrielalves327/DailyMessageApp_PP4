import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Share,
  Animated,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messagesData from './assets/messages.json';

export default function App() {
  const msgs = messagesData.messages;
  const [index, setIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [savedCustomMessage, setSavedCustomMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [daysSinceStart, setDaysSinceStart] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [feelingHistory, setFeelingHistory] = useState([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadData = async () => {
      const savedIndex = await AsyncStorage.getItem('lastMessageIndex');
      const savedMsg = await AsyncStorage.getItem('customMessage');
      const lastDate = await AsyncStorage.getItem('lastOpenedDate');
      const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
      const savedFeelings = await AsyncStorage.getItem('feelingHistory');
      const today = new Date().toDateString();
      let currentStreak = parseInt(await AsyncStorage.getItem('streak') || '0');

      if (lastDate !== today) {
        currentStreak++;
        await AsyncStorage.setItem('lastOpenedDate', today);
        await AsyncStorage.setItem('streak', currentStreak.toString());
      }

      setStreak(currentStreak);
      if (savedIndex !== null) setIndex(parseInt(savedIndex));
      if (savedMsg) setSavedCustomMessage(savedMsg);
      if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
      if (savedFeelings) setFeelingHistory(JSON.parse(savedFeelings));
    };
    loadData();
  }, []);

  useEffect(() => {
    const checkFirstOpen = async () => {
      const firstDate = await AsyncStorage.getItem('firstOpenDate');
      const today = new Date();
      if (!firstDate) {
        await AsyncStorage.setItem('firstOpenDate', today.toDateString());
        setDaysSinceStart(1);
      } else {
        const diff = (today - new Date(firstDate)) / (1000 * 60 * 60 * 24);
        setDaysSinceStart(Math.floor(diff) + 1);
      }
    };
    checkFirstOpen();
  }, []);

  const refreshMessage = async () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();

    let next = Math.floor(Math.random() * msgs.length);
    if (next === index) next = (next + 1) % msgs.length;
    setIndex(next);
    await AsyncStorage.setItem('lastMessageIndex', next.toString());
  };

  const shareMessage = async () => {
    try {
      await Share.share({ message: msgs[index] });
    } catch (e) {
      console.error(e);
    }
  };

  const saveCustomMessage = async () => {
    await AsyncStorage.setItem('customMessage', customMessage);
    setSavedCustomMessage(customMessage);
    setCustomMessage('');
  };

  const toggleDarkMode = async () => {
    const mode = !isDarkMode;
    setIsDarkMode(mode);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(mode));
  };

  const recordFeeling = async (mood) => {
    const today = new Date().toDateString();
    const newEntry = `${today}: ${mood}`;
    const updated = [newEntry, ...feelingHistory];
    setFeelingHistory(updated);
    await AsyncStorage.setItem('feelingHistory', JSON.stringify(updated));
  };

  const feelings = ['😊 Happy', '😐 Neutral', '😞 Sad', '😡 Angry', '😌 Grateful'];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.streak, isDarkMode && styles.darkStreak]}>🔥 Streak: {streak} days</Text>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Message of the Day</Text>
          <Text style={[styles.date, isDarkMode && styles.darkDate]}>{new Date().toLocaleDateString()}</Text>
          <Animated.Text style={[styles.message, { opacity: fadeAnim }, isDarkMode && styles.darkMessage]}>
            {msgs[index]}
          </Animated.Text>
          <Button title="New Message" onPress={refreshMessage} />
          <Button title="Share Message" onPress={shareMessage} />
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>How are you feeling today?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {feelings.map((mood, i) => (
              <TouchableOpacity key={i} onPress={() => recordFeeling(mood)}>
                <Text style={{ margin: 8, fontSize: 18 }}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Mood History</Text>
          {feelingHistory.map((entry, i) => (
            <Text key={i} style={{ textAlign: 'center', marginVertical: 2 }}>{entry}</Text>
          ))}
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Custom Message</Text>
          <TextInput
            style={styles.input}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Type your own message"
          />
          <Button title="Save Message" onPress={saveCustomMessage} />
          {savedCustomMessage && <Text style={{ marginTop: 10 }}>Saved: "{savedCustomMessage}"</Text>}
        </View>

        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Button
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            onPress={toggleDarkMode}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  darkContainer: { backgroundColor: '#1c2526' },
  scrollContainer: { padding: 16 },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  darkCard: { backgroundColor: '#34495e' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  darkTitle: { color: '#fff' },
  message: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
  darkMessage: { color: '#ddd' },
  streak: { textAlign: 'center', marginVertical: 10 },
  darkStreak: { color: '#ccc' },
  date: { textAlign: 'center', marginBottom: 10, color: '#666' },
  darkDate: { color: '#bbb' },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 5 },
});
