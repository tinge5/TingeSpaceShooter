import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.replace('/home');
    }
  }, [user, loading]);

  const onSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Enter an email and password to continue.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      Alert.alert('Create username', 'Add a username before creating your account.');
      return;
    }

    try {
      setSubmitting(true);
      if (mode === 'signup') {
        await signUp(email.trim(), password, username.trim());
      } else {
        await signIn(email.trim(), password);
      }
      router.replace('/home');
    } catch (error) {
      Alert.alert('Authentication issue', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9F43" />
        <Text style={styles.loadingText}>Loading command deck...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>TingeSpaceShooter</Text>
        <Text style={styles.subtitle}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8AA0B7"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8AA0B7"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8AA0B7"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Loading...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}</Text>
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.toggleText}>
            {mode === 'signin' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040B1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#040B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(13, 22, 39, 0.9)',
    borderWidth: 1,
    borderColor: '#1E3352',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F5FAFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFB75D',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#091827',
    borderColor: '#2B4A73',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F4F8FF',
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#081827',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  toggleText: {
    color: '#9CC3FF',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingText: {
    color: '#E8F2FF',
    fontSize: 16,
    marginTop: 12,
  },
});
