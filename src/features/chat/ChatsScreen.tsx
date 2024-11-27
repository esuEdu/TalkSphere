import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc as getDocRef, getDoc } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import useDebouncedSearch from '../../hooks/useDebounceddSearch';
import UserAvatar from './Components/UsersComponents/UserAvatar';

type ChatsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Chats'>;

type Props = {
  navigation: ChatsScreenNavigationProp;
};

interface Chat {
  id: string;
  lastMessage: string;
  lastUpdated: string;
  otherUser: {
    uid: string;
    name: string;
    photoURL?: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
  };
}

const ChatsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<{ name?: string; photoURL?: string } | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebouncedSearch(search, 500);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const profileDocRef = getDocRef(firestore, 'users', user.uid);
        const profileSnapshot = await getDoc(profileDocRef);
        if (profileSnapshot.exists()) {
          setProfile(profileSnapshot.data() as { name?: string; photoURL?: string });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const chatsRef = collection(firestore, 'chats');
    const chatsQuery = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribeChats = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const fetchedChats: Chat[] = [];
        const userSnapshots: { [key: string]: () => void } = {};

        snapshot.docs.forEach((doc) => {
          const chatData = doc.data();
          const otherUserId = chatData.participants.find((id: string) => id !== user.uid);

          if (otherUserId) {
            const otherUserDocRef = getDocRef(firestore, 'users', otherUserId);

            // Set up a listener for the other user
            const unsubscribeUser = onSnapshot(
              otherUserDocRef,
              (otherUserSnapshot) => {
                if (otherUserSnapshot.exists()) {
                  const otherUser = otherUserSnapshot.data();
                  const existingChatIndex = fetchedChats.findIndex((chat) => chat.id === doc.id);

                  const chatItem = {
                    id: doc.id,
                    lastMessage: chatData.lastMessage,
                    lastUpdated: chatData.lastUpdated,
                    otherUser: {
                      uid: otherUserId,
                      name: (otherUser as { name: string }).name,
                      photoURL: (otherUser as { photoURL?: string }).photoURL,
                      phoneNumber: (otherUser as { phoneNumber?: string }).phoneNumber,
                      email: (otherUser as { email?: string }).email,
                      description: (otherUser as { description?: string }).description,
                    },
                  };

                  if (existingChatIndex >= 0) {
                    fetchedChats[existingChatIndex] = chatItem;
                  } else {
                    fetchedChats.push(chatItem);
                  }

                  setChats([...fetchedChats]); // Update state with latest data
                }
              },
              (error) => {
                console.error(`Error fetching user ${otherUserId}:`, error);
              }
            );

            // Store the unsubscribe function
            userSnapshots[otherUserId] = unsubscribeUser;
          }
        });

        // Clean up user listeners when component unmounts
        return () => {
          Object.values(userSnapshots).forEach((unsubscribe) => unsubscribe());
        };
      },
      (error) => {
        console.error('Error fetching chats:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load chats.',
        });
        setLoading(false);
      }
    );

    setLoading(false);

    return () => unsubscribeChats();
  }, [user]);

  useEffect(() => {
    if (!profile) return;

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddChat')}
            style={styles.headerButton}
            accessibilityLabel="Add Chat"
            accessibilityHint="Navigate to add a chat"
          >
            <Ionicons name="add" size={28} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerButton}
            accessibilityLabel="Profile"
            accessibilityHint="Navigate to profile"
          >
            <UserAvatar name={profile.name} photoURL={profile.photoURL} size={28} />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: 'Chats',
    });
  }, [navigation, profile]);

  const filteredChats = chats.filter((chat) =>
    chat.otherUser.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const renderItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatRoom', { chatId: item.id, otherUser: item.otherUser })
      }
    >
      <UserAvatar name={item.otherUser.name} photoURL={item.otherUser.photoURL} size={50} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.otherUser.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#555" />
      <TextInput
        placeholder="Search chats"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={<ListHeader />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chats found.</Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 10,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 15,
  },
});

export default ChatsScreen;
