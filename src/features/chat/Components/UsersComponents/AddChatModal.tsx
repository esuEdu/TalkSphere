import React, { useState, useContext, useEffect, useCallback } from 'react';
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
import { firestore } from '../../../../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { AuthContext } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import useDebouncedSearch from '../../../../hooks/useDebounceddSearch';
import UserAvatar from './UserAvatar';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../../../navigation/AppStack';

type AddChatModalProps = StackNavigationProp<AppStackParamList, 'AddChat'>;

type Props = {
  navigation: AddChatModalProps;
};

interface User {
  uid: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
}

const AddChatModal: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const debouncedSearch = useDebouncedSearch(search, 500);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchUsers(debouncedSearch);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const searchUsers = useCallback(
    async (searchTerm: string) => {
      setLoading(true);
      try {
        const usersRef = collection(firestore, 'users');
        const qName = query(
          usersRef,
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff')
        );
        const qEmail = query(usersRef, where('email', '==', searchTerm.trim()));
        const qPhone = query(usersRef, where('phoneNumber', '==', searchTerm.trim()));

        const [querySnapshotName, querySnapshotEmail, querySnapshotPhone] =
          await Promise.all([
            getDocs(qName),
            getDocs(qEmail),
            getDocs(qPhone),
          ]);

        const combinedResults: User[] = [
          ...querySnapshotName.docs.map((doc) => doc.data() as User),
          ...querySnapshotEmail.docs.map((doc) => doc.data() as User),
          ...querySnapshotPhone.docs.map((doc) => doc.data() as User),
        ];

        const uniqueResults = Array.from(
          new Map(
            combinedResults
              .filter((u) => u.uid !== user?.uid)
              .map((item) => [item.uid, item])
          ).values()
        );

        setResults(uniqueResults);
      } catch (error) {
        console.error('Search error:', error);
        Toast.show({
          type: 'error',
          text1: 'Search Failed',
          text2: 'Unable to search users. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  const createChat = useCallback(
    async (otherUser: User) => {
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'User not authenticated.',
        });
        return;
      }

      const chatId = [user.uid, otherUser.uid].sort().join('_');
      try {
        const chatRef = doc(firestore, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (chatDoc.exists()) {
          Toast.show({
            type: 'info',
            text1: 'Chat Exists',
            text2: `A chat with ${otherUser.name || otherUser.email} already exists.`,
          });
        } else {
          await setDoc(chatRef, {
            participants: [user.uid, otherUser.uid],
            lastMessage: '',
            lastUpdated: new Date(),
          });
          Toast.show({
            type: 'success',
            text1: 'Chat Created',
            text2: `Chat with ${otherUser.name || otherUser.email} has been created.`,
          });
        }
        navigation.goBack(); // Dismiss the modal
      } catch (error) {
        console.error('Create chat error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to create chat. Please try again.',
        });
      }
    },
    [user, navigation]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  accessibilityLabel="Close Add Chat Modal"
                  accessibilityHint="Closes the add chat modal"
                >
                  <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Chat</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
                <TextInput
                  placeholder="Search by name, email, or phone"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Search Input"
                  accessible
                />
              </View>
              {loading && (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
              )}
            </>
          }
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => createChat(item)}
              accessibilityLabel="Add Chat"
              accessibilityHint={`Create chat with ${item.name || item.email}`}
            >
              <UserAvatar name={item.name} photoURL={item.photoURL} size={50} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                <Text style={styles.userContact}>
                  {item.email || item.phoneNumber || 'No Contact Info'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            debouncedSearch ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={results.length === 0 && styles.flatListContainer}
          keyboardShouldPersistTaps="handled"
        />
        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    paddingHorizontal: 15,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  userContact: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginTop: 10,
  },
  flatListContainer: {
    flexGrow: 1,
  },
});

export default AddChatModal;
