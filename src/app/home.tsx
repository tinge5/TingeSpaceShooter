import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.profileRow}>
          <View style={[styles.shipBadge, { backgroundColor: profile?.shipColor ?? '#FF9F43' }]} />
          <View>
            <Text style={styles.eyebrow}>Pilot</Text>
            <Text style={styles.username}>{profile?.username ?? 'Commander'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Ready for launch</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best score</Text>
          <Text style={styles.statValue}>{profile?.bestScore ?? 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best level</Text>
          <Text style={styles.statValue}>{profile?.bestLevel ?? 1}</Text>
        </View>
      </View>

      <View style={styles.buttonStack}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/game')}>
          <Text style={styles.buttonText}>PLAY</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/leaderboard')}>
          <Text style={styles.buttonText}>VIEW LEADERBOARD</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/settings')}>
          <Text style={styles.buttonText}>PROFILE SETTINGS</Text>
        </Pressable>

        <Pressable style={styles.ghostButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>SIGN OUT</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040B1A',
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  headerCard: {
    backgroundColor: '#0D1627',
    borderColor: '#243D62',
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shipBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF9F43',
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  eyebrow: {
    color: '#8EA4C7',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  username: {
    color: '#F6FBFF',
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    marginTop: 16,
    color: '#FFD28A',
    fontSize: 28,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#101B2D',
    borderWidth: 1,
    borderColor: '#25436D',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    color: '#8DA7C8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#F4F9FF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  buttonStack: {
    marginTop: 28,
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#FF9F43',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1B2E4E',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ghostButton: {
    backgroundColor: '#0E1A2B',
    borderWidth: 1,
    borderColor: '#3C5B88',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#F7FAFF',
  },
});
