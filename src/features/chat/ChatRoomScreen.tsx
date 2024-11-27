// src/features/chat/ChatRoomScreen.tsx
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
  View, 
  SafeAreaView, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard, 
  LayoutAnimation, 
  UIManager, 
  Image 
} from 'react-native';
import { firestore } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';
import MessageBubble from './Components/ChatRoomComponents/MessageBubble';
import { StackNavigationProp } from '@react-navigation/stack';
import { User } from '../../types/User'; // Import your User type
import { ProfileContext } from '../../contexts/ProfileContext';
import UserAvatar from './Components/UsersComponents/UserAvatar';

type ChatRoomScreenRouteProp = RouteProp<AppStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomScreenRouteProp;
  navigation: ChatRoomScreenNavigationProp;
};

type Message = {
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
};

const ChatHeader: React.FC<{ otherUser: User; navigation: ChatRoomScreenNavigationProp }> = ({ otherUser, navigation }) => {
  const handlePress = () => {
    navigation.navigate('OtherUserProfile', { otherUser });
  };

  return (
    <TouchableOpacity style={headerStyles.container} onPress={handlePress}>
      <UserAvatar name={otherUser.name} photoURL={otherUser.photoURL} size={28} />
      <Text style={headerStyles.name}>{otherUser.name}</Text>
    </TouchableOpacity>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const { user } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);
  const { otherUser } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const chatId = [user?.uid, otherUser.uid].sort().join('_'); // Unique chat ID

  useEffect(() => {
    // Set the custom header
    navigation.setOptions({
      headerTitle: () => <ChatHeader otherUser={otherUser} navigation={navigation} />,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {/* Handle call */}}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherUser]);

  useEffect(() => {
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFirestore = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: data.user,
        } as Message;
      });
      setMessages(messagesFirestore);
    });

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    // Enable LayoutAnimation on Android
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onSend = useCallback(async () => {
    if (text.trim().length === 0) return;
  
    const sendText = text.trim();
    setText('');
  
    try {
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');
  
      await addDoc(messagesRef, {
        createdAt: new Date(),
        text: sendText,
        user: {
          _id: profile?.uid || '',
          name: profile?.name || '',
        },
      });
  
      // Update chats collection for listing chats
      await setDoc(
        doc(firestore, 'chats', chatId),
        {
          participants: [profile?.uid, otherUser.uid],
          lastMessage: sendText,
          lastUpdated: new Date(),
        },
        { merge: true }
      );
  
      // Fetch the recipient's FCM token
      const recipientDoc = await getDoc(doc(firestore, 'users', otherUser.uid));
      if (recipientDoc.exists()) {
        const recipientData = recipientDoc.data();
        const fcmToken = recipientData?.fcmToken;
  
        if (fcmToken) {
          // Send the notification using FCM
          await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=YOUR_SERVER_KEY`, // Replace with your FCM server key
            },
            body: JSON.stringify({
              to: fcmToken,
              notification: {
                title: profile?.name || 'New Message',
                body: sendText,
                sound: 'default',
              },
              data: {
                chatId: chatId,
                senderId: profile?.uid,
                message: sendText,
              },
            }),
          });
        }
      }
    } catch (error) {
      console.error('Send message error', error);
    }
  }, [text, chatId, user, otherUser]);
  

  const renderItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user._id === user?.uid;
    return <MessageBubble message={item} isCurrentUser={isCurrentUser} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.createdAt.toISOString() + item.user._id}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity onPress={onSend} style={styles.button}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 6,
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    fontSize: 16,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default ChatRoomScreen;
export { Message };
