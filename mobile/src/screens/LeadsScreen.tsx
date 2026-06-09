import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, Searchbar, FAB, Menu, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchLeads } from '../store/slices/leadsSlice';

const STATUS_COLORS: Record<string, string> = {
  new: '#3B82F6',
  contacted: '#8B5CF6',
  qualified: '#10B981',
  proposal: '#F59E0B',
  negotiation: '#F97316',
  won: '#059669',
  lost: '#EF4444',
  archived: '#94A3B8',
};

const PRIORITY_COLORS: Record<number, string> = {
  0: '#94A3B8',
  1: '#F59E0B',
  2: '#EF4444',
};

export default function LeadsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items: leads, isLoading } = useAppSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchLeads({ search: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  const renderLead = ({ item }: { item: typeof leads[0] }) => (
    <TouchableOpacity onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.company}>{item.company || 'No company'}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={styles.badges}>
              <Chip
                style={{ backgroundColor: STATUS_COLORS[item.status] + '20' }}
                textStyle={{ color: STATUS_COLORS[item.status], fontSize: 10 }}
              >
                {item.status}
              </Chip>
              {item.ai_score !== null && (
                <Chip
                  style={{ backgroundColor: '#2563EB20', marginTop: 4 }}
                  textStyle={{ color: '#2563EB', fontSize: 10 }}
                >
                  AI {item.ai_score}
                </Chip>
              )}
              {item.ai_churn_risk !== null && item.ai_churn_risk > 50 && (
                <Chip
                  style={{ backgroundColor: '#EF444420', marginTop: 4 }}
                  textStyle={{ color: '#EF4444', fontSize: 10 }}
                >
                  Risk {item.ai_churn_risk}
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search leads..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button onPress={() => setMenuVisible(true)} mode="outlined" compact>
              {statusFilter || 'All Statuses'}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setStatusFilter(null); setMenuVisible(false); }} title="All" />
          <Menu.Item onPress={() => { setStatusFilter('new'); setMenuVisible(false); }} title="New" />
          <Menu.Item onPress={() => { setStatusFilter('contacted'); setMenuVisible(false); }} title="Contacted" />
          <Menu.Item onPress={() => { setStatusFilter('qualified'); setMenuVisible(false); }} title="Qualified" />
          <Menu.Item onPress={() => { setStatusFilter('proposal'); setMenuVisible(false); }} title="Proposal" />
        </Menu>
      </View>

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={renderLead}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchLeads())}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="Add Lead"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchbar: {
    margin: 12,
    borderRadius: 8,
  },
  filterRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 12,
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
  company: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badges: {
    alignItems: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2563EB',
  },
});
