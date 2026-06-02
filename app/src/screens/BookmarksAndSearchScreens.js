// src/screens/BookmarksScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { useData } from '../context/DataContext';

export function BookmarksScreen() {
  const { bookmarks, toggleBookmark } = useData();

  const boardColors = { CBSE: Colors.cbse, GSEB: Colors.gseb, GTU: Colors.gtu };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks 🔖</Text>
        <Text style={styles.headerSub}>{bookmarks.length} saved paper{bookmarks.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: boardColors[item.board] || Colors.primary }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  <View style={[styles.boardBadge, { backgroundColor: (boardColors[item.board] || Colors.primary) + '15' }]}>
                    <Text style={[styles.boardBadgeText, { color: boardColors[item.board] || Colors.primary }]}>{item.board}</Text>
                  </View>
                  <Text style={styles.yearText}>{item.year}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleBookmark(item)}>
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.viewBtn, { borderColor: boardColors[item.board] || Colors.primary }]}
                onPress={() => Linking.openURL(item.viewLink)}
              >
                <Text style={[styles.viewBtnText, { color: boardColors[item.board] || Colors.primary }]}>👁 View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: boardColors[item.board] || Colors.primary }]}
                onPress={() => Linking.openURL(item.downloadLink)}
              >
                <Text style={styles.downloadBtnText}>⬇ Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyText}>No bookmarks yet</Text>
            <Text style={styles.emptySub}>Tap the bookmark icon on any paper to save it here</Text>
          </View>
        )}
      />
    </View>
  );
}

// ─── SEARCH SCREEN ────────────────────────────────────────────────────────────
export function SearchScreen() {
  const navigation = useNavigation();
  const { searchPapers, addRecentlyViewed } = useData();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const boardColors = { CBSE: Colors.cbse, GSEB: Colors.gseb, GTU: Colors.gtu };

  const handleSearch = (text) => {
    setQuery(text);
    setResults(text.length >= 2 ? searchPapers(text) : []);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search 🔍</Text>
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={styles.searchInput}
              onPress={() => {}}
            />
          </View>
        </View>
        {/* React Native TextInput */}
        <SearchInput onSearch={handleSearch} />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: boardColors[item.board] || Colors.primary }]}
            onPress={() => {
              addRecentlyViewed(item);
              navigation.navigate('Papers', {
                board: item.board,
                classLevel: item.classLevel,
                stream: item.stream,
                branch: item.branch,
                semester: item.semester,
                subject: item.subject,
                title: item.subject,
              });
            }}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.boardBadge, { backgroundColor: (boardColors[item.board] || Colors.primary) + '15' }]}>
                <Text style={[styles.boardBadgeText, { color: boardColors[item.board] || Colors.primary }]}>{item.board}</Text>
              </View>
              <Text style={styles.yearText}>{item.year} • {item.subject}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{query.length >= 2 ? '📭' : '🔍'}</Text>
            <Text style={styles.emptyText}>{query.length >= 2 ? 'No results found' : 'Start typing to search'}</Text>
            <Text style={styles.emptySub}>{query.length >= 2 ? 'Try different keywords' : 'Search by subject, board, or year'}</Text>
          </View>
        )}
      />
    </View>
  );
}

function SearchInput({ onSearch }) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={styles.realSearchInput}
      placeholder="Search subject, board, year..."
      placeholderTextColor={Colors.textLight}
      onChangeText={onSearch}
      autoFocus={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: Spacing.md },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 12 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { color: '#fff' },
  realSearchInput: {
    backgroundColor: '#fff', borderRadius: BorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    color: Colors.text, marginTop: 8,
  },
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderLeftWidth: 4,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  boardBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full },
  boardBadgeText: { fontSize: 11, fontWeight: '700' },
  yearText: { fontSize: 12, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  viewBtn: { flex: 1, borderWidth: 1.5, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: 'center' },
  viewBtnText: { fontSize: 14, fontWeight: '600' },
  downloadBtn: { flex: 1, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: 'center' },
  downloadBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 32 },
});
