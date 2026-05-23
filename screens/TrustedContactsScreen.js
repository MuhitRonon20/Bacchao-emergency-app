import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_COLOR = '#D30D0D';
const MAX_TRUSTED = 5;

const MOCK_CONTACTS = [
  { id: '1', name: 'Mom', phone: '+1234567890', relation: 'Mother' },
  { id: '2', name: 'Dad', phone: '+1234567891', relation: 'Father' },
  { id: '3', name: 'Sister', phone: '+1234567892', relation: 'Sister' },
  { id: '4', name: 'Best Friend', phone: '+1234567893', relation: 'Friend' },
  { id: '5', name: 'Colleague', phone: '+1234567894', relation: 'Colleague' },
  { id: '6', name: 'Neighbor', phone: '+1234567895', relation: 'Neighbor' },
  { id: '7', name: 'Doctor', phone: '+1234567896', relation: 'Doctor' },
  { id: '8', name: 'Brother', phone: '+1234567897', relation: 'Brother' },
];

export default function TrustedContactsScreen({ navigation }) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrustedContacts();
  }, []);

  const loadTrustedContacts = async () => {
    try {
      const data = await AsyncStorage.getItem('trustedContacts');
      if (data) {
        setSelectedContacts(JSON.parse(data));
      }
    } catch (e) {
      console.log('Error loading trusted contacts:', e);
    }
  };

  const toggleContact = (contact) => {
    const isSelected = selectedContacts.some((tc) => tc.id === contact.id);

    if (isSelected) {
      // Remove contact
      setSelectedContacts(selectedContacts.filter((tc) => tc.id !== contact.id));
    } else {
      // Add contact if under limit
      if (selectedContacts.length < MAX_TRUSTED) {
        setSelectedContacts([...selectedContacts, contact]);
      } else {
        Alert.alert(
          'Limit Reached',
          `You can only add maximum ${MAX_TRUSTED} trusted contacts.`
        );
      }
    }
  };

  const isSelected = (contactId) => {
    return selectedContacts.some((tc) => tc.id === contactId);
  };

  const handleSave = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one trusted contact');
      return;
    }

    setLoading(true);

    try {
      await AsyncStorage.setItem(
        'trustedContacts',
        JSON.stringify(selectedContacts)
      );
      setLoading(false);
      Alert.alert(
        'Success',
        `Saved ${selectedContacts.length} trusted contact(s)`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save trusted contacts');
    }
  };

  const filteredContacts = MOCK_CONTACTS.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContactItem = ({ item }) => {
    const selected = isSelected(item.id);

    return (
      <TouchableOpacity
        style={[styles.contactItem, selected && styles.contactItemSelected]}
        onPress={() => toggleContact(item)}
        activeOpacity={0.7}
      >
        <View style={styles.selectCheckbox}>
          {selected && (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactAvatar}>
            <Text style={styles.avatarText}>{item.name[0]}</Text>
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactRelation}>{item.relation}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={THEME_COLOR} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Trusted Contacts</Text>
            <Text style={styles.headerSubtitle}>
              {selectedContacts.length}/{MAX_TRUSTED} selected
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={THEME_COLOR} />
          <Text style={styles.infoText}>
            These contacts will be notified immediately when you send an SOS
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#CCCCCC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="#CCCCCC"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Selected Summary */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedTitle}>Selected Contacts:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedList}
          >
            {selectedContacts.map((contact) => (
              <View key={contact.id} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{contact.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleContact(contact)}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Ionicons name="close" size={14} color={THEME_COLOR} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contacts List */}
      <View style={styles.listContainer}>
        {filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (selectedContacts.length === 0 || loading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={selectedContacts.length === 0 || loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : `Save (${selectedContacts.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME_COLOR,
    marginTop: 2,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLOR,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#333333',
    marginLeft: 10,
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  selectedSummary: {
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  selectedList: {
    flexDirection: 'row',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 6,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  contactItemSelected: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1.5,
    borderColor: THEME_COLOR,
  },
  selectCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  contactRelation: {
    fontSize: 11,
    color: THEME_COLOR,
    marginTop: 2,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 0.8,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
});
