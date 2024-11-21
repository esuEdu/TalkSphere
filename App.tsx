import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { ProfileProvider, ProfileContext } from './src/contexts/ProfileContext';

import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';

const Routes: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // You can return a loading indicator here
    return null;
  }

  return user ? <AppStack /> : <AuthStack />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;
