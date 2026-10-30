import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

const shipColors = ['#FF9F43', '#6EE7FF', '#A78BFA', '#FF6B9D', '#7EF29A', '#FDE68A'];

export default function SettingsScreen() {
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [shipColor, setShipColor] = useState(profile?.shipColor ?? '#FF9F43');

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Username required', 'Choose a username before saving your settings.');
      return;
    }

    await updateProfile(username.trim(), shipColor);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Profile settings</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a pilot name"
          placeholderTextColor="#8AA0B7"
        />

        <Text style={styles.label}>Spaceship color</Text>
        <View style={styles.colorRow}>
          {shipColors.map((color) => (
            <Pressable
              key={color}
              onPress={() => setShipColor(color)}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                shipColor === color && styles.colorSelected,
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>SAVE PROFILE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040B1A',
    padding: 24,
    paddingTop: 48,
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: '#10203A',
    borderWidth: 1,
    borderColor: '#2A4B75',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: '#F5FAFF',
    fontWeight: '700',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#0D1627',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E3352',
    padding: 24,
  },
  title: {
    color: '#F4F8FF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },
  label: {
    color: '#AFC8EA',
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#071421',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B4A73',
    color: '#F5FAFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.08 }],
  },
  saveButton: {
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#091A2C',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
