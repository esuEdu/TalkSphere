// src/features/chat/AddFriendModal.tsx
import React, { useState, useContext, useEffect } from 'react';
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
import { firestore, realtimeDB } from '../../../../services/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { AuthContext } from '../../../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import useDebouncedSearch from '../../../../hooks/useDebounceddSearch'; 
import UserAvatar from './UserAvatar';

type AddFriendModalProps = {
  navigation: any; // Adjust the type as per your navigation setup
  route: any;
};

const AddFriendModal: React.FC<AddFriendModalProps> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const debouncedSearch = useDebouncedSearch(search, 500);

  useEffect(() => {
    searchUsers();
  }, [debouncedSearch]);

  const searchUsers = async () => {
    if (!debouncedSearch.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(firestore, 'users');

      // Firestore doesn't support OR queries directly; use multiple queries
      const qName = query(
        usersRef,
        where('name', '>=', debouncedSearch),
        where('name', '<=', debouncedSearch + '\uf8ff')
      );
      const qEmail = query(usersRef, where('email', '==', debouncedSearch.trim()));
      const qPhone = query(usersRef, where('phoneNumber', '==', debouncedSearch.trim()));

      const [querySnapshotName, querySnapshotEmail, querySnapshotPhone] = await Promise.all([
        getDocs(qName),
        getDocs(qEmail),
        getDocs(qPhone),
      ]);

      const combinedResults = [
        ...querySnapshotName.docs.map((doc) => doc.data()),
        ...querySnapshotEmail.docs.map((doc) => doc.data()),
        ...querySnapshotPhone.docs.map((doc) => doc.data()),
      ];

      // Remove duplicates and exclude self
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
  };

  const addFriend = async (friendUser: any) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User not authenticated.',
      });
      return;
    }

    try {
      const friendRef = doc(firestore, 'users', user.uid, 'friends', friendUser.uid);
      const friendDoc = await getDoc(friendRef);

      if (friendDoc.exists()) {
        Toast.show({
          type: 'info',
          text1: 'Already Friends',
          text2: `${friendUser.name || friendUser.email} is already your friend.`,
        });
        return;
      }

      await setDoc(friendRef, { uid: friendUser.uid, addedAt: new Date() });
      Toast.show({
        type: 'success',
        text1: 'Friend Added',
        text2: `${friendUser.name || friendUser.email} has been added as a friend.`,
      });
      // Optionally, navigate back or refresh the friend list
      navigation.goBack();
    } catch (error) {
      console.error('Add friend error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add friend. Please try again.',
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <UserAvatar name={item.name} photoURL={item.photoURL} size={50} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || 'No Name'}</Text>
        <Text style={styles.userContact}>{item.email || item.phoneNumber || 'No Contact Info'}</Text>
      </View>
      <TouchableOpacity
        onPress={() => addFriend(item)}
        style={styles.addButton}
        accessibilityLabel="Add Friend"
        accessibilityHint={`Add ${item.name || item.email} as a friend`}
      >
        <Ionicons name="person-add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Friend</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close Add Friend Modal"
          accessibilityHint="Closes the add friend modal"
        >
          <Ionicons name="close" size={24} color="#555" />
        </TouchableOpacity>
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
          accessibilityLabel="Search Input"
        />
      </View>
      {loading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      )}
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <FlatList
          ListHeaderComponent={<ListHeader />}
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          ListEmptyComponent={
            debouncedSearch ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={results.length === 0 && styles.flatListContainer}
        />
        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Consistent background color
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 15,
    elevation: 2, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333333',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 15,
    elevation: 2, // Shadow for Android
    shadowColor: '#000000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.1, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  userContact: {
    fontSize: 14,
    color: '#777777',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777777',
  },
  flatListContainer: {
    flexGrow: 1,
  },
});

export default AddFriendModal;
