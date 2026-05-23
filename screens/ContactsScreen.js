import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

// Mock contacts database
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

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [trustedContacts, setTrustedContacts] = useState([]);
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Selection Mode State
  const [isSelecting, setIsSelecting] = useState(false);
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    loadTrustedContacts();
  }, []);

  const loadTrustedContacts = async () => {
    try {
      const data = await AsyncStorage.getItem('trustedContacts');
      if (data) {
        setTrustedContacts(JSON.parse(data));
      }
    } catch (e) {
      console.log('Error loading trusted contacts:', e);
    }
  };

  const isTrusted = (contactId) => {
    return trustedContacts.some((tc) => tc.id === contactId);
  };

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleSelection = (contact) => {
    const isSelected = tempSelected.some((t) => t.id === contact.id);
    if (isSelected) {
      setTempSelected(tempSelected.filter((t) => t.id !== contact.id));
    } else {
      if (tempSelected.length >= 5) {
        Alert.alert('Limit Reached', 'You can only select up to 5 trusted contacts.');
        return;
      }
      setTempSelected([...tempSelected, contact]);
    }
  };

  const saveTrustedContacts = async () => {
    setTrustedContacts(tempSelected);
    await AsyncStorage.setItem('trustedContacts', JSON.stringify(tempSelected));
    setIsSelecting(false);
  };

  const renderContactItem = ({ item }) => {
    const trusted = isSelecting
      ? tempSelected.some((t) => t.id === item.id)
      : isTrusted(item.id);

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelecting && trusted && styles.selectedContactItem]}
        onPress={() => {
          if (isSelecting) {
            toggleSelection(item);
          } else {
            Alert.alert(
              'Call Contact',
              `Call ${item.name} at ${item.phone}?`,
              [
                { text: 'Cancel', onPress: () => { } },
                {
                  text: 'Call',
                  onPress: () => {
                    Alert.alert('Success', `Calling ${item.name}...`);
                  },
                },
              ]
            );
          }
        }}
        activeOpacity={0.7}
      >
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
        <View style={styles.contactActions}>
          {isSelecting ? (
            <Ionicons
              name={trusted ? 'checkbox' : 'square-outline'}
              size={24}
              color={trusted ? THEME_COLOR : '#CCCCCC'}
            />
          ) : (
            <>
              {trusted && (
                <View style={styles.trustedBadge}>
                  <Ionicons name="star" size={18} color={THEME_COLOR} />
                </View>
              )}
              <View style={styles.callButton}>
                <Ionicons name="call" size={20} color={THEME_COLOR} />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={THEME_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('TrustedContacts')}
            style={styles.trustedButtonHeader}
          >
            <Ionicons name="person-add" size={22} color={THEME_COLOR} />
          </TouchableOpacity>
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

        {/* Top Layer - Trusted Contacts Display */}
        {!isSelecting && trustedContacts.length > 0 && (
          <View style={styles.topLayerContainer}>
            <View style={styles.topLayerHeader}>
              <Text style={styles.topLayerTitle}>My Trusted Contacts</Text>
              <TouchableOpacity
                onPress={() => {
                  setTempSelected(trustedContacts);
                  setIsSelecting(true);
                }}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={16} color={THEME_COLOR} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trustedScroll}>
              {trustedContacts.map(tc => (
                <View key={tc.id} style={styles.trustedCard}>
                  <View style={styles.trustedAvatarSmall}>
                    <Text style={styles.avatarTextSmall}>{tc.name[0]}</Text>
                  </View>
                  <Text style={styles.trustedNameSmall} numberOfLines={1}>{tc.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {isSelecting && (
          <View style={styles.selectionInfoBox}>
            <Ionicons name="information-circle" size={20} color={THEME_COLOR} />
            <Text style={styles.selectionInfoText}>Select up to 5 trusted contacts to be notified in emergencies.</Text>
          </View>
        )}
      </View>

      {/* Contacts List */}
      <View style={styles.listContainer}>
        {filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}
      </View>

      {/* Bottom Action */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isSelecting ? (
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.cancelSelectionButton}
              onPress={() => setIsSelecting(false)}
            >
              <Text style={styles.cancelSelectionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveTrustedButton}
              onPress={saveTrustedContacts}
            >
              <Text style={styles.saveTrustedText}>Trusted Contact ({tempSelected.length}/5)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setTempSelected(trustedContacts);
              setIsSelecting(true);
            }}
          >
            <Ionicons name="add" size={24} color={THEME_COLOR} />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  trustedButtonHeader: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  topLayerContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  topLayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topLayerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLOR,
    marginLeft: 4,
  },
  trustedScroll: {
    flexDirection: 'row',
  },
  trustedCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  trustedAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarTextSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  trustedNameSmall: {
    fontSize: 11,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectionInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectionInfoText: {
    fontSize: 12,
    color: THEME_COLOR,
    marginLeft: 8,
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedContactItem: {
    backgroundColor: '#FFF5F5',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  contactRelation: {
    fontSize: 12,
    color: THEME_COLOR,
    marginTop: 2,
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustedBadge: {
    padding: 4,
  },
  callButton: {
    padding: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
    marginLeft: 8,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelSelectionButton: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cancelSelectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  saveTrustedButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: THEME_COLOR,
  },
  saveTrustedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
