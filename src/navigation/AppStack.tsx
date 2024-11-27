// src/navigation/AppStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatsScreen from '../features/chat/ChatsScreen';
import ChatRoomScreen from '../features/chat/ChatRoomScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import AddChatModal from '../features/chat/Components/UsersComponents/AddChatModal';
import OtherUserProfileScreen from '../features/profile/OtherUserProfileScreen';
import { StackScreenProps } from '@react-navigation/stack';
import { User } from '../types/User';

export type AppStackParamList = {
  Chats: undefined;
  ChatRoom: { otherUser: User; chatId: string };
  Profile: undefined;
  StartChat: undefined;
  AddChat: undefined;
  OtherUserProfile: { otherUser: User }; // Added OtherUserProfile
};

const Stack = createStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Chats">
      <Stack.Screen 
        name="Chats" 
        component={ChatsScreen} 
        options={{ title: 'Chats' }}
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={{ title: 'Chat' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Your Profile' }} 
      />
      <Stack.Screen
        name="AddChat"
        component={AddChatModal}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{
          title: 'Profile', // Customize the header title as needed
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
