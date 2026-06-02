// src/screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, StatusBar, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { useData } from '../context/DataContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { recentlyViewed, searchPapers, universities } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setSearchResults(searchPapers(text));
    } else {
      setSearchResults([]);
    }
  };

  const boards = [
    { id: 'CBSE', label: 'CBSE', sub: 'All India Board', emoji: '🎓', color: Colors.cbse, bg: '#E8F0FE' },
    { id: 'GSEB', label: 'GSEB', sub: 'Gujarat Board', emoji: '📚', color: Colors.gseb, bg: '#E6F4EA' },
    { id: 'GTU', label: 'GTU Diploma', sub: 'Gujarat Tech University', emoji: '🏛️', color: Colors.gtu, bg: '#FFF3E0' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PaperHub 📄</Text>
          <Text style={styles.headerSub}>Find question papers instantly</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search subject, board, year..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults.slice(0, 5)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('Papers', { filter: item, title: item.subject })}
              >
                <Text style={styles.searchResultTitle}>{item.title}</Text>
                <Text style={styles.searchResultMeta}>{item.board} • {item.year}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Ad Banner */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Ad Space – Google AdSense</Text>
        </View>

        {/* Board Selection */}
        <Text style={styles.sectionLabel}>Select Your Board</Text>
        <View style={styles.boardGrid}>
          {boards.map(board => (
            <TouchableOpacity
              key={board.id}
              style={[styles.boardCard, { backgroundColor: board.bg, borderColor: board.color + '30' }]}
              onPress={() => navigation.navigate('SelectClass', { board: board.id, boardColor: board.color })}
              activeOpacity={0.85}
            >
              <Text style={styles.boardEmoji}>{board.emoji}</Text>
              <Text style={[styles.boardName, { color: board.color }]}>{board.label}</Text>
              <Text style={styles.boardSub}>{board.sub}</Text>
              <View style={[styles.boardArrow, { backgroundColor: board.color }]}>
                <Text style={styles.boardArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionLabel}>Recently Viewed</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recentlyViewed.slice(0, 6)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('Papers', { filter: item, title: item.subject })}
                >
                  <Text style={styles.recentBoard}>{item.board}</Text>
                  <Text style={styles.recentTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.recentYear}>{item.year}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  searchContainer: {
    backgroundColor: Colors.primary,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  clearBtn: { fontSize: 16, color: Colors.textLight, paddingLeft: 8 },
  searchResults: {
    backgroundColor: '#fff',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 100,
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
  },
  searchResultItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  searchResultMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  adBanner: {
    backgroundColor: '#FFF9C4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F9A825',
  },
  adText: { color: '#F57F17', fontSize: 12, fontWeight: '500' },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  boardGrid: { gap: Spacing.md },
  boardCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  boardEmoji: { fontSize: 32, marginBottom: 8 },
  boardName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  boardSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  boardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardArrowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  recentSection: { marginTop: Spacing.xl },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.md,
    width: 150,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  recentBoard: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  recentTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, lineHeight: 18 },
  recentYear: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});
