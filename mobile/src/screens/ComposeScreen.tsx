import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Clipboard } from 'react-native';
import { Card, Title, Paragraph, Text, Button, SegmentedButtons, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store';
import { composeFollowUp } from '../store/slices/aiSlice';

export default function ComposeScreen() {
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const { leadId } = route.params;
  const { composeResult, isLoading } = useAppSelector((state) => state.ai);
  const [channel, setChannel] = useState('email');
  const [tone, setTone] = useState('professional');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleCompose = () => {
    dispatch(composeFollowUp({ leadId, channel, tone }));
  };

  const handleCopy = () => {
    if (composeResult?.body) {
      Clipboard.setString(composeResult.body);
      setSnackbarVisible(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>AI Email/SMS Composer</Title>
          <Paragraph style={styles.subtitle}>
            Generate context-aware follow-ups based on conversation history and tone analysis.
          </Paragraph>

          <Text style={styles.label}>Channel</Text>
          <SegmentedButtons
            value={channel}
            onValueChange={setChannel}
            buttons={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
            ]}
            style={styles.segment}
          />

          <Text style={styles.label}>Tone</Text>
          <SegmentedButtons
            value={tone}
            onValueChange={setTone}
            buttons={[
              { value: 'professional', label: 'Professional' },
              { value: 'friendly', label: 'Friendly' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            style={styles.segment}
          />

          <Button
            mode="contained"
            onPress={handleCompose}
            loading={isLoading}
            disabled={isLoading}
            style={styles.composeButton}
            icon="auto-fix"
          >
            Generate Message
          </Button>
        </Card.Content>
      </Card>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loaderText}>AI is crafting your message...</Text>
        </View>
      )}

      {composeResult && (
        <Card style={[styles.card, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
          <Card.Content>
            <Title>Generated Message</Title>

            {composeResult.subject && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Subject</Text>
                <Text style={styles.fieldValue}>{composeResult.subject}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Body</Text>
              <Text style={styles.messageBody}>{composeResult.body}</Text>
            </View>

            {composeResult.personalization_notes && (
              <View style={[styles.field, { backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8 }]}>
                <Text style={[styles.fieldLabel, { color: '#059669' }]}>Why this message fits</Text>
                <Text style={{ color: '#475569' }}>{composeResult.personalization_notes}</Text>
              </View>
            )}

            <Button mode="outlined" onPress={handleCopy} icon="content-copy" style={{ marginTop: 12 }}>
              Copy to Clipboard
            </Button>
          </Card.Content>
        </Card>
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Copied to clipboard!
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  segment: {
    marginBottom: 16,
  },
  composeButton: {
    backgroundColor: '#2563EB',
    marginTop: 8,
  },
  loader: {
    alignItems: 'center',
    marginVertical: 32,
  },
  loaderText: {
    marginTop: 12,
    color: '#64748B',
  },
  field: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  messageBody: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
  },
});
