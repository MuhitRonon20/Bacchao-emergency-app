import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function PanicButtonConfigScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [selectedTrigger, setSelectedTrigger] = useState('power'); // 'power', 'vol_up', 'vol_down'
  const [clickCount, setClickCount] = useState(5);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configStr = await AsyncStorage.getItem('panicButtonConfig');
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config.trigger) setSelectedTrigger(config.trigger);
        if (config.count) setClickCount(config.count);
      }
    } catch (e) {
      console.log('Failed to load panic config', e);
    }
  };

  const saveConfig = async () => {
    try {
      const config = { trigger: selectedTrigger, count: clickCount };
      await AsyncStorage.setItem('panicButtonConfig', JSON.stringify(config));
      Alert.alert('Saved', 'Panic button preferences have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save configuration.');
    }
  };

  const triggerOptions = [
    { id: 'power', label: 'Power Button', icon: 'power' },
    { id: 'vol_up', label: 'Volume Up Button', icon: 'volume-high' },
    { id: 'vol_down', label: 'Volume Down Button', icon: 'volume-low' },
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panic Button</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        
        <View style={styles.messageBox}>
          <Ionicons name="information-circle" size={24} color={THEME_COLOR} />
          <Text style={styles.messageText}>
            Secretly activate the SOS emergency dispatch by clicking a physical hardware button multiple times in succession, without needing to open the app.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select Hardware Trigger</Text>
        
        <View style={styles.optionsContainer}>
          {triggerOptions.map((opt) => (
            <TouchableOpacity 
              key={opt.id} 
              style={[
                styles.optionRow, 
                selectedTrigger === opt.id && styles.optionRowActive
              ]}
              onPress={() => setSelectedTrigger(opt.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Ionicons 
                  name={opt.icon} 
                  size={24} 
                  color={selectedTrigger === opt.id ? THEME_COLOR : '#666'} 
                />
                <Text style={[
                  styles.optionLabel, 
                  selectedTrigger === opt.id && styles.optionLabelActive
                ]}>
                  {opt.label}
                </Text>
              </View>
              <View style={[
                styles.radioOuter, 
                selectedTrigger === opt.id && styles.radioOuterActive
              ]}>
                {selectedTrigger === opt.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Activation Clicks</Text>
        <View style={styles.counterContainer}>
           <Text style={styles.counterDescription}>
             How many times do you want to press the {triggerOptions.find(o => o.id === selectedTrigger)?.label.toLowerCase()} to trigger the SOS?
           </Text>
           
           <View style={styles.stepperContainer}>
              <TouchableOpacity 
                style={styles.stepperBtn} 
                onPress={() => setClickCount(Math.max(2, clickCount - 1))}
              >
                <Ionicons name="remove" size={24} color="#333" />
              </TouchableOpacity>
              
              <Text style={styles.counterValue}>{clickCount}</Text>
              
              <TouchableOpacity 
                style={styles.stepperBtn}
                onPress={() => setClickCount(Math.min(10, clickCount + 1))}
              >
                <Ionicons name="add" size={24} color="#333" />
              </TouchableOpacity>
           </View>
        </View>

      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
  },
  messageText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionRowActive: {
    backgroundColor: '#FFFAFA',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  optionLabelActive: {
    color: THEME_COLOR,
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: THEME_COLOR,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLOR,
  },
  counterContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  counterDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginHorizontal: 30,
    minWidth: 40,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    paddingTop: 10,
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
