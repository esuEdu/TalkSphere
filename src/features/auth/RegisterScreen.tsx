// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, Image } from 'react-native';
import { firebaseAuth, firestore, storage } from '../../services/firebase';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import * as ImagePicker from 'expo-image-picker';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState(''); // New state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null); // New state for photo URI
  const [uploading, setUploading] = useState(false); // State for upload indicator


  const handleRegister = async () => {

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const user: User = userCredential.user;

      let photoURL = '';

      // Upload photo if it exists
      if (photo) {
        setUploading(true);
        const response = await fetch(photo);
        const blob = await response.blob();
      
        const storageRef = ref(storage, `profilePictures/${user.uid}/profile.jpg`);
      
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
        setUploading(false);
      }

      // Add user to Firestore 'users' collection
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        description: '',
        photoURL: photoURL,
      });

      // Navigation is handled by AuthContext
    } catch (error: any) {
      console.error('Registration error', error);
      Alert.alert('Registration Error', error.message);
    }
  };

  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions.');
      return;
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#888"
        onChangeText={setName}
        value={name}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {uploading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switch}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center' },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#000',
  },
  switch: { marginTop: 15, alignItems: 'center' },
  switchText: { color: '#1e90ff' },
});

export default RegisterScreen;
