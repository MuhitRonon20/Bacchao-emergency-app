import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function EmergencyMessageConfigScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  
  const defaultMsg = "I am in an emergency and need immediate assistance. Please check my attached live location.";
  const [message, setMessage] = useState(defaultMsg);

  useEffect(() => {
    loadMessage();
  }, []);

  const loadMessage = async () => {
    try {
      const msgStr = await AsyncStorage.getItem('emergencyMessage');
      if (msgStr) {
        setMessage(msgStr);
      }
    } catch (e) {
      console.log('Failed to load message', e);
    }
  };

  const saveMessage = async () => {
    try {
      const trimmedMsg = message.trim();
      const finalMsg = trimmedMsg.length > 0 ? trimmedMsg : defaultMsg;
      await AsyncStorage.setItem('emergencyMessage', finalMsg);
      Alert.alert('Saved', 'Your emergency message has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save message.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.inner, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Emergency Message</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.infoBox}>
              <Ionicons name="chatbubbles" size={24} color={THEME_COLOR} />
              <Text style={styles.infoText}>
                This text will be forwarded automatically to your Trusted Contacts via SMS when you activate an SOS or trigger the Panic Button.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Custom Message</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                multiline
                numberOfLines={6}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your emergency message..."
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length} chars</Text>
            </View>

            <TouchableOpacity 
              style={styles.resetContainer} 
              onPress={() => setMessage(defaultMsg)}
            >
              <Ionicons name="refresh" size={16} color="#666" />
              <Text style={styles.resetText}>Reset to default</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveMessage}>
              <Text style={styles.saveButtonText}>Save Message</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#F8F8F8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontWeight: '500',
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginRight: 4,
  },
  resetText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  bottomContainer: {
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: THEME_COLOR,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
