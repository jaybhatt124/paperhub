// src/screens/SelectClassScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { useData } from '../context/DataContext';

export default function SelectClassScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, boardColor } = route.params;
  const { universities } = useData();

  const uni = universities.find(u => u.name === board || u.id === board.toLowerCase());

  const handleSelect = (classLevel) => {
    if (board === 'GTU') {
      navigation.navigate('SelectBranch', { board, boardColor });
    } else {
      if (classLevel === '12th') {
        navigation.navigate('SelectStream', { board, classLevel, boardColor });
      } else {
        navigation.navigate('SelectSubject', { board, classLevel, boardColor });
      }
    }
  };

  const classes = uni?.classes || (board === 'GTU' ? ['Diploma'] : ['10th', '12th']);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.primary} />
      <View style={[styles.header, { backgroundColor: boardColor || Colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{board}</Text>
        <Text style={styles.headerSub}>Select your class</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Select Class</Text>
        <View style={styles.grid}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={[styles.card, { borderColor: (boardColor || Colors.primary) + '40' }]}
              onPress={() => handleSelect(cls)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardEmoji}>{cls === '10th' ? '📗' : cls === '12th' ? '📘' : '🏫'}</Text>
              <Text style={[styles.cardTitle, { color: boardColor || Colors.primary }]}>{cls}</Text>
              <Text style={styles.cardSub}>
                {cls === '10th' ? 'Secondary' : cls === '12th' ? 'Higher Secondary' : 'Diploma Program'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 50, paddingBottom: 24, paddingHorizontal: Spacing.md,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  scroll: { padding: Spacing.md },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  grid: { gap: Spacing.md },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 20, fontWeight: '800', flex: 1 },
  cardSub: { fontSize: 12, color: Colors.textSecondary },
});
