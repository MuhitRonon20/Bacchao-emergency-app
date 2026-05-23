import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function EvidenceListScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadRecords();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadRecords = async () => {
    try {
      const existingStr = await AsyncStorage.getItem('@bacchao_evidence_records');
      if (existingStr) {
        setRecords(JSON.parse(existingStr));
      }
    } catch (e) {
      console.log('Failed to load evidence', e);
    }
  };

  const playRecord = async (item) => {
    try {
      // Unload active sound
      if (sound) {
        await sound.unloadAsync();
        if (playingId === item.id) {
          // just toggling off
          setSound(null);
          setPlayingId(null);
          return;
        }
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingId(item.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          newSound.unloadAsync();
          setSound(null);
        }
      });

    } catch (e) {
      Alert.alert('Playback Error', 'Cannot play this recording file.');
      setPlayingId(null);
    }
  };

  const deleteRecord = (id) => {
    Alert.alert(
      'Delete Evidence',
      'Are you sure you want to permanently delete this voice recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (playingId === id && sound) {
              await sound.unloadAsync();
              setSound(null);
              setPlayingId(null);
            }
            const filtered = records.filter(r => r.id !== id);
            setRecords(filtered);
            await AsyncStorage.setItem('@bacchao_evidence_records', JSON.stringify(filtered));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isPlaying = playingId === item.id;
    const date = new Date(item.timestamp).toLocaleString();
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.durationText}>{item.duration}s recording</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.playBtn, isPlaying && styles.playBtnActive]} 
            onPress={() => playRecord(item)}
          >
            <Ionicons name={isPlaying ? "stop" : "play"} size={22} color="#FFF" />
            <Text style={styles.playText}>{isPlaying ? 'Stop' : 'Play Audio'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => deleteRecord(item.id)}
          >
            <Ionicons name="trash" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Records</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={records}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mic-off" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No recordings found</Text>
            <Text style={styles.emptySubText}>
              Voice evidence is automatically captured and saved here when you trigger an active Emergency SOS.
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  playBtnActive: {
    backgroundColor: '#FF9800',
  },
  playText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: '#FFF0F0',
    borderRadius: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  }
});
