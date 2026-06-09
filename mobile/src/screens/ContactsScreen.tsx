import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Avatar, Searchbar, FAB } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchContacts } from '../store/slices/contactsSlice';

export default function ContactsScreen() {
  const dispatch = useAppDispatch();
  const { items: contacts, isLoading } = useAppSelector((state) => state.contacts);
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const filteredContacts = contacts.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item }: { item: typeof contacts[0] }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <Avatar.Text
            size={48}
            label={item.first_name[0] + item.last_name[0]}
            style={{ backgroundColor: '#10B981' }}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.company}>{item.company || 'No company'}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.ai_summary ? (
              <Text style={styles.aiSummary} numberOfLines={2}>
                AI: {item.ai_summary}
              </Text>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search contacts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchContacts())}
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
  searchbar: {
    margin: 12,
    borderRadius: 8,
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
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
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
  aiSummary: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 4,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#10B981',
  },
});
