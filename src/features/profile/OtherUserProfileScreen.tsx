import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/AppStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import UserAvatar from '../chat/Components/UsersComponents/UserAvatar';
import { LinearGradient } from 'expo-linear-gradient';

type OtherUserProfileScreenRouteProp = RouteProp<AppStackParamList, 'OtherUserProfile'>;

type OtherUserProfileScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'OtherUserProfile'
>;

type Props = {
  route: OtherUserProfileScreenRouteProp;
  navigation: OtherUserProfileScreenNavigationProp;
};

const OtherUserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { otherUser } = route.params;

  const handleEmailPress = () => {
    if (otherUser.email) {
      Linking.openURL(`mailto:${otherUser.email}`);
    }
  };

  const handlePhonePress = () => {
    if (otherUser.phoneNumber) {
      const phoneURL = Platform.select({
        ios: `telprompt:${otherUser.phoneNumber}`,
        android: `tel:${otherUser.phoneNumber}`,
      });
      if (phoneURL) {
        Linking.openURL(phoneURL);
      }
    }
  };

  const handleMessagePress = () => {
    navigation.navigate('ChatRoom', { otherUser, chatId: generateChatId() });
  };

  const handleCallPress = () => {
    if (otherUser.phoneNumber) {
      handlePhonePress();
    }
  };

  const generateChatId = () => `${otherUser.uid}_${Date.now()}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.avatarContainer}>
          <UserAvatar
            name={otherUser.name}
            photoURL={otherUser.photoURL}
            size={140}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.name}>{otherUser.name}</Text>

          {otherUser.description && (
            <Text style={styles.description}>{otherUser.description}</Text>
          )}

          <View style={styles.contactInfo}>
            {otherUser.email && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={handleEmailPress}
                accessibilityLabel="Email"
                accessibilityHint="Tap to send an email to this user"
              >
                <Ionicons name="mail-outline" size={24} color="#FFAA00" />
                <Text style={styles.infoText}>{otherUser.email}</Text>
              </TouchableOpacity>
            )}

            {otherUser.phoneNumber && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={handlePhonePress}
                accessibilityLabel="Phone Number"
                accessibilityHint="Tap to call this user"
              >
                <Ionicons name="call-outline" size={24} color="#FFAA00" />
                <Text style={styles.infoText}>{otherUser.phoneNumber}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessagePress}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <FontAwesome name="wechat" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Message</Text>
            </LinearGradient>
          </TouchableOpacity>

          {otherUser.phoneNumber && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCallPress}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Ionicons name="call-outline" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  infoCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 22,
  },
  contactInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    width: '90%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default OtherUserProfileScreen;
