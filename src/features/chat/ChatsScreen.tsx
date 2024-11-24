// src/features/chat/ChatsScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore, realtimeDB } from '../../services/firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import useDebouncedSearch from '../../hooks/useDebounceddSearch';
import { ref, onValue } from 'firebase/database';
import UserAvatar from './Components/UsersComponents/UserAvatar';

type ChatsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Chats'>;

type Props = {
  navigation: ChatsScreenNavigationProp;
};

const HEADER_MAX_HEIGHT = 60;
const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ChatsScreen: React.FC<Props> = ({ navigation }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const debouncedSearch = useDebouncedSearch(search, 500);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [allLoaded, setAllLoaded] = useState<boolean>(false);
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});

  // Animated value for header title style
  const scrollY = useState(new Animated.Value(0))[0];
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const friendsRef = collection(firestore, 'users', user.uid, 'friends');

    const initialQuery = query(friendsRef, orderBy('addedAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(initialQuery, async (snapshot) => {
      const friendIds = snapshot.docs.map((doc) => doc.id);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        setAllLoaded(true);
        return;
      }

      try {
        // Firestore 'in' queries can handle up to 10 elements
        const usersRef = collection(firestore, 'users');
        const userQuery = query(usersRef, where('uid', 'in', friendIds));

        const querySnapshot = await getDocs(userQuery);
        const usersList = querySnapshot.docs.map((doc) => doc.data());

        setFriends(usersList);
      } catch (error) {
        console.error('Error fetching friends:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load friends.',
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch online statuses
  useEffect(() => {
    const unsubscribeStatuses = friends.map((friend) => {
      const statusRef = ref(realtimeDB, `/status/${friend.uid}`);
      return onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStatuses((prev) => ({ ...prev, [friend.uid]: data.state }));
        } else {
          setStatuses((prev) => ({ ...prev, [friend.uid]: 'offline' }));
        }
      });
    });

    return () => {
      unsubscribeStatuses.forEach((unsubscribe) => unsubscribe());
    };
  }, [friends]);

  // Update header options with Add Friend and Profile buttons
  useEffect(() => {
    if (!user) return;

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          {/* Add Friend Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddFriend')}
            style={styles.headerButton}
            accessibilityLabel="Add Friend"
            accessibilityHint="Opens the add friend modal"
          >
            <Ionicons name="add-circle" size={28} color="#007bff" />
          </TouchableOpacity>
          {/* Profile Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerButton}
            accessibilityLabel="Profile"
            accessibilityHint="Navigates to your profile"
          >
            <UserAvatar name={user.displayName || 'Unknown'} photoURL={user?.photoURL || undefined} uid={user?.uid} size={28} />
          </TouchableOpacity>
        </View>
      ),
      headerTitle: () => (
        <Animated.Text style={[styles.headerTitle, isScrolled ? styles.headerTitleScrolled : styles.headerTitleDefault]}>
          Chats
        </Animated.Text>
      ),
    });
  }, [navigation, user, isScrolled]);

  const filteredFriends = friends.filter((u) => {
    const lowerSearch = debouncedSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(lowerSearch)) ||
      (u.email && u.email.toLowerCase().includes(lowerSearch)) ||
      (u.phoneNumber && u.phoneNumber.includes(debouncedSearch))
    );
  });

  const startChat = (otherUser: any) => {
    navigation.navigate('ChatRoom', { otherUser });
  };

  const fetchMoreFriends = async () => {
    if (allLoaded || loadingMore || !lastVisible || !user) return;

    setLoadingMore(true);
    try {
      const friendsRef = collection(firestore, 'users', user.uid, 'friends');
      const moreQuery = query(friendsRef, orderBy('addedAt', 'desc'), startAfter(lastVisible), limit(10));

      const snapshot = await getDocs(moreQuery);
      const friendIds = snapshot.docs.map((doc) => doc.id);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      if (friendIds.length === 0) {
        setAllLoaded(true);
        return;
      }

      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('uid', 'in', friendIds));

      const usersSnapshot = await getDocs(userQuery);
      const usersList = usersSnapshot.docs.map((doc) => doc.data());

      setFriends((prev) => [...prev, ...usersList]);
    } catch (error) {
      console.error('Error fetching more friends:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load more friends.',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
      <UserAvatar name={item.name} photoURL={item.photoURL} uid={item.uid} size={50} />

      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {item.name || 'No Name'}
          </Text>
          <Text style={styles.timestamp}>{/* Placeholder for last message timestamp */}</Text>
        </View>
        <View style={styles.userFooter}>
          <Text style={styles.lastMessage}>{/* Placeholder for last message */}</Text>
          <Ionicons
            name="ellipse"
            size={10}
            color={statuses[item.uid] === 'online' ? 'green' : 'gray'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > HEADER_SCROLL_DISTANCE && !isScrolled) {
      setIsScrolled(true);
    } else if (offsetY <= HEADER_SCROLL_DISTANCE && isScrolled) {
      setIsScrolled(false);
    }
  };

  const ListHeader = () => (
    <>
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

  const ListFooter = () => (
    <>
      {loadingMore && <ActivityIndicator size="small" color="#007bff" style={styles.loader} />}
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
          data={filteredFriends}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          onEndReached={fetchMoreFriends}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            debouncedSearch ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends found.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={<ListFooter />}
          contentContainerStyle={filteredFriends.length === 0 && styles.flatListContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
  headerRight: {
    flexDirection: 'row',
    marginRight: 10,
  },
  headerButton: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitleDefault: {
    color: '#007bff',
    textShadowColor: '#ffffff',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  headerTitleScrolled: {
    color: '#333333',
    textShadowColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
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
    marginVertical: 10,
  },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#555555',
  },
  flatListContainer: {
    flexGrow: 1,
  },
});

export default ChatsScreen;
