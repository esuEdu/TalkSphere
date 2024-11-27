// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { firebaseAuth } from '../../services/firebase';
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    // Basic validations
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    if (!trimmedPassword) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        trimmedEmail,
        trimmedPassword
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        // Send verification email
        await sendEmailVerification(user);
        Alert.alert(
          'Verification Email Sent',
          'A new verification email has been sent to your email address.'
        );

        // Sign out the user
        await firebaseAuth.signOut();

        return;
      }

      // Navigate to the main app screen or dashboard
      // Example:
      // navigation.replace('Home');

    } catch (error: any) {
      console.error('Login error', error);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              onChangeText={setEmail}
              value={email}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email Input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Password Input"
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FFEA00" style={styles.loader} />
          ) : (
            <TouchableOpacity
              onPress={handleLogin}
              accessibilityLabel="Login Button"
              disabled={loading} // Disable button while loading
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#FFEA00', '#FF6F00']} // Gradient from yellow to orange
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switch}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Solid background color
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    alignSelf: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 2, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333333',
    fontSize: 16,
  },
  loader: {
    marginVertical: 10,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden', // Ensures the gradient respects the border radius
    marginTop: 10,
    elevation: 3, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 3 }, // Shadow for iOS
    shadowOpacity: 0.3, // Shadow for iOS
    shadowRadius: 3, // Shadow for iOS
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff', // White text for contrast
    fontSize: 18,
    fontWeight: '600',
  },
  switch: {
    marginTop: 25,
    alignItems: 'center',
  },
  switchText: {
    color: '#555555',
    fontSize: 16,
  },
  switchTextBold: {
    color: '#FF6F00', // Matching the gradient's orange color
    fontWeight: '600',
  },
});

export default LoginScreen;
