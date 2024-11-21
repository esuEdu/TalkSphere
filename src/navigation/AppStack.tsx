// src/navigation/AppStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import UsersScreen from '../features/chat/UsersScreen';
import ChatRoomScreen from '../features/chat/ChatRoomScreen';
import ProfileScreen from '../features/profile/ProfileScreen';

export type AppStackParamList = {
  Users: undefined;
  ChatRoom: { otherUser: any };
  Profile: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Users" component={UsersScreen} options={{ title: 'Users' }} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({ title: route.params.otherUser.email })}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
};

export default AppStack;
