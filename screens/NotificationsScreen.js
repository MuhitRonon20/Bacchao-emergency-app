import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, emergency, other

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 5 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Load regular notifications
      const notifData = await AsyncStorage.getItem('notifications');
      if (notifData) {
        setNotifications(JSON.parse(notifData));
      }

      // Load emergency alerts
      const alertsData = await AsyncStorage.getItem('emergencyAlerts');
      if (alertsData) {
        setEmergencyAlerts(JSON.parse(alertsData));
      }

      setLoading(false);
    } catch (e) {
      console.log('Error loading notifications:', e);
      setLoading(false);
    }
  };

  const handleEmergencyAlertPress = (alert) => {
    Alert.alert(
      'Emergency Alert',
      `A user at ${alert.location} has sent an SOS signal. View on map?`,
      [
        { text: 'Cancel', onPress: () => { } },
        {
          text: 'View on Map',
          onPress: () => {
            navigation.navigate('Map');
          },
        },
      ]
    );
  };

  const handleClearNotification = (notificationId) => {
    const updated = notifications.filter((n) => n.id !== notificationId);
    setNotifications(updated);
    AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const handleClearEmergency = (alertId) => {
    const updated = emergencyAlerts.filter((a) => a.id !== alertId);
    setEmergencyAlerts(updated);
    AsyncStorage.setItem('emergencyAlerts', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', onPress: () => { } },
        {
          text: 'Clear',
          onPress: () => {
            setNotifications([]);
            setEmergencyAlerts([]);
            AsyncStorage.removeItem('notifications');
            AsyncStorage.removeItem('emergencyAlerts');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const displayedEmergencies =
    filter === 'all' || filter === 'emergency' ? emergencyAlerts : [];
  const displayedNotifs =
    filter === 'all' || filter === 'other' ? notifications : [];

  const renderEmergencyAlert = ({ item }) => (
    <TouchableOpacity
      style={styles.emergencyAlertCard}
      onPress={() => handleEmergencyAlertPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.emergencyIcon}>
        <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.emergencyContent}>
        <Text style={styles.emergencyTitle}>Emergency SOS Alert</Text>
        <Text style={styles.emergencyLocation}>{item.location}</Text>
        <Text style={styles.emergencyTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => handleClearEmergency(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color={THEME_COLOR} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications" size={20} color={THEME_COLOR} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => handleClearNotification(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {(notifications.length > 0 || emergencyAlerts.length > 0) && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}
          >
            All
          </Text>
          <View style={[styles.filterBadge, filter === 'all' && styles.filterBadgeActive]}>
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'all' && styles.filterBadgeTextActive,
              ]}
            >
              {emergencyAlerts.length + notifications.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'emergency' && styles.filterTabActive]}
          onPress={() => setFilter('emergency')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'emergency' && styles.filterTabTextActive,
            ]}
          >
            Emergency
          </Text>
          <View style={[styles.filterBadge, filter === 'emergency' && styles.filterBadgeActive]}>
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'emergency' && styles.filterBadgeTextActive,
              ]}
            >
              {emergencyAlerts.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'other' && styles.filterTabActive]}
          onPress={() => setFilter('other')}
        >
          <Text
            style={[styles.filterTabText, filter === 'other' && styles.filterTabTextActive]}
          >
            Other
          </Text>
          <View style={[styles.filterBadge, filter === 'other' && styles.filterBadgeActive]}>
            <Text
              style={[
                styles.filterBadgeText,
                filter === 'other' && styles.filterBadgeTextActive,
              ]}
            >
              {notifications.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {displayedEmergencies.length === 0 && displayedNotifs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>Your notifications will appear here</Text>
          </View>
        ) : (
          <>
            {/* Emergency Alerts */}
            {displayedEmergencies.length > 0 && (
              <View>
                {displayedEmergencies.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.emergencyAlertCard}
                    onPress={() => handleEmergencyAlertPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.emergencyIcon}>
                      <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.emergencyContent}>
                      <Text style={styles.emergencyTitle}>Emergency SOS Alert</Text>
                      <Text style={styles.emergencyLocation}>{item.location}</Text>
                      <Text style={styles.emergencyTime}>{formatTime(item.timestamp)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => handleClearEmergency(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={20} color={THEME_COLOR} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Regular Notifications */}
            {displayedNotifs.length > 0 && (
              <View>
                {displayedNotifs.map((item) => (
                  <View key={item.id} style={styles.notificationCard}>
                    <View style={styles.notificationIcon}>
                      <Ionicons name="notifications" size={20} color={THEME_COLOR} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationMessage}>{item.message}</Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => handleClearNotification(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={20} color="#CCCCCC" />
                    </TouchableOpacity>
                  </View>
                ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: THEME_COLOR,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666666',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emergencyAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  emergencyIcon: {
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emergencyLocation: {
    fontSize: 12,
    color: '#FFFFCC',
    marginTop: 4,
    fontWeight: '500',
  },
  emergencyTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999999',
    marginTop: 6,
  },
  closeButton: {
    padding: 4,
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
