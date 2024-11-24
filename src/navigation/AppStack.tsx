// src/navigation/AppStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatsScreen from '../features/chat/ChatsScreen';
import ChatRoomScreen from '../features/chat/ChatRoomScreen';
import AddFriendModal from '../features/chat/Components/UsersComponents/AddFriendModal';
import ProfileScreen from '../features/profile/ProfileScreen';

export type AppStackParamList = {
  Chats: undefined;
  ChatRoom: { otherUser: any };
  AddFriend: undefined;
  Profile: undefined;
  // ... other routes
};

const Stack = createStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          headerTitle: 'Chats',
          // Additional header options if needed
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          headerTitle: route.params.otherUser.name || 'Chat',
          // Additional header options if needed
        })}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendModal}
        options={{
          headerShown: false, // Hiding the header as it's a modal
          presentation: 'modal', // For iOS modal presentation style
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profile',
          // Additional header options if needed
        }}
      />
      {/* ... other screens */}
    </Stack.Navigator>
  );
};

export default AppStack;
