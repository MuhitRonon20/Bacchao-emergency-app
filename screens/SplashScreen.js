import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_COLOR = '#D30D0D';

export default function SplashScreen({ navigation }) {
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check user status and navigate
    const timer = setTimeout(async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          navigation.replace('Login'); // User exists, go to login
        } else {
          navigation.replace('Login'); // New user, go to login
        }
      } catch (e) {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Logo Circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>B</Text>
        </View>
        
        {/* App Name */}
        <Text style={styles.appName}>BACCHAO</Text>
        <Text style={styles.tagline}>Emergency Safety System</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME_COLOR,
    letterSpacing: 2,
    marginVertical: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 1,
  },
});
