import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from 'react-native';
import messagesData from './assets/messages.json';
import axios from 'axios';

export default function App() {
  // --------------------
  // Message‐of‐the‐Day logic
  // --------------------
  const msgs: string[] = messagesData.messages;
  const [index, setIndex] = useState(Math.floor(Math.random() * msgs.length));
  const todayMsg = msgs[index];

  const refreshMessage = () => {
    let next = Math.floor(Math.random() * msgs.length);
    if (next === index) {
      next = (next + 1) % msgs.length;
    }
    setIndex(next);
  };

  // --------------------
  // Axios / API test logic
  // --------------------
  const [apiData, setApiData] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const fetchOnlineData = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      setApiData({ title: response.data.title, body: response.data.body });
    } catch (err) {
      console.error('API error:', err);
      setErrorText('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineData();
  }, []);

  // --------------------
  // Current Date/Time logic
  // --------------------
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const refreshTime = () => {
    setCurrentTime(new Date().toLocaleString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* -------------------- */}
        {/* Message‐of‐the‐Day Card */}
        {/* -------------------- */}
        <View style={styles.card}>
          <Text style={styles.title}>Message of the Day</Text>
          <Text style={styles.message}>{todayMsg}</Text>
          <Button title="New Message" onPress={refreshMessage} />
        </View>

        {/* -------------------- */}
        {/* API Test Card */}
        {/* -------------------- */}
        <View style={styles.card}>
          <Text style={styles.title}>API Test</Text>

          {loading && <ActivityIndicator size="large" color="#0000ff" />}

          {!loading && apiData && (
            <>
              <Text style={styles.apiTitle}>{apiData.title}</Text>
              <Text style={styles.apiBody}>{apiData.body}</Text>
            </>
          )}

          {!loading && errorText && <Text style={styles.error}>{errorText}</Text>}

          <Button title="Reload API" onPress={fetchOnlineData} />
        </View>

        {/* -------------------- */}
        {/* Current Date/Time Card */}
        {/* -------------------- */}
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
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  scrollContainer: {
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    // For iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // For Android elevation
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
    marginBottom: 12,
  },
  apiTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  apiBody: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});
