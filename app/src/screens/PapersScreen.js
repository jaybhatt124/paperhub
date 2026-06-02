// src/screens/PapersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Linking, Alert, Modal, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { useData } from '../context/DataContext';

export default function PapersScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { board, classLevel, stream, branch, semester, subject, title, boardColor } = route.params;
  const { getPapers, toggleBookmark, isBookmarked, addRecentlyViewed } = useData();

  const [selectedYear, setSelectedYear] = useState('');
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);
  const [adCountdown, setAdCountdown] = useState(3);

  const allPapers = getPapers({ board, classLevel, stream, branch, semester, subject });
  const years = [...new Set(allPapers.map(p => p.year))].sort((a, b) => b - a);
  const papers = selectedYear ? allPapers.filter(p => p.year === selectedYear) : allPapers;

  const handleView = (paper) => {
    addRecentlyViewed(paper);
    Linking.openURL(paper.viewLink);
  };

  const handleDownload = (paper) => {
    setPendingDownload(paper);
    setAdCountdown(3);
    setShowAdModal(true);
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipAd = () => {
    setShowAdModal(false);
    if (pendingDownload) {
      addRecentlyViewed(pendingDownload);
      Linking.openURL(pendingDownload.downloadLink);
    }
  };

  const renderPaper = ({ item }) => (
    <View style={[styles.paperCard, { borderLeftColor: boardColor || Colors.primary }]}>
      <View style={styles.paperTop}>
        <View style={styles.paperInfo}>
          <Text style={styles.paperTitle}>{item.title}</Text>
          <View style={styles.paperMeta}>
            <View style={[styles.yearBadge, { backgroundColor: (boardColor || Colors.primary) + '15' }]}>
              <Text style={[styles.yearText, { color: boardColor || Colors.primary }]}>{item.year}</Text>
            </View>
            <Text style={styles.paperSubject}>{item.subject}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleBookmark(item)}
          style={styles.bookmarkBtn}
        >
          <Text style={styles.bookmarkIcon}>{isBookmarked(item.id) ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paperActions}>
        <TouchableOpacity
          style={[styles.viewBtn, { borderColor: boardColor || Colors.primary }]}
          onPress={() => handleView(item)}
        >
          <Text style={[styles.viewBtnText, { color: boardColor || Colors.primary }]}>👁 View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.downloadBtn, { backgroundColor: boardColor || Colors.primary }]}
          onPress={() => handleDownload(item)}
        >
          <Text style={styles.downloadBtnText}>⬇ Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={boardColor || Colors.primary} />

      <View style={[styles.header, { backgroundColor: boardColor || Colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSub}>{board} • {allPapers.length} paper{allPapers.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Year Filter */}
      {years.length > 0 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedYear && styles.filterChipActive]}
            onPress={() => setSelectedYear('')}
          >
            <Text style={[styles.filterChipText, !selectedYear && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.filterChip, selectedYear === year && styles.filterChipActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.filterChipText, selectedYear === year && styles.filterChipTextActive]}>{year}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ad Banner */}
      <View style={styles.adBanner}>
        <Text style={styles.adText}>📢 Ad Space – Google AdSense</Text>
      </View>

      <FlatList
        data={papers}
        keyExtractor={item => item.id}
        renderItem={renderPaper}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No papers available yet</Text>
            <Text style={styles.emptySub}>Check back soon — we're adding more!</Text>
          </View>
        )}
      />

      {/* Interstitial Ad Modal */}
      <Modal visible={showAdModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.adLabel}>Advertisement</Text>
            <View style={styles.adPlaceholder}>
              <Text style={styles.adPlaceholderText}>📢 Ad Space</Text>
              <Text style={styles.adPlaceholderSub}>Google AdMob / AdSense</Text>
            </View>
            <TouchableOpacity
              style={[styles.skipBtn, adCountdown === 0 && styles.skipBtnActive]}
              onPress={adCountdown === 0 ? skipAd : null}
              disabled={adCountdown > 0}
            >
              <Text style={[styles.skipBtnText, adCountdown === 0 && styles.skipBtnTextActive]}>
                {adCountdown > 0 ? `Wait ${adCountdown}s...` : 'Skip & Download →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: Spacing.md },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, gap: 8, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  adBanner: {
    backgroundColor: '#FFF9C4', padding: 8,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F9A825',
  },
  adText: { color: '#F57F17', fontSize: 11, fontWeight: '500' },
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 100 },
  paperCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderLeftWidth: 4,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  paperTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  paperInfo: { flex: 1 },
  paperTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  paperMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  yearBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  yearText: { fontSize: 12, fontWeight: '700' },
  paperSubject: { fontSize: 12, color: Colors.textSecondary },
  bookmarkBtn: { padding: 4 },
  bookmarkIcon: { fontSize: 20 },
  paperActions: { flexDirection: 'row', gap: Spacing.sm },
  viewBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
  },
  viewBtnText: { fontSize: 14, fontWeight: '600' },
  downloadBtn: {
    flex: 1, borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
  },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: BorderRadius.xl,
    padding: Spacing.xl, width: '85%', alignItems: 'center',
  },
  adLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },
  adPlaceholder: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', width: '100%', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  adPlaceholderText: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  adPlaceholderSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  skipBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: BorderRadius.full, backgroundColor: Colors.border,
  },
  skipBtnActive: { backgroundColor: Colors.primary },
  skipBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  skipBtnTextActive: { color: '#fff' },
});
