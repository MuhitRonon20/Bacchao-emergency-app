import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#D30D0D';

export default function VictimMapScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  // Get victim details from params, or use fallbacks
  const { victimName, location } = route.params || { 
    victimName: 'Unknown Victim', 
    location: 'Unknown Location' 
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Rescue</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Victim Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{victimName.charAt(0)}</Text>
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.victimName}>{victimName}</Text>
              <Text style={styles.statusText}>Needs Immediate Help</Text>
            </View>
            <Ionicons name="warning" size={32} color={THEME_COLOR} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#666666" />
            <Text style={styles.detailText}>{location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color="#666666" />
            <Text style={styles.detailText}>Alert sent less than 1 min ago</Text>
          </View>
        </View>

        {/* Live Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapInner}>
             <Ionicons name="map" size={60} color="#CCCCCC" />
             <Text style={styles.mapText}>Live Map Tracking</Text>
             <Text style={styles.mapSubText}>Navigating to {location}</Text>
             
             {/* Mock Route path */}
             <View style={styles.mockRouteContainer}>
                <Ionicons name="navigate" size={30} color="#4A90E2" style={styles.routeIconLeft} />
                <View style={styles.dashedLine} />
                <Ionicons name="person" size={30} color={THEME_COLOR} style={styles.routeIconRight} />
             </View>
             <Text style={styles.etaText}>ETA: 2 Mins • 0.8 km</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(211, 13, 13, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME_COLOR,
  },
  infoTextContainer: {
    flex: 1,
  },
  victimName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusText: {
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
    fontWeight: '500',
  },
  mapContainer: {
    height: 350,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 10,
  },
  mapSubText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
  mockRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    marginVertical: 30,
  },
  dashedLine: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: '#999999',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  etaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },

});
