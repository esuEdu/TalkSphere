// src/components/UserAvatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type UserAvatarProps = {
  name: string;
  photoURL?: string | null;
  uid?: string; // Unique identifier for consistent color assignment
  size?: number;
};

const COLORS = [
  '#FFB6C1', '#ADD8E6', '#90EE90', '#FFA07A', '#9370DB',
  '#FFD700', '#40E0D0', '#FF69B4', '#87CEFA', '#32CD32',
  '#FF6347', '#1E90FF', '#FF8C00', '#BA55D3', '#00CED1',
  '#DAA520', '#8A2BE2', '#3CB371', '#DC143C', '#20B2AA',
];

const getColorFromUID = (uid: string | undefined): string => {
  if (!uid) return '#CCCCCC'; // Default color if uid is not provided
  const charCode = uid.charCodeAt(0);
  const colorIndex = charCode % COLORS.length;
  return COLORS[colorIndex];
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoURL, uid, size = 50 }) => {

    console.log('UserAvatar.tsx: UserAvatar: name: ', name);

  const backgroundColor = getColorFromUID(uid);
  const initial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : name ? (
        <View style={[styles.initialsContainer, { backgroundColor, width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={styles.initialsText}>{initial}</Text>
        </View>
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: '#CCCCCC', width: size, height: size, borderRadius: size / 2 }]}>
          <Ionicons name="person" size={size * 0.6} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserAvatar;
