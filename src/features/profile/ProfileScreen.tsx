// src/screens/ProfileScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { ProfileContext } from '../../contexts/ProfileContext';
import { AuthContext } from '../../contexts/AuthContext';
import { firestore, storage } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const { profile } = useContext(ProfileContext);
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(profile?.name || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Camera roll permissions are required to select a profile picture.',
      });
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profilePictures/${user?.uid}/profile.jpg`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);

      // Update user document with new photoURL
      await updateDoc(doc(firestore, 'users', user?.uid || ''), {
        photoURL: downloadURL,
      });

      Toast.show({
        type: 'success',
        text1: 'Profile Picture Updated',
        text2: 'Your profile picture has been successfully updated.',
      });
    } catch (error) {
      console.error('Image upload error', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Failed to upload image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not authenticated.',
      });
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        name,
        description,
      });
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Profile update error', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.profileContainer}>
            <TouchableOpacity
              onPress={pickImage}
              accessibilityLabel="Change Profile Picture"
              accessibilityHint="Opens image picker to change your profile picture"
            >
              <View style={styles.imageWrapper}>
                {photoURL ? (
                  <Image source={{ uri: photoURL }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="camera" size={40} color="#fff" />
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              accessibilityLabel="Name Input"
              accessibilityHint="Enter your name"
            />
            <TextInput
              placeholder="Description"
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
              accessibilityLabel="Description Input"
              accessibilityHint="Enter your description"
            />
            <TouchableOpacity
              onPress={saveProfile}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
              accessibilityLabel="Save Profile"
              accessibilityHint="Saves your profile information"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Consistent background color
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular image
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular placeholder
    backgroundColor: '#007bff', // Primary color for placeholder
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    elevation: 2, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  saveButtonDisabled: {
    backgroundColor: '#a0cfff',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;
