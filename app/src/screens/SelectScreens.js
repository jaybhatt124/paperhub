// src/screens/SelectStreamScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { useData } from '../context/DataContext';

export function SelectStreamScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, classLevel, boardColor } = route.params;
  const { universities } = useData();

  const uni = universities.find(u => u.name === board || u.id === board.toLowerCase());
  const streams = uni?.streams?.[classLevel] || ['Science', 'Commerce', 'Arts'];

  const streamEmojis = { Science: '🔬', Commerce: '💼', Arts: '🎨' };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.primary} />
      <View style={[styles.header, { backgroundColor: boardColor || Colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{board} – {classLevel}</Text>
        <Text style={styles.headerSub}>Select your stream</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {streams.map((stream) => (
          <TouchableOpacity
            key={stream}
            style={[styles.card, { borderColor: (boardColor || Colors.primary) + '40' }]}
            onPress={() => navigation.navigate('SelectSubject', { board, classLevel, stream, boardColor })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>{streamEmojis[stream] || '📖'}</Text>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: boardColor || Colors.primary }]}>{stream}</Text>
              <Text style={styles.cardSub}>{stream} Stream</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── SELECT BRANCH ────────────────────────────────────────────────────────────
export function SelectBranchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, boardColor } = route.params;
  const { universities } = useData();

  const uni = universities.find(u => u.name === board || u.id === board.toLowerCase());
  const branches = uni?.branches || [
    'Computer Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Electrical Engineering', 'Electronics & Communication', 'Information Technology',
  ];

  const branchEmojis = {
    'Computer Engineering': '💻', 'Mechanical Engineering': '⚙️',
    'Civil Engineering': '🏗️', 'Electrical Engineering': '⚡',
    'Electronics & Communication': '📡', 'Information Technology': '🌐',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.gtu} />
      <View style={[styles.header, { backgroundColor: boardColor || Colors.gtu }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GTU Diploma</Text>
        <Text style={styles.headerSub}>Select your branch</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch}
            style={[styles.card, { borderColor: Colors.gtu + '40' }]}
            onPress={() => navigation.navigate('SelectSemester', { board, branch, boardColor })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>{branchEmojis[branch] || '🔧'}</Text>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: boardColor || Colors.gtu, fontSize: 15 }]}>{branch}</Text>
              <Text style={styles.cardSub}>Diploma Program</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── SELECT SEMESTER ──────────────────────────────────────────────────────────
export function SelectSemesterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, branch, boardColor } = route.params;
  const { universities } = useData();

  const uni = universities.find(u => u.name === board || u.id === board.toLowerCase());
  const totalSems = uni?.semesters || 6;
  const semesters = Array.from({ length: totalSems }, (_, i) => `${i + 1}`);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.gtu} />
      <View style={[styles.header, { backgroundColor: boardColor || Colors.gtu }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{branch}</Text>
        <Text style={styles.headerSub}>Select semester</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.semGrid}>
          {semesters.map((sem) => (
            <TouchableOpacity
              key={sem}
              style={[styles.semCard, { borderColor: Colors.gtu + '40' }]}
              onPress={() => navigation.navigate('SelectSubject', { board, branch, semester: sem, boardColor })}
              activeOpacity={0.85}
            >
              <Text style={[styles.semNum, { color: boardColor || Colors.gtu }]}>{sem}</Text>
              <Text style={styles.semLabel}>Semester</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── SELECT SUBJECT ───────────────────────────────────────────────────────────
export function SelectSubjectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, classLevel, stream, branch, semester, boardColor } = route.params;
  const { universities } = useData();

  const uni = universities.find(u => u.name === board || u.id === board.toLowerCase());

  let subjects = [];
  if (board === 'GTU') {
    const key = `${branch}_${semester}`;
    subjects = uni?.subjects?.[key] || [];
  } else if (classLevel === '12th' && stream) {
    const key = `${classLevel}_${stream}`;
    subjects = uni?.subjects?.[key] || [];
  } else {
    subjects = uni?.subjects?.[classLevel] || [];
  }

  const subtitle = board === 'GTU'
    ? `${branch} • Sem ${semester}`
    : classLevel === '12th' ? `${classLevel} • ${stream}` : classLevel;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.primary} />
      <View style={[styles.header, { backgroundColor: boardColor || Colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{board}</Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No subjects found</Text>
            <Text style={styles.emptySub}>Contact admin to add subjects</Text>
          </View>
        ) : (
          subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[styles.card, { borderColor: (boardColor || Colors.primary) + '40' }]}
              onPress={() => navigation.navigate('Papers', {
                board, classLevel, stream, branch, semester, subject,
                title: subject, boardColor
              })}
              activeOpacity={0.85}
            >
              <Text style={styles.cardEmoji}>📝</Text>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: boardColor || Colors.primary, fontSize: 15 }]}>{subject}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: Spacing.md },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1.5, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  cardEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 22, color: Colors.textLight, fontWeight: '300' },
  semGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  semCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1.5, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    width: '45%', aspectRatio: 1,
  },
  semNum: { fontSize: 40, fontWeight: '800' },
  semLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});
