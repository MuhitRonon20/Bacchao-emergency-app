import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

import { AuthContext } from '../App';

export default function ProfileScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        setEditData(parsedData);
      }
      setLoading(false);
    } catch (e) {
      console.log('Error loading user data:', e);
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name || !editData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editData.email || !editData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!editData.contactNumber || !editData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!editData.address || !editData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedData = {
        ...editData,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      setIsEditing(false);
      setSaving(false);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                setIsEditing(false);
                setEditData(userData);
                setErrors({});
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={THEME_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color={THEME_COLOR} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Avatar Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.name ? userData.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || 'email@example.com'}</Text>
        </View>

        {/* Info Cards */}
        {!isEditing && (
          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardIcon}>
                <Ionicons name="call" size={20} color={THEME_COLOR} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Contact</Text>
                <Text style={styles.infoCardValue}>{userData?.contactNumber || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCardIcon}>
                <Ionicons name="location" size={20} color={THEME_COLOR} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Address</Text>
                <Text style={styles.infoCardValue} numberOfLines={2}>
                  {userData?.address || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Edit Form */}
        {isEditing && (
          <View style={styles.formSection}>
            {/* Name Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Ionicons name="person" size={20} color={THEME_COLOR} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#CCCCCC"
                  value={editData.name || ''}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail" size={20} color={THEME_COLOR} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#CCCCCC"
                  value={editData.email || ''}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Contact Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <View style={[styles.inputContainer, errors.contactNumber && styles.inputError]}>
                <Ionicons name="call" size={20} color={THEME_COLOR} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your contact number"
                  placeholderTextColor="#CCCCCC"
                  value={editData.contactNumber || ''}
                  onChangeText={(value) => handleInputChange('contactNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.contactNumber && (
                <Text style={styles.errorText}>{errors.contactNumber}</Text>
              )}
            </View>

            {/* Address Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={[styles.inputContainer, errors.address && styles.inputError]}>
                <Ionicons name="location" size={20} color={THEME_COLOR} />
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="Enter your address"
                  placeholderTextColor="#CCCCCC"
                  value={editData.address || ''}
                  onChangeText={(value) => handleInputChange('address', value)}
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setEditData(userData);
                  setErrors({});
                }}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Account Info Section */}
        {!isEditing && (
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.accountInfo}>
              <View style={styles.accountInfoRow}>
                <Text style={styles.accountInfoLabel}>Member Since</Text>
                <Text style={styles.accountInfoValue}>
                  {userData?.registeredAt
                    ? new Date(userData.registeredAt).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.accountInfoRow}>
                <Text style={styles.accountInfoLabel}>Account Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Active</Text>
                </View>
              </View>
              <View style={styles.accountInfoRow}>
                <Text style={styles.accountInfoLabel}>Trusted Contacts</Text>
                <Text style={styles.accountInfoValue}>Added</Text>
              </View>
            </View>
          </View>
        )}

        {/* Help Text */}
        {!isEditing && (
          <View style={styles.helpBox}>
            <Ionicons name="information-circle" size={18} color={THEME_COLOR} />
            <Text style={styles.helpText}>
              Keep your profile information up to date for faster emergency response
            </Text>
          </View>
        )}

        {/* Danger Zone */}
        {!isEditing && (
          <View style={styles.section}>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.settingItemDanger} onPress={() => {
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
                                await AsyncStorage.removeItem('userData');
                                signOut();
                              },
                            },
                          ]
                        );
                      },
                      style: 'destructive',
                    },
                  ]
                );
              }}>
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
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 13,
    color: '#999999',
  },
  infoCardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formGroup: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 10,
  },
  addressInput: {
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 11,
    color: '#FF4444',
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
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
  accountSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  accountInfo: {
    gap: 12,
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountInfoLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
  },
  accountInfoValue: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: THEME_COLOR,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#333333',
    marginLeft: 10,
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  settingIconContainerDanger: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitleDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginBottom: 4,
  },
  settingDescriptionDanger: {
    fontSize: 13,
    color: '#999999',
  },
});
