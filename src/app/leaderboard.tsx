import { router } from 'expo-router';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { db } from '../firebase';

type LeaderboardEntry = {
  uid: string;
  username: string;
  bestScore: number;
  bestLevel: number;
  shipColor: string;
};

export default function LeaderboardScreen() {
  const [filter, setFilter] = useState<'bestScore' | 'bestLevel'>('bestScore');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy(filter, 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextEntries = snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<LeaderboardEntry>;
        return {
          uid: doc.id,
          username: data.username ?? 'Pilot',
          bestScore: data.bestScore ?? 0,
          bestLevel: data.bestLevel ?? 1,
          shipColor: data.shipColor ?? '#FF9F43',
        };
      });
      setEntries(nextEntries);
    });

    return () => unsubscribe();
  }, [filter]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterButton, filter === 'bestScore' && styles.filterSelected]}
            onPress={() => setFilter('bestScore')}
          >
            <Text style={styles.filterText}>Scores</Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'bestLevel' && styles.filterSelected]}
            onPress={() => setFilter('bestLevel')}
          >
            <Text style={styles.filterText}>Level</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {entries.map((entry, index) => (
          <View key={entry.uid} style={styles.row}>
            <View style={styles.rankCell}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.userCell}>
              <View style={[styles.shipColor, { backgroundColor: entry.shipColor }]} />
              <Text style={styles.username}>{entry.username}</Text>
            </View>
            <Text style={styles.scoreText}>
              {filter === 'bestScore' ? entry.bestScore : entry.bestLevel}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040B1A',
    padding: 20,
    paddingTop: 48,
  },
  topBar: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  header: {
    marginTop: 8,
  },
  title: {
    color: '#F4F8FF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#10203A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C4B73',
  },
  filterSelected: {
    backgroundColor: '#FF9F43',
  },
  filterText: {
    color: '#F6FAFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  list: {
    marginTop: 20,
  },
  listContent: {
    gap: 10,
  },
  row: {
    backgroundColor: '#0B1729',
    borderWidth: 1,
    borderColor: '#25436D',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankCell: {
    width: 52,
  },
  rankText: {
    color: '#FFCF85',
    fontWeight: '800',
  },
  userCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shipColor: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#F4F8FF',
  },
  username: {
    color: '#F4F8FF',
    fontWeight: '700',
  },
  scoreText: {
    color: '#FFDD9C',
    fontWeight: '900',
    fontSize: 18,
  },
});
