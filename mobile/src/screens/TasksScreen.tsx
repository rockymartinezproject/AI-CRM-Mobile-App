import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Checkbox, Chip, FAB } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchTasks } from '../store/slices/tasksSlice';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94A3B8',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export default function TasksScreen() {
  const dispatch = useAppDispatch();
  const { items: tasks, isLoading } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const renderTask = ({ item }: { item: typeof tasks[0] }) => (
    <Card style={[styles.card, item.ai_suggested && styles.aiCard]}>
      <Card.Content>
        <View style={styles.row}>
          <Checkbox status={item.status === 'done' ? 'checked' : 'unchecked'} />
          <View style={styles.info}>
            <Text style={[styles.title, item.status === 'done' && styles.done]}>
              {item.title}
            </Text>
            {item.related_name && (
              <Text style={styles.related}>Related: {item.related_name}</Text>
            )}
            <View style={styles.chipRow}>
              <Chip
                style={{ backgroundColor: PRIORITY_COLORS[item.priority] + '20' }}
                textStyle={{ color: PRIORITY_COLORS[item.priority], fontSize: 10 }}
              >
                {item.priority}
              </Chip>
              {item.ai_suggested && (
                <Chip style={{ backgroundColor: '#DBEAFE', marginLeft: 4 }} textStyle={{ color: '#2563EB', fontSize: 10 }}>
                  AI Suggested
                </Chip>
              )}
            </View>
          </View>
          <Text style={styles.due}>
            {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No date'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchTasks())}
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
  aiCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  done: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  related: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  due: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#F59E0B',
  },
});
