import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useGoogleAuth, getValidAccessToken } from '../services/googleAuth';
import { loadUser } from '../services/storage';

export default function LoginScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const { signIn, response } = useGoogleAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess();
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Errore di autenticazione');
      setLoading(false);
    }
  }, [response]);

  const checkExistingSession = async () => {
    const user = await loadUser();
    if (user) {
      const token = await getValidAccessToken();
      if (token) {
        onLogin(user);
        return;
      }
    }
    setLoading(false);
  };

  const handleAuthSuccess = async () => {
    setLoading(true);
    const user = await loadUser();
    if (user) {
      onLogin(user);
    } else {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    await signIn();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e8d5b7" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.symbol}>△</Text>
        </View>
        <Text style={styles.title}>Elayra</Text>
        <Text style={styles.subtitle}>
          La tua compagna di crescita interiore
        </Text>
        <Text style={styles.description}>
          Accedi per iniziare il tuo percorso.\nRituali, riflessioni, connessione.
        </Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Image
            source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>
            Continua con Google
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Accedendo accetti i Termini e la Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  symbol: {
    fontSize: 48,
    color: '#e8d5b7',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f5f0e8',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#a09070',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '300',
  },
  description: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  error: {
    color: '#e86c6c',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  loadingText: {
    marginTop: 16,
    color: '#a09070',
    fontSize: 15,
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
});