import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';
import { View, SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, LayoutAnimation, UIManager } from 'react-native';
import { firestore } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';
import MessageBubble from './Components/ChatRoomComponents/MessageBubble';

type ChatRoomScreenRouteProp = RouteProp<AppStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomScreenRouteProp;
};

type Message = {
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
}

const ChatRoomScreen: React.FC<Props> = ({ route }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const { user } = useContext(AuthContext);
  const { otherUser } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);


  const chatId = [user?.uid, otherUser.uid].sort().join('_'); // Unique chat ID

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
  }, []);

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

    if (text.trim().length === 0) return

    const sendText = text.trim();
    setText('');

    try {
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');

      await addDoc(messagesRef, {
        createdAt: new Date(),
        text: sendText,
        user: {
          _id: user?.uid || '',
          name: user?.displayName || '',
        },
      });

      // Update chats collection for listing chats (optional)
      await setDoc(
        doc(firestore, 'chats', chatId),
        {
          participants: [user?.uid, otherUser.uid],
          lastMessage: sendText,
          lastUpdated: new Date(),
        },
        { merge: true }
      );

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
        <View style={[styles.inputContainer]}>
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
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  keyboardAvoidingView: { flex: 1 },
  messageList: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  
  inputContainer: {
    flexDirection: 'row',
    padding: 6,
    paddingBottom: 50,
    borderTopColor: '#E5E5EA',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  inputContainerKeyboardVisible: {
    paddingBottom: 30, 
  },
  inputContainerKeyboardHidden: {
    paddingBottom: 45,
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

