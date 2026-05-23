import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function DashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [location, setLocation] = useState('Loading location...');
  const [sosScaleAnim] = useState(new Animated.Value(1));
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
    getLocation();

    // Setup periodic location updates
    const locationInterval = setInterval(() => {
      getLocation();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(locationInterval);
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (e) {
      console.log('Error loading user data:', e);
    }
  };

  const getLocation = async () => {
    try {
      // Mock location data - replace with actual geolocation API
      const mockLocations = [
        'Times Square, New York',
        'Central Park, NYC',
        'Brooklyn Bridge, NYC',
        'Empire State Building, NYC',
      ];
      const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      setLocation(randomLocation);
    } catch (e) {
      setLocation('Location unavailable');
    }
  };

  const handleSOSPress = () => {
    // Animate SOS button
    Animated.sequence([
      Animated.timing(sosScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      executeSOS();
    });
  };

  const executeSOS = () => {
    navigation.navigate('Emergency');
  };

  const renderDemoPopup = () => {
    if (!showDemoPopup) return null;

    return (
      <DemoPopup 
        onClose={() => setShowDemoPopup(false)}
        onHelp={() => {
          setShowDemoPopup(false);
          navigation.navigate('VictimMap', {
            victimName: 'Demo Victim',
            location: '123 Fake Street, Tech City'
          });
        }}
        insets={insets}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderDemoPopup()}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Location on Left */}
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={18} color={THEME_COLOR} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>

        {/* Profile on Right */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>
              {userData?.name ? userData.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Emergency Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Are you in emergency</Text>
            <Ionicons name="alert-circle" size={24} color={THEME_COLOR} />
          </View>

          <Text style={styles.statusMessage}>
            Press the SOS button, your live location will be shared with the nearest police station
            and your emergency contacts and 100 meter Bacchao app users
          </Text>

          {/* SOS Button */}
          <Animated.View style={[styles.sosButtonContainer, { transform: [{ scale: sosScaleAnim }] }]}>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={handleSOSPress}
              activeOpacity={0.8}
            >
              <Text style={styles.sosButtonText}>BACCHAO</Text>
              <Text style={styles.sosButtonSubtext}>SOS</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Information Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color={THEME_COLOR} />
              <Text style={styles.infoText}>Police will be notified</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color={THEME_COLOR} />
              <Text style={styles.infoText}>Nearby users alerted</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="person-add" size={20} color={THEME_COLOR} />
              <Text style={styles.infoText}>Emergency contacts notified</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Contacts')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people" size={28} color={THEME_COLOR} />
              </View>
              <Text style={styles.actionText}>Emergency Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Map')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="map" size={28} color={THEME_COLOR} />
              </View>
              <Text style={styles.actionText}>Nearby Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Safety Tips</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>1</Text>
            </View>
            <Text style={styles.tipText}>Keep emergency contacts updated and reachable</Text>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>2</Text>
            </View>
            <Text style={styles.tipText}>Share your location with trusted contacts regularly</Text>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipNumber}>
              <Text style={styles.tipNumberText}>3</Text>
            </View>
            <Text style={styles.tipText}>Avoid walking alone in unfamiliar areas</Text>
          </View>
        </View>

        {/* Demo Alert Button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => setShowDemoPopup(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={24} color="#FFFFFF" />
          <Text style={styles.demoButtonText}>Simulate Received Alert</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const DemoPopup = ({ onClose, onHelp, insets }) => {
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: false })
      ])
    ).start();
  }, []);

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#A30000', '#FF0B0B']
  });

  return (
    <Animated.View style={[styles.demoPopupContainer, { backgroundColor, top: Math.max(insets.top, 16) }]}>
      <View style={styles.demoPopupHeader}>
        <View style={styles.demoPopupTitleRow}>
          <Ionicons name="warning" size={28} color="#FFFFFF" />
          <Text style={styles.demoPopupTitle}>EMERGENCY</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.demoPopupClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.demoPopupMessage}>
        Someone nearby needs immediate assistance!
      </Text>
      
      <TouchableOpacity style={styles.demoPopupHelpBtn} onPress={onHelp} activeOpacity={0.9}>
        <Text style={styles.demoPopupHelpText}>HELP NOW</Text>
        <Ionicons name="arrow-forward" size={20} color="#D30D0D" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusMessage: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 25,
  },
  sosButtonContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  sosButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sosButtonSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 4,
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '500',
  },
  quickActions: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  tipCard: {
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
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  demoButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  demoPopupContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  demoPopupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoPopupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoPopupTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  demoPopupClose: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
  },
  demoPopupMessage: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 22,
  },
  demoPopupHelpBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  demoPopupHelpText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D30D0D',
  },
});
