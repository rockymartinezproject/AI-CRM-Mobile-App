import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Title, Paragraph, Text, List, Divider, Button } from 'react-native-paper';

export default function AboutScreen() {
  const appVersion = '1.0.0';
  const buildNumber = '2024.06.10';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>AI</Text>
        </View>
        <Title style={styles.appName}>AI CRM</Title>
        <Paragraph style={styles.tagline}>
          Intelligent Customer Relationship Management
        </Paragraph>
        <Text style={styles.version}>Version {appVersion} ({buildNumber})</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>About</Title>
          <Paragraph style={styles.description}>
            AI CRM is a full-stack intelligent customer relationship management platform 
            that leverages OpenAI's LLM capabilities to automate lead scoring, generate 
            personalized outreach, and provide real-time conversation insights.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Core Features</Title>
          {[
            { icon: 'brain', title: 'Smart Lead Scoring', desc: 'OpenAI API analyzes lead data to auto-prioritize prospects' },
            { icon: 'email-edit', title: 'AI Email/SMS Composer', desc: 'Generates context-aware follow-ups based on conversation history' },
            { icon: 'microphone', title: 'Voice-to-Text Notes', desc: 'Whisper API transcribes meeting recordings into structured CRM entries' },
            { icon: 'alert', title: 'Predictive Churn Alerts', desc: 'GPT-4 identifies at-risk accounts from interaction patterns' },
            { icon: 'magnify', title: 'Intelligent Search', desc: 'Natural language queries across contacts, deals, and tasks' },
          ].map((feature, index) => (
            <View key={index}>
              <List.Item
                title={feature.title}
                description={feature.desc}
                titleStyle={styles.featureTitle}
                descriptionStyle={styles.featureDesc}
                left={props => <List.Icon {...props} icon={feature.icon} color="#2563EB" />}
              />
              {index < 4 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Tech Stack</Title>
          <View style={styles.techRow}>
            <View style={styles.techCol}>
              <Text style={styles.techHeader}>Mobile</Text>
              <Text style={styles.techItem}>React Native (Expo)</Text>
              <Text style={styles.techItem}>TypeScript</Text>
              <Text style={styles.techItem}>Redux Toolkit</Text>
              <Text style={styles.techItem}>React Native Paper</Text>
            </View>
            <View style={styles.techCol}>
              <Text style={styles.techHeader}>Backend</Text>
              <Text style={styles.techItem}>Django 4.2 + DRF</Text>
              <Text style={styles.techItem}>PostgreSQL + Redis</Text>
              <Text style={styles.techItem}>Celery + OpenAI API</Text>
              <Text style={styles.techItem}>JWT Authentication</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Open Source</Title>
          <Paragraph style={styles.description}>
            Built with open-source technologies. Powered by OpenAI GPT-4, Whisper, and Embeddings APIs.
          </Paragraph>
          <Button
            mode="outlined"
            onPress={() => openLink('https://github.com/rockymartinezproject/AI-CRM-Mobile-App')}
            style={styles.githubButton}
            icon="github"
          >
            View on GitHub
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.footer}>
        © 2024 AI CRM. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 28,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  tagline: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  version: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    marginLeft: 56,
  },
  techRow: {
    flexDirection: 'row',
    gap: 24,
  },
  techCol: {
    flex: 1,
  },
  techHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  techItem: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  githubButton: {
    marginTop: 12,
    borderColor: '#2563EB',
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 24,
  },
});
