// src/screens/ChatRoomScreen.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, SafeAreaView, FlatList, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { firestore } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/AppStack';
import { AuthContext } from '../../contexts/AuthContext';

type ChatRoomScreenRouteProp = RouteProp<AppStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomScreenRouteProp;
};

const ChatRoomScreen: React.FC<Props> = ({ route }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { user } = useContext(AuthContext);
  const { otherUser } = route.params;

  const chatId = [user?.uid, otherUser.uid].sort().join('_'); // Unique chat ID

  useEffect(() => {
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesFirestore = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: data._id,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: data.user,
        } as IMessage;
      });
      setMessages(messagesFirestore);
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    const { _id, createdAt, text, user: messageUser } = messages[0];
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');

    await addDoc(messagesRef, {
      _id,
      createdAt,
      text,
      user: messageUser,
    });

    // Update chats collection for listing chats (optional)
    await setDoc(
      doc(firestore, 'chats', chatId),
      {
        participants: [user?.uid, otherUser.uid],
        lastMessage: text,
        lastUpdated: createdAt,
      },
      { merge: true }
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: user?.uid || '',
        name: user?.email || '',
      }}
    />
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
});


export default ChatRoomScreen;
