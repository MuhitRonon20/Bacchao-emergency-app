import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function EvidencePinScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('loading'); // 'setup' | 'validate' | 'loading'
  const [savedPin, setSavedPin] = useState(null);
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const existing = await AsyncStorage.getItem('@bacchao_evidence_pin');
      if (existing) {
        setSavedPin(existing);
        setMode('validate');
      } else {
        setMode('setup');
      }
    } catch (e) {
      console.error(e);
      setMode('setup');
    }
  };

  const handlePinChange = async (val) => {
    // Only allow digits
    const cleaned = val.replace(/[^0-9]/g, '');
    setPin(cleaned);

    if (cleaned.length === 4) {
      if (mode === 'setup') {
        // Save new pin
        try {
          await AsyncStorage.setItem('@bacchao_evidence_pin', cleaned);
          navigation.replace('EvidenceList');
        } catch (e) {
          Alert.alert('Error', 'Failed to save PIN.');
          setPin('');
        }
      } else if (mode === 'validate') {
        // Check Pin
        if (cleaned === savedPin) {
          navigation.replace('EvidenceList');
        } else {
          Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect.', [
            { text: 'Try Again', onPress: () => setPin('') }
          ]);
        }
      }
    }
  };

  if (mode === 'loading') {
    return <View style={styles.container} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Locker</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={THEME_COLOR} />
        </View>

        <Text style={styles.title}>
          {mode === 'setup' ? 'Create Evidence PIN' : 'Enter Evidence PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'setup' 
            ? 'Set a 4-digit PIN to secure your automatically recorded emergency audio evidence.'
            : 'Enter your 4-digit PIN to access your restricted emergency recordings.'}
        </Text>

        <View style={styles.pinContainer}>
          {/* Visual dots */}
          {[1, 2, 3, 4].map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.pinDot,
                pin.length > idx && styles.pinDotActive
              ]} 
            />
          ))}

          {/* Invisible hidden input capturing keyboard */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus={true}
          />
        </View>

        <TouchableOpacity 
          style={styles.showKeyboardBtn}
          onPress={() => inputRef.current?.focus()}
        >
          <Text style={styles.showKeyboardText}>Show Keyboard</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    backgroundColor: 'transparent',
  },
  pinDotActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  showKeyboardBtn: {
    marginTop: 40,
    padding: 10,
  },
  showKeyboardText: {
    color: THEME_COLOR,
    fontWeight: '600',
    fontSize: 16,
  }
});
