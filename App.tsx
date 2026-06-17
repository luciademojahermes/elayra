import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { loadUser } from './src/services/storage';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedUser = await loadUser();
    if (storedUser) {
      setUser({
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        picture: storedUser.picture,
      });
    }
    setLoading(false);
  };

  const handleLogin = (loggedInUser: any) => {
    setUser({
      id: loggedInUser.id,
      email: loggedInUser.email,
      name: loggedInUser.name,
      picture: loggedInUser.picture,
    });
  };

  const handleLogout = async () => {
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#e8d5b7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {user ? (
        <ChatScreen user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});