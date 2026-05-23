import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

const MOCK_NEARBY_SERVICES = [
  {
    id: '1',
    name: 'Central Police Station',
    type: 'Police',
    distance: 0.8,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'City General Hospital',
    type: 'Hospital',
    distance: 1.2,
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Fire Station #5',
    type: 'Fire Station',
    distance: 1.5,
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Ambulance Service',
    type: 'Medical',
    distance: 0.5,
    rating: 4.6,
  },
];

export default function MapScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('nearby'); // nearby, emergencies
  const [emergencies, setEmergencies] = useState([]);
  const insets = useSafeAreaInsets();
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  useEffect(() => {
    loadEmergencies();

    // Refresh emergencies every 10 seconds
    const interval = setInterval(() => {
      loadEmergencies();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = async () => {
    try {
      const data = await AsyncStorage.getItem('emergencyAlerts');
      if (data) {
        const alerts = JSON.parse(data);
        // Filter active emergencies
        const active = alerts.filter((a) => a.status === 'active');
        setEmergencies(active);
      }
    } catch (e) {
      console.log('Error loading emergencies:', e);
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'Police':
        return 'shield';
      case 'Hospital':
        return 'hospital';
      case 'Fire Station':
        return 'flame';
      case 'Medical':
        return 'medical';
      default:
        return 'location';
    }
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => {
        Alert.alert(
          item.name,
          `Distance: ${item.distance} km\nRating: ${item.rating}/5\n\nCall ${item.name}?`,
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
      }}
    >
      <View style={styles.serviceIcon}>
        <Ionicons name={getServiceIcon(item.type)} size={24} color={THEME_COLOR} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceType}>{item.type}</Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.distance}>{item.distance} km away</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={THEME_COLOR} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
    </TouchableOpacity>
  );

  const renderEmergencyItem = ({ item }) => {
    const isSelected = selectedEmergency?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.emergencyCard, isSelected && styles.emergencyCardSelected]}
        onPress={() => setSelectedEmergency(item)}
        activeOpacity={0.7}
      >
        <View style={styles.emergencyCardIcon}>
          <Ionicons name="alert-circle" size={24} color={THEME_COLOR} />
        </View>
        <View style={styles.emergencyCardInfo}>
          <Text style={styles.emergencyCardTitle}>Emergency Alert</Text>
          <Text style={styles.emergencyCardLocation}>{item.location}</Text>
          <Text style={styles.emergencyCardTime}>{item.timestamp}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={THEME_COLOR} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Map & Services</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nearby' && styles.tabActive]}
          onPress={() => setActiveTab('nearby')}
        >
          <Ionicons name="location" size={18} color={activeTab === 'nearby' ? '#FFFFFF' : THEME_COLOR} />
          <Text
            style={[
              styles.tabText,
              activeTab === 'nearby' && styles.tabTextActive,
            ]}
          >
            Nearby Help
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'emergencies' && styles.tabActive]}
          onPress={() => setActiveTab('emergencies')}
        >
          <Ionicons
            name="alert-circle"
            size={18}
            color={activeTab === 'emergencies' ? '#FFFFFF' : THEME_COLOR}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'emergencies' && styles.tabTextActive,
            ]}
          >
            Emergency Calls
            {emergencies.length > 0 && (
              <Text style={styles.badge}> ({emergencies.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentInner}
      >
        {activeTab === 'nearby' ? (
          <>
            {/* Nearby Services Map Preview */}
            <View style={styles.mapPreview}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={48} color="#E0E0E0" />
                <Text style={styles.mapText}>Live Map View</Text>
                <Text style={styles.mapSubtext}>
                  Shows nearby police, hospitals, and rescue services
                </Text>
              </View>
            </View>

            {/* Services List */}
            <View style={styles.servicesSection}>
              <Text style={styles.sectionTitle}>Nearby Services</Text>
              <FlatList
                data={MOCK_NEARBY_SERVICES}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={THEME_COLOR} />
              <Text style={styles.infoText}>
                These are the nearest emergency services to your location
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Emergencies List */}
            {emergencies.length > 0 ? (
              <View style={styles.emergenciesSection}>
                <Text style={styles.sectionTitle}>Active Emergency Alerts</Text>
                <FlatList
                  data={emergencies}
                  renderItem={renderEmergencyItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />

                {selectedEmergency && (
                  <View style={styles.selectedEmergencyDetails}>
                    <Text style={styles.detailsTitle}>Alert Details</Text>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>User:</Text>
                      <Text style={styles.detailsValue}>{selectedEmergency.userId}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Location:</Text>
                      <Text style={styles.detailsValue}>{selectedEmergency.location}</Text>
                    </View>
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Status:</Text>
                      <Text style={[styles.detailsValue, { color: THEME_COLOR }]}>
                        {selectedEmergency.status.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.helpButton}
                      onPress={() => {
                        Alert.alert(
                          'Help Offered',
                          'Your response has been recorded. Emergency services will be notified.'
                        );
                      }}
                    >
                      <Ionicons name="hand-left" size={20} color="#FFFFFF" />
                      <Text style={styles.helpButtonText}>Offer Help</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No active emergencies</Text>
                <Text style={styles.emptySubtext}>
                  All users in your area are safe
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  tabActive: {
    backgroundColor: THEME_COLOR,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mapPreview: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    backgroundColor: '#FFFFFF',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
  },
  mapSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  servicesSection: {
    marginBottom: 20,
  },
  emergenciesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  serviceType: {
    fontSize: 11,
    color: THEME_COLOR,
    marginTop: 2,
    fontWeight: '500',
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  distance: {
    fontSize: 11,
    color: '#999999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emergencyCardSelected: {
    borderColor: THEME_COLOR,
    backgroundColor: '#FFF5F5',
  },
  emergencyCardIcon: {
    marginRight: 12,
  },
  emergencyCardInfo: {
    flex: 1,
  },
  emergencyCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  emergencyCardLocation: {
    fontSize: 12,
    color: '#333333',
    marginTop: 4,
    fontWeight: '500',
  },
  emergencyCardTime: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  selectedEmergencyDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  detailsValue: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
  },
  helpButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 6,
  },
});
