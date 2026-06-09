import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ProgressBar, Chip, FAB } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchDeals } from '../store/slices/dealsSlice';

const STAGE_COLORS: Record<string, string> = {
  prospecting: '#94A3B8',
  qualification: '#3B82F6',
  needs_analysis: '#8B5CF6',
  value_proposition: '#06B6D4',
  id_decision_makers: '#F59E0B',
  proposal: '#F97316',
  negotiation: '#EF4444',
  closed_won: '#10B981',
  closed_lost: '#64748B',
};

export default function DealsScreen() {
  const dispatch = useAppDispatch();
  const { items: deals, isLoading } = useAppSelector((state) => state.deals);

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  const renderDeal = ({ item }: { item: typeof deals[0] }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.value}>${parseFloat(item.value || '0').toLocaleString()}</Text>
            <View style={styles.chipRow}>
              <Chip
                style={{ backgroundColor: STAGE_COLORS[item.stage] + '20' }}
                textStyle={{ color: STAGE_COLORS[item.stage], fontSize: 10 }}
              >
                {item.stage}
              </Chip>
              {item.ai_win_probability !== null && (
                <Chip style={{ backgroundColor: '#DBEAFE', marginLeft: 4 }} textStyle={{ color: '#2563EB', fontSize: 10 }}>
                  AI Win: {item.ai_win_probability}%
                </Chip>
              )}
            </View>
          </View>
          <View style={styles.probCol}>
            <Text style={styles.probText}>{item.probability}%</Text>
            <ProgressBar
              progress={item.probability / 100}
              color={STAGE_COLORS[item.stage]}
              style={styles.progress}
            />
          </View>
        </View>
        {item.ai_next_best_action ? (
          <Text style={styles.aiAction}>Next: {item.ai_next_best_action}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={renderDeal}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchDeals())}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    padding: 12,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  probCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 60,
  },
  probText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  progress: {
    width: 60,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  aiAction: {
    marginTop: 8,
    fontSize: 12,
    color: '#2563EB',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2563EB',
  },
});
