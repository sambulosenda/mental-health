import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/components/ui';
import { colors, darkColors, spacing, borderRadius } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

interface ContactPickerProps {
  onSelect: (contacts: Contact[]) => void;
  onClose: () => void;
}

export function ContactPicker({ onSelect, onClose }: ContactPickerProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.phoneNumber.includes(query)
        )
      );
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to contacts to invite friends.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const contactsWithPhone: Contact[] = data
        .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => ({
          id: c.id!,
          name: c.name || 'Unknown',
          phoneNumber: c.phoneNumbers![0].number || '',
        }));

      setContacts(contactsWithPhone);
      setFilteredContacts(contactsWithPhone);
    } catch {
      Alert.alert('Error', 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = useCallback((id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSend = () => {
    const selected = contacts.filter((c) => selectedContacts.has(c.id));
    onSelect(selected);
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.has(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          { borderBottomColor: themeColors.border },
        ]}
        onPress={() => toggleContact(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected ? themeColors.primary : themeColors.textMuted,
              backgroundColor: isSelected ? themeColors.primary : 'transparent',
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text variant="bodyMedium" color="textPrimary">
            {item.name}
          </Text>
          <Text variant="caption" color="textSecondary">
            {item.phoneNumber}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" color="textPrimary" style={styles.title}>
          Select Contacts
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: themeColors.surface }]}>
        <Ionicons name="search" size={20} color={themeColors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.textPrimary }]}
          placeholder="Search contacts..."
          placeholderTextColor={themeColors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text variant="body" color="textSecondary">
            Loading contacts...
          </Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="body" color="textSecondary">
            {searchQuery ? 'No contacts found' : 'No contacts with phone numbers'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleSend}
          disabled={selectedContacts.size === 0}
        >
          {selectedContacts.size === 0
            ? 'Select contacts'
            : `Invite ${selectedContacts.size} contact${selectedContacts.size > 1 ? 's' : ''}`}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
