// src/screens/RegisterScreen.tsx
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
import { firebaseAuth, firestore } from '../../services/firebase';
import {
  createUserWithEmailAndPassword,
  User,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState(''); // State for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // State for phone number
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Regular expression for validating phone numbers (simple version)
  const phoneRegex = /^[+]?[0-9]{10,15}$/;

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    return phoneRegex.test(phone);
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPhone = phoneNumber.trim();

    // Basic validations
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    if (!trimmedPhone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    if (!isValidPhoneNumber(trimmedPhone)) {
      Alert.alert(
        'Error',
        'Please enter a valid phone number (10-15 digits, can start with +).'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        trimmedEmail,
        password
      );
      const user: User = userCredential.user;

      await sendEmailVerification(user);

      // Add user to Firestore 'users' collection with phoneNumber
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: trimmedName,
        phoneNumber: trimmedPhone, // Added phone number
        description: '',
        // photoURL: '', // Removed photoURL
      });

      Alert.alert(
        'Success',
        'User registered successfully! Please verify your email before logging in.'
      );

      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Registration error', error);
      Alert.alert('Registration Error', error.message);
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
          <Text style={styles.title}>Register</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Name"
              placeholderTextColor="#888"
              onChangeText={setName}
              value={name}
              style={styles.input}
              autoCapitalize="words"
              accessibilityLabel="Name Input"
            />
          </View>

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
            <Ionicons name="call-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#888"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Phone Number Input"
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
              onPress={handleRegister}
              accessibilityLabel="Register Button"
              disabled={loading} // Disable button while loading
              style={styles.buttonContainer}
            >
              <LinearGradient
                colors={['#FFEA00', '#FF6F00']} // Gradient from yellow to orange
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Register</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switch}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchTextBold}>Login</Text>
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

export default RegisterScreen;