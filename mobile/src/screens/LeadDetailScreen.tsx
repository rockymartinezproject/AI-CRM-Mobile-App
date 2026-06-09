import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Chip, Button, Divider, Avatar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchLeadDetail } from '../store/slices/leadsSlice';
import { getChurnPrediction } from '../store/slices/aiSlice';

export default function LeadDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { leadId } = route.params;
  const { selectedLead: lead } = useAppSelector((state) => state.leads);
  const { churnPrediction } = useAppSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchLeadDetail(leadId));
  }, [dispatch, leadId]);

  if (!lead) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Avatar.Text
              size={60}
              label={lead.first_name[0] + lead.last_name[0]}
              style={{ backgroundColor: '#2563EB' }}
            />
            <View style={styles.headerInfo}>
              <Title style={styles.name}>{lead.full_name}</Title>
              <Text style={styles.company}>{lead.company || 'No company'}</Text>
              <Text style={styles.email}>{lead.email}</Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            <Chip style={styles.chip}>{lead.status}</Chip>
            <Chip style={styles.chip}>{lead.source}</Chip>
            {lead.ai_score !== null && (
              <Chip style={[styles.chip, { backgroundColor: '#DBEAFE' }]}>
                AI Score: {lead.ai_score}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>AI Insights</Title>
          {lead.ai_score_reasoning ? (
            <Paragraph>{lead.ai_score_reasoning}</Paragraph>
          ) : (
            <Paragraph style={styles.muted}>No AI analysis yet. Tap below to generate.</Paragraph>
          )}

          {lead.ai_churn_risk !== null && (
            <View style={styles.riskRow}>
              <Text style={styles.riskLabel}>Churn Risk:</Text>
              <Text
                style={[
                  styles.riskValue,
                  { color: lead.ai_churn_risk > 70 ? '#EF4444' : lead.ai_churn_risk > 40 ? '#F59E0B' : '#10B981' },
                ]}
              >
                {lead.ai_churn_risk}%
              </Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={() => dispatch(getChurnPrediction(leadId))}
            style={{ marginTop: 12 }}
            icon="brain"
          >
            Analyze Churn Risk
          </Button>

          {churnPrediction && (
            <View style={styles.predictionBox}>
              <Text style={styles.predictionTitle}>Prediction Results</Text>
              <Text>Risk: {churnPrediction.churn_risk}%</Text>
              <Text>Risk Factors: {churnPrediction.risk_factors?.join(', ')}</Text>
              <Text>Recommended Actions:</Text>
              {churnPrediction.recommended_actions?.map((action: string, i: number) => (
                <Text key={i} style={styles.bullet}>• {action}</Text>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Contact Info</Title>
          <Divider style={styles.divider} />
          <InfoRow label="Phone" value={lead.phone || '-'} />
          <InfoRow label="Job Title" value={lead.job_title || '-'} />
          <InfoRow label="Last Contact" value={lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString() : 'Never'} />
          <InfoRow label="Next Follow-up" value={lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : 'Not scheduled'} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Notes</Title>
          <Paragraph>{lead.notes || 'No notes added.'}</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.actionRow}>
        <Button
          mode="contained"
          icon="send"
          onPress={() => navigation.navigate('Compose', { leadId })}
          style={[styles.actionButton, { backgroundColor: '#2563EB' }]}
        >
          AI Compose
        </Button>
        <Button
          mode="contained"
          icon="microphone"
          onPress={() => {}}
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
        >
          Voice Note
        </Button>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 22,
  },
  company: {
    fontSize: 14,
    color: '#64748B',
  },
  email: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  divider: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  infoValue: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '500',
  },
  muted: {
    color: '#94A3B8',
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  riskLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  riskValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictionBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  predictionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E293B',
  },
  bullet: {
    marginLeft: 8,
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
});
