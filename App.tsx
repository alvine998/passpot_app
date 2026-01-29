import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/services/i18n';
import { useTranslation } from 'react-i18next';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS } from './src/styles/theme';
import { RootStackParamList } from './src/navigation/types';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, CircleDot, Newspaper, User as UserIcon } from 'lucide-react-native';

import WelcomeScreen from './src/screens/WelcomeScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import StatusScreen from './src/screens/StatusScreen';
import NewsScreen from './src/screens/NewsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ContactListScreen from './src/screens/ContactListScreen';
import NewsDetailScreen from './src/screens/NewsDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import LoginEmailScreen from './src/screens/LoginEmailScreen';
import Login2FAScreen from './src/screens/Login2FAScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import Setup2FAScreen from './src/screens/Setup2FAScreen';
import Verify2FAScreen from './src/screens/Verify2FAScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HelpScreen from './src/screens/HelpScreen';
import TermsPrivacyScreen from './src/screens/TermsPrivacyScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';
import SetupPINScreen from './src/screens/SetupPINScreen';
import VoiceCallScreen from './src/screens/VoiceCallScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import LogoutScreen from './src/screens/LogoutScreen';
import FriendProfileScreen from './src/screens/FriendProfileScreen';
import VerifyPINScreen from './src/screens/VerifyPINScreen';
import { notificationService } from './src/services/NotificationService';
import { Alert } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Create a navigation ref for navigation actions outside of components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive sizing for foldable devices like Samsung Z Fold
  // Cover screen: ~320-400dp, Inner screen: ~700-800dp
  const isWideScreen = width > 500;
  const tabBarHeight = isWideScreen ? 70 : 60;
  const iconSize = isWideScreen ? 28 : 24;

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.black,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: tabBarHeight + insets.bottom,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: isWideScreen ? 13 : 11,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === 'Chats') {
            return <MessageCircle color={color} size={iconSize} />;
          } else if (route.name === 'Status') {
            return <CircleDot color={color} size={iconSize} />;
          } else if (route.name === 'News') {
            return <Newspaper color={color} size={iconSize} />;
          } else if (route.name === 'Profile') {
            return <UserIcon color={color} size={iconSize} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{ tabBarLabel: i18n.t('tabs.chats') }}
      />
      <Tab.Screen
        name="Status"
        component={StatusScreen}
        options={{ tabBarLabel: i18n.t('tabs.status') }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ tabBarLabel: i18n.t('tabs.news') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: i18n.t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}

import { ProfileProvider } from './src/context/ProfileContext';
import { StatusProvider } from './src/context/StatusContext';
import { FriendsProvider } from './src/context/FriendsContext';
import { ChatProvider } from './src/context/ChatContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import normalize from 'react-native-normalize';
import { View, ActivityIndicator } from 'react-native';

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    // Initialize notification service
    notificationService.initialize((message) => {
      // Handle foreground notification
      const conversationId = message.data?.conversationId;
      const recipientCode = message.data?.recipientCode;
      const name = message.data?.name;

      if (conversationId && navigationRef.isReady()) {
        navigationRef.navigate('ChatRoom', {
          id: conversationId,
          recipientCode: recipientCode,
          name: name || 'Chat',
        });
      }
    });
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Register token with backend after successful login
      notificationService.registerTokenWithBackend();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      id="RootStack"
      initialRouteName={isAuthenticated ? "MainTabs" : "Welcome"}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.white, marginTop: normalize(40) }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="ContactList" component={ContactListScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Setup2FA" component={Setup2FAScreen} />
      <Stack.Screen name="Verify2FA" component={Verify2FAScreen} />
      <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="Login2FA" component={Login2FAScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      <Stack.Screen name="Logout" component={LogoutScreen} />
      <Stack.Screen name="VoiceCall" component={VoiceCallScreen} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} />
      <Stack.Screen name="SetupPIN" component={SetupPINScreen} />
      <Stack.Screen name="VerifyPIN" component={VerifyPINScreen} />
      <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
    </Stack.Navigator>
  );
}

import Toast from 'react-native-toast-message';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ProfileProvider>
          <StatusProvider>
            <FriendsProvider>
              <ChatProvider>
                <SafeAreaProvider>
                  <NavigationContainer ref={navigationRef}>
                    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
                    <AppNavigator />
                    <Toast />
                  </NavigationContainer>
                </SafeAreaProvider>
              </ChatProvider>
            </FriendsProvider>
          </StatusProvider>
        </ProfileProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default App;
