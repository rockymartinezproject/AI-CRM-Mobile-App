import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Avatar, Badge, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchLeads } from '../store/slices/leadsSlice';
import { fetchDeals } from '../store/slices/dealsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: leads } = useAppSelector((state) => state.leads);
  const { items: deals } = useAppSelector((state) => state.deals);
  const { items: tasks } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchLeads());
    dispatch(fetchDeals());
    dispatch(fetchTasks());
  }, [dispatch]);

  const hotLeads = leads.filter((l) => (l.ai_score || 0) >= 70).length;
  const totalDealsValue = deals.reduce((sum, d) => sum + parseFloat(d.value || '0'), 0);
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const churnAlerts = leads.filter((l) => (l.ai_churn_risk || 0) > 70).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.first_name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AISearch')}>
          <Avatar.Icon size={48} icon="magnify" style={{ backgroundColor: '#2563EB' }} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
          <Card.Content>
            <Text style={styles.statNumber}>{leads.length}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Card.Content>
            <Text style={styles.statNumber}>${(totalDealsValue / 1000).toFixed(0)}k</Text>
            <Text style={styles.statLabel}>Pipeline</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Card.Content>
            <View style={styles.badgeRow}>
              <Text style={styles.statNumber}>{hotLeads}</Text>
              {hotLeads > 0 && <Badge size={16} style={styles.badge}>AI</Badge>}
            </View>
            <Text style={styles.statLabel}>Hot Leads</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
          <Card.Content>
            <View style={styles.badgeRow}>
              <Text style={styles.statNumber}>{churnAlerts}</Text>
              {churnAlerts > 0 && <Badge size={16} style={[styles.badge, { backgroundColor: '#EF4444' }]}>!</Badge>}
            </View>
            <Text style={styles.statLabel}>Churn Alerts</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Pending Tasks</Title>
          <Paragraph>{pendingTasks} tasks awaiting action</Paragraph>
          <ProgressBar progress={pendingTasks > 0 ? 0.3 : 0} color="#2563EB" style={styles.progress} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>AI Insights</Title>
          {churnAlerts > 0 ? (
            <View style={styles.insightRow}>
              <Avatar.Icon size={32} icon="alert" style={{ backgroundColor: '#FEF3C7' }} color="#F59E0B" />
              <Text style={styles.insightText}>
                {churnAlerts} leads at risk of churning. Review recommended actions.
              </Text>
            </View>
          ) : (
            <View style={styles.insightRow}>
              <Avatar.Icon size={32} icon="check-circle" style={{ backgroundColor: '#D1FAE5' }} color="#10B981" />
              <Text style={styles.insightText}>All leads are healthy. Great job!</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#2563EB',
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  progress: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  insightText: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
  },
});
