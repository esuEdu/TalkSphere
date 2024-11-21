// src/screens/UsersScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';
import { ProfileContext } from '../../contexts/ProfileContext';

type UsersScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Users'>;

type Props = {
  navigation: UsersScreenNavigationProp;
};

const UsersScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);

  useEffect(() => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('uid', '!=', user?.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => doc.data());
      setUsers(usersList);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginRight: 15 }}>
          {profile?.photoURL ? (
            <Image
              source={{ uri: profile.photoURL }}
              style={styles.headerImage}
            />
          ) : (
            <Ionicons name="person-circle" size={40} color="black" />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, profile]);

  const filteredUsers = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const startChat = (otherUser: any) => {
    // Navigate to ChatRoom and pass the other user's info
    navigation.navigate('ChatRoom', { otherUser });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
            <View style={styles.userInfo}>
              {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.userImage} />
              ) : (
                <Ionicons name="person-circle" size={50} color="gray" style={styles.userIcon} />
              )}
              <Text style={styles.userName}>{item.name || item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchInput: {
    height: 50,
    borderColor: '#555',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  userItem: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userIcon: {
    marginRight: 15,
  },
  
});

export default UsersScreen;