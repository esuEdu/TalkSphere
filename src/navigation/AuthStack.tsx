import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RegisterScreen from '../features/auth/RegisterScreen';
import LoginScreen from '../features/auth/LoginScreen';

export type AuthStackParamList = {
    Register: undefined;
    Login: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
    return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  };

export default AuthStack;
