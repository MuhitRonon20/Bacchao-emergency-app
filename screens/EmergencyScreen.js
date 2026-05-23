import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

// Ripple component
function RippleCircle({ delay, isWaving }) {
  const animValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout;
    let loopAnim;

    if (isWaving) {
      animValue.setValue(0);
      // Wait once, then loop infinitely without stuttering
      timeout = setTimeout(() => {
        loopAnim = Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        );
        loopAnim.start();
      }, delay);
    } else {
      animValue.stopAnimation();
      animValue.setValue(0);
    }

    return () => {
      clearTimeout(timeout);
      if (loopAnim) {
        loopAnim.stop();
      }
    };
  }, [isWaving, delay]);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          transform: [{ scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }],
          opacity: animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        },
      ]}
    />
  );
}

export default function EmergencyScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [rescueRequested, setRescueRequested] = useState(false);
  const [rescuePopupVisible, setRescuePopupVisible] = useState(false);
  const [rescueCountdown, setRescueCountdown] = useState(8);
  const [safeModalVisible, setSafeModalVisible] = useState(false);
  const [isWaving, setIsWaving] = useState(true);
  const [recording, setRecording] = useState(null);
  const recordingRef = React.useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let timerInterval;
    const initializeEmergency = async () => {
      await loadUserData();
      await broadcastEmergency();
      await saveEmergencyNotification();

      // Start timer
      timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      // Start Recording
      startRecording();
    };

    initializeEmergency();

    return () => {
      clearInterval(timerInterval);
      stopRecordingUnloadOnly(); // safety cleanly unload on unmount
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      recordingRef.current = newRecording;
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecordingUnloadOnly = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (e) {}
    }
  };

  const stopRecordingAndGetUri = async () => {
    const rec = recordingRef.current;
    if (!rec) return null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      setRecording(null);
      return uri;
    } catch (e) {
      recordingRef.current = null;
      setRecording(null);
      return null;
    }
  };

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

  const broadcastEmergency = async () => {
    try {
      // Broadcast emergency to all app users within 100 meters
      const emergency = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: userData?.email || 'user@bacchao.com',
        location: 'Current Location',
        status: 'active',
        type: 'RED_ALERT',
      };

      // Save to local emergency alerts
      let alerts = [];
      try {
        const existing = await AsyncStorage.getItem('emergencyAlerts');
        if (existing) {
          alerts = JSON.parse(existing);
        }
      } catch (e) { }

      alerts.unshift(emergency);
      await AsyncStorage.setItem('emergencyAlerts', JSON.stringify(alerts));
    } catch (e) {
      console.log('Error broadcasting emergency:', e);
    }
  };

  const saveEmergencyNotification = async () => {
    try {
      const notification = {
        id: Date.now().toString(),
        type: 'EMERGENCY_ALERT',
        title: 'Emergency SOS Activated',
        message: 'An emergency call for help has been sent',
        timestamp: new Date().toISOString(),
        read: false,
      };

      let notifications = [];
      try {
        const existing = await AsyncStorage.getItem('notifications');
        if (existing) {
          notifications = JSON.parse(existing);
        }
      } catch (e) { }

      notifications.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
      console.log('Error saving notification:', e);
    }
  };

  const handleSafeMode = () => {
    setIsWaving(false);
    setSafeModalVisible(true);
  };

  const confirmSafe = async () => {
    setIsWaving(false);
    
    // Stop recording and save evidence
    const uri = await stopRecordingAndGetUri();
    if (uri) {
      try {
        const existingStr = await AsyncStorage.getItem('@bacchao_evidence_records');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        existing.unshift({
          id: Date.now().toString(),
          uri: uri,
          timestamp: new Date().toISOString(),
          duration: timer || 1 // approximate duration based on elapsed timer
        });
        await AsyncStorage.setItem('@bacchao_evidence_records', JSON.stringify(existing));
      } catch (e) {
        console.log('Error saving evidence', e);
      }
    }

    setSafeModalVisible(false);
    navigation.replace('DashboardMain');
  };

  const handleNeedRescue = () => {
    if (rescueRequested) return;
    setRescueRequested(true);
    setRescuePopupVisible(true);
    setRescueCountdown(8);

    let count = 8;
    const interval = setInterval(() => {
      count -= 1;
      setRescueCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setRescuePopupVisible(false);
      }
    }, 1000);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Math.max(insets.top, 30),
          paddingBottom: Math.max(insets.bottom, 30)
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.callingText}>CALLING EMERGENCY</Text>
        <Text style={styles.elapsedTime}>{formatTimer(timer)}</Text>
      </View>

      {/* Status Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.statusMessage}>
          Please stand by, we are requesting for help. Emergency contacts and nearby rescue
          services would see your call for help
        </Text>
      </View>

      {/* Emergency Ripple Animation */}
      <View style={styles.emergencyContainer}>
        {/* Background ripples */}
        <RippleCircle delay={0} isWaving={isWaving} />
        <RippleCircle delay={500} isWaving={isWaving} />
        <RippleCircle delay={1000} isWaving={isWaving} />

        {/* Main emergency circle */}
        <View style={styles.mainCircle}>
          {/* Profile image placeholder */}
          <View style={styles.profileImageContainer}>
            {userData?.name ? (
              <Text style={styles.initialsText}>{userData.name[0].toUpperCase()}</Text>
            ) : (
              <Ionicons name="person" size={48} color={THEME_COLOR} />
            )}
          </View>
        </View>
      </View>

      {/* Pulse animation indicator */}
      <View style={styles.pulseContainer}>
        <View style={styles.pulseInner} />
        <Text style={styles.pulseText}>Sending Signal...</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <Ionicons name="phone" size={20} color={THEME_COLOR} />
          <Text style={styles.infoLabel}>Police Notified</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="people" size={20} color={THEME_COLOR} />
          <Text style={styles.infoLabel}>Nearby Users Alerted</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="location" size={20} color={THEME_COLOR} />
          <Text style={styles.infoLabel}>Location Shared</Text>
        </View>
      </View>

      {/* Need Rescue Button */}
      <TouchableOpacity 
        style={[styles.rescueButton, rescueRequested && styles.rescueButtonDisabled]} 
        onPress={handleNeedRescue}
        activeOpacity={0.8}
        disabled={rescueRequested}
      >
        <Text style={styles.rescueButtonText}>
          {rescueRequested ? 'RESCUE REQUESTED' : 'NEED RESCUE'}
        </Text>
      </TouchableOpacity>

      {/* Safe Mode Button */}
      <TouchableOpacity style={styles.safeModeButton} onPress={handleSafeMode}>
        <Text style={styles.safeModeText}>SAFE NOW</Text>
      </TouchableOpacity>

      {/* Bottom Help Text */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          If you are safe, tap "SAFE NOW" to cancel the alert
        </Text>
      </View>

      {/* Rescue Confirmation Modal */}
      <Modal visible={rescuePopupVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupContent}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" style={{marginBottom: 10}} />
            <Text style={styles.popupTitle}>Rescue Request Sent!</Text>
            <Text style={styles.popupMessage}>
              We are prioritizing your SOS. Stay calm, help is on the way.
            </Text>
            <Text style={styles.popupTimer}>Closing in {rescueCountdown}s</Text>
          </View>
        </View>
      </Modal>

      {/* Stylish Safe Now Modal */}
      <Modal visible={safeModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.safeModalContent}>
            <View style={styles.safeModalHeader}>
              <View style={styles.safeModalIconContainer}>
                <Ionicons name="shield-checkmark" size={36} color="#4CAF50" />
              </View>
              <Text style={styles.safeModalTitle}>Confirm Safety</Text>
            </View>
            <Text style={styles.safeModalMessage}>
              Are you completely safe? This will cancel the ongoing alert and notify your contacts.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setSafeModalVisible(false);
                  setIsWaving(true);
                }}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmSafe}
              >
                <Text style={styles.modalConfirmText}>YES, I'M SAFE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME_COLOR,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  elapsedTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  messageContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
  },
  statusMessage: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
  },
  emergencyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 280,
  },
  ripple: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 3,
    borderColor: THEME_COLOR,
  },
  mainCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  pulseContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pulseInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME_COLOR,
    marginBottom: 12,
  },
  pulseText: {
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: '600',
    letterSpacing: 1,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 16,
  },
  infoCard: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#555555',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  safeModeButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: THEME_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  safeModeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLOR,
    letterSpacing: 1,
  },
  helpContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  rescueButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rescueButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  rescueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  popupTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  safeModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  safeModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  safeModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  safeModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  safeModalMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
