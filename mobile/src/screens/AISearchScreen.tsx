import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Card, Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store';
import { searchNaturalLanguage, clearAIResults } from '../store/slices/aiSlice';

export default function AISearchScreen() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const { searchResults, parsedQuery, isLoading } = useAppSelector((state) => state.ai);

  const handleSearch = () => {
    if (query.trim()) {
      dispatch(searchNaturalLanguage(query));
    }
  };

  const renderResult = ({ item }: { item: any }) => (
    <Card style={styles.resultCard}>
      <Card.Content>
        <Text style={styles.resultTitle}>
          {item.full_name || item.name || item.title || 'Unknown'}
        </Text>
        <Text style={styles.resultMeta}>
          {item.company || item.stage || item.status || ''}
        </Text>
        {item.ai_score !== null && (
          <Chip style={{ backgroundColor: '#DBEAFE', alignSelf: 'flex-start', marginTop: 4 }} textStyle={{ color: '#2563EB', fontSize: 10 }}>
            AI Score: {item.ai_score}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Ask anything... (e.g., 'Show me hot leads from last week')"
        onChangeText={setQuery}
        value={query}
        onSubmitEditing={handleSearch}
        style={styles.searchbar}
      />

      <Button
        mode="contained"
        onPress={handleSearch}
        loading={isLoading}
        disabled={isLoading || !query.trim()}
        style={styles.searchButton}
        icon="magnify"
      >
        AI Search
      </Button>

      {parsedQuery && (
        <Card style={styles.parseCard}>
          <Card.Content>
            <Text style={styles.parseTitle}>Query Interpretation</Text>
            <Text style={styles.parseText}>
              Entity: <Text style={styles.parseHighlight}>{parsedQuery.entity}</Text>
            </Text>
            <Text style={styles.parseText}>
              Filters:{' '}
              <Text style={styles.parseHighlight}>
                {JSON.stringify(parsedQuery.filters || {})}
              </Text>
            </Text>
            <Text style={styles.parseText}>
              Sort by: <Text style={styles.parseHighlight}>{parsedQuery.sort_by || 'default'}</Text>
            </Text>
          </Card.Content>
        </Card>
      )}

      {isLoading && <ActivityIndicator style={styles.loader} color="#2563EB" />}

      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderResult}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading && query ? (
            <Text style={styles.empty}>No results found. Try a different query.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  searchbar: {
    borderRadius: 8,
    marginBottom: 12,
  },
  searchButton: {
    marginBottom: 12,
    backgroundColor: '#2563EB',
  },
  parseCard: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  parseTitle: {
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  parseText: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 4,
  },
  parseHighlight: {
    fontWeight: '600',
    color: '#2563EB',
  },
  loader: {
    marginVertical: 24,
  },
  list: {
    paddingBottom: 24,
  },
  resultCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  resultMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 24,
  },
});
