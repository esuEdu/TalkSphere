// src/features/chat/UserAvatar.tsx

import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface UserAvatarProps {
  name?: string;
  photoURL?: string;
  size: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photoURL, size }) => {

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  // Fallback to initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ccc',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size / 2 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#eee',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserAvatar;
