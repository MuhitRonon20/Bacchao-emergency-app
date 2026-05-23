import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

import { AuthContext } from '../App';

export default function SettingsScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    locationSharing: true,
    soundEnabled: true,
    vibrationEnabled: true,
    hundredMeterActive: true,
  });
  const [userData, setUserData] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
    loadSettings();
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

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem('appSettings');
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (e) {
      console.log('Error saving settings:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => { } },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              signOut();
            } catch (e) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, description, toggle = false, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color={THEME_COLOR} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E0', true: THEME_COLOR }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="person" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profile</Text>
                <Text style={styles.settingDescription}>
                  {userData?.name || 'View your profile'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert('Change Password', 'This feature will be available soon');
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="lock-closed" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>Update your password</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Configurations Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Triggers & Messages</Text>
          <View style={styles.sectionContent}>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('PanicButtonConfig')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="hardware-chip" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Panic button</Text>
                <Text style={styles.settingDescription}>Configure physical hardware triggers</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('EmergencyMessageConfig')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="chatbubbles" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Message</Text>
                <Text style={styles.settingDescription}>Customize emergency SOS text</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <SettingItem
              icon="radio"
              title="100 meter app user"
              description="If you want to send your help message note and live location or get imeditet help"
              toggle={true}
              value={settings.hundredMeterActive ?? true}
              onToggle={() => updateSetting('hundredMeterActive', !(settings.hundredMeterActive ?? true))}
            />

          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications & Alerts</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications"
              title="Enable Notifications"
              description="Receive emergency alerts and updates"
              toggle={true}
              value={settings.notificationsEnabled}
              onToggle={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
            />
            <SettingItem
              icon="notifications-outline"
              title="Sound"
              description="Play sound for alerts"
              toggle={true}
              value={settings.soundEnabled}
              onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            />
            <SettingItem
              icon="vibrate"
              title="Vibration"
              description="Vibrate on alerts"
              toggle={true}
              value={settings.vibrationEnabled}
              onToggle={() => updateSetting('vibrationEnabled', !settings.vibrationEnabled)}
            />
          </View>
        </View>

        {/* Privacy & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Location</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="location"
              title="Location Sharing"
              description="Share location for emergency services"
              toggle={true}
              value={settings.locationSharing}
              onToggle={() => updateSetting('locationSharing', !settings.locationSharing)}
            />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('EvidencePin')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="folder-open" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Evidence</Text>
                <Text style={styles.settingDescription}>Secure vault of voice recordings</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Privacy Policy',
                  'Our privacy policy ensures your data is protected and used only for emergency purposes.'
                );
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="shield-checkmark" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>Read our privacy policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'How to Use',
                  '1. Set up your trusted emergency contacts\n2. Enable location sharing\n3. In case of emergency, press the SOS button\n4. Your location will be shared with emergency services'
                );
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="help-circle" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>How to Use BACCHAO</Text>
                <Text style={styles.settingDescription}>Learn how to use the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert('Contact Support', 'Email: support@bacchao.com\nPhone: 1-800-BACCHAO');
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="mail" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Contact Support</Text>
                <Text style={styles.settingDescription}>Get help from our support team</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert('About BACCHAO', 'Version 1.0.0\nEmergency Safety System\nMade with ❤️ for your safety');
              }}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="information-circle" size={22} color={THEME_COLOR} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>About BACCHAO</Text>
                <Text style={styles.settingDescription}>App information and version</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItemDanger} onPress={handleLogout}>
              <View style={styles.settingIconContainerDanger}>
                <Ionicons name="log-out" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitleDanger}>Logout</Text>
                <Text style={styles.settingDescriptionDanger}>Sign out from your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFB3B3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItemDanger}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This cannot be undone.',
                  [
                    { text: 'Cancel', onPress: () => { } },
                    {
                      text: 'Delete',
                      onPress: () => {
                        Alert.alert(
                          'Account Deleted',
                          'Your account has been permanently deleted.',
                          [
                            {
                              text: 'OK',
                              onPress: async () => {
                                await AsyncStorage.removeItem('userToken');
                                await AsyncStorage.removeItem('userData');
                                navigation.replace('Login');
                              },
                            },
                          ]
                        );
                      },
                      style: 'destructive',
                    },
                  ]
                );
              }}
            >
              <View style={styles.settingIconContainerDanger}>
                <Ionicons name="trash" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitleDanger}>Delete Account</Text>
                <Text style={styles.settingDescriptionDanger}>Permanently delete your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFB3B3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 BACCHAO - Emergency Safety System</Text>
        </View>
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
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  settingItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF5F5',
  },
  settingIconContainerDanger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitleDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  settingDescriptionDanger: {
    fontSize: 12,
    color: '#FF8888',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 4,
  },
});
