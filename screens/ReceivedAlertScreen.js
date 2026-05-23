import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// A dynamic outward-expanding ripple effect
function RippleCircle({ delay }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, animValue]);

  return (
    <Animated.View
      style={[
        styles.rippleCircle,
        {
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 3],
              }),
            },
          ],
          opacity: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.8, 0.3, 0],
          }),
        },
      ]}
    />
  );
}

export default function ReceivedAlertScreen({ navigation }) {
  const [sound, setSound] = useState(null);
  const insets = useSafeAreaInsets();
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Setup Red Blinking Background (Soft pulse)
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false, // Color interpolation requires false
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // 2. Button Scale Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Setup Vibration
    const VIBRATION_PATTERN = [0, 800, 400];
    Vibration.vibrate(VIBRATION_PATTERN, true);

    // 4. Setup Audio Siren
    playSound();

    return () => {
      // Cleanup on unmount
      Vibration.cancel();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  async function playSound() {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/warning_siren.ogg' },
        { shouldPlay: true, isLooping: true }
      );
      setSound(audioSound);
      await audioSound.playAsync();
    } catch (e) {
      console.log('Error playing sound:', e);
    }
  }

  const handleHelpPress = async () => {
    // Stop alarming feedback
    Vibration.cancel();
    if (sound) {
      await sound.stopAsync();
    }

    // Navigate to Victim map
    navigation.replace('VictimMap', {
      victimName: 'Demo Victim',
      location: '123 Fake Street, Tech City',
    });
  };

  const cancelAndGoBack = () => {
    Vibration.cancel();
    if (sound) sound.stopAsync();
    navigation.goBack();
  };

  const backgroundColor = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#7A0000', '#D30D0D'], // Deep dark red to intense theme red
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      
      {/* Background Ripple Container */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.rippleCenterBox}>
          <RippleCircle delay={0} />
          <RippleCircle delay={1000} />
          <RippleCircle delay={2000} />
        </View>
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        
        {/* Top UI Area */}
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={90} color="#FFFFFF" />
          </View>

          <Text style={styles.emergencyText}>EMERGENCY</Text>
          <Text style={styles.subText}>
            Someone nearby needs your{'\n'}immediate assistance!
          </Text>
        </View>

        {/* Bottom Actions Area */}
        <View style={styles.bottomSection}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpPress}
              activeOpacity={0.9}
            >
              <Text style={styles.helpButtonText}>HELP NOW</Text>
              <Ionicons name="arrow-forward" size={28} color="#D30D0D" style={styles.helpButtonIcon} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.ignoreButton} onPress={cancelAndGoBack}>
            <Text style={styles.ignoreButtonText}>Cancel / I'm too far</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rippleCenterBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  emergencyText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  subText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
    marginBottom: 24,
  },
  helpButtonText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D30D0D', // Theme red
    letterSpacing: 2,
  },
  helpButtonIcon: {
    position: 'absolute',
    right: 24,
  },
  ignoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // translucent capsule
  },
  ignoreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
