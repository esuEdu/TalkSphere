// src/features/chat/Components/ChatRoomComponents/MessageBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type MessageBubbleProps = {
  message: {
    text: string;
    createdAt: Date;
    user: {
      _id: string;
      name: string;
    };
  };
  isCurrentUser: boolean;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  return (
    <View style={[styles.bubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.timestamp}>{message.createdAt.toLocaleTimeString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    color: '#fff',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});

export default MessageBubble;
