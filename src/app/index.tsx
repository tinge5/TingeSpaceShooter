import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const [isFlashing, setIsFlashing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing((current) => !current);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME TO TINGE SPACE SHOOTER</Text>
      <Pressable onPress={() => router.replace('/auth')} style={styles.button}>
        <Text style={[styles.buttonText, isFlashing && styles.flashText]}>PRESS PLAY</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020817',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#F7FBFF',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF9F43',
    shadowColor: '#FFB761',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#07111E',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  flashText: {
    opacity: 0.45,
  },
});
