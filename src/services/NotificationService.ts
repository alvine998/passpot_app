import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { api } from './ApiService';

class NotificationService {
  async requestPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
  }

  async getFcmToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async registerTokenWithBackend() {
    const token = await this.getFcmToken();
    const authToken = await api.getAuthToken();

    // Validate token exists and is not empty
    if (!token || token.trim() === '') {
      console.log('FCM token is empty or null, skipping registration');
      return false;
    }

    if (!authToken) {
      console.log('No auth token, skipping push token registration');
      return false;
    }

    try {
      console.log('Registering FCM token with backend...', token);
      const response = await api.post('/users/push-token', {
        fcmToken: token,
        platform: Platform.OS,
      });
      console.log('Token registered with backend:', response.data);
      return true;
    } catch (error) {
      console.error('Error registering token with backend:', error);
      return false;
    }
  }

  onMessage(callback: (message: any) => void) {
    return messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      callback(remoteMessage);
    });
  }

  onNotificationOpenedApp(callback: (message: any) => void) {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background:',
        remoteMessage,
      );
      callback(remoteMessage);
    });
  }

  async getInitialNotification(callback: (message: any) => void) {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log(
        'Notification caused app to open from quit state:',
        remoteMessage,
      );
      callback(remoteMessage);
    }
  }

  // Background messaging handler (must be called outside of a component)
  setBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }

  async initialize(onNotification?: (message: any) => void) {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      if (onNotification) {
        this.onMessage(onNotification);
        this.onNotificationOpenedApp(onNotification);
        this.getInitialNotification(onNotification);
      }
    } else {
      console.log('Notification permission denied');
    }
  }
}

export const notificationService = new NotificationService();
