import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventType,
  AndroidCategory,
} from '@notifee/react-native';
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
    console.log('[NotificationService] Starting token registration...');
    const token = await this.getFcmToken();
    const authToken = await api.getAuthToken();

    // Validate token exists and is not empty
    if (!token || token.trim() === '') {
      console.warn(
        '[NotificationService] FCM token is empty or null, skipping registration',
      );
      return false;
    }

    if (!authToken) {
      console.warn(
        '[NotificationService] No auth token found, user might not be logged in. Skipping push token registration',
      );
      return false;
    }

    try {
      console.log(
        '[NotificationService] Registering FCM token with backend:',
        token,
      );
      const response = await api.post('/users/push-token', {
        fcmToken: token,
        platform: Platform.OS,
      });
      console.log(
        '[NotificationService] Token registered successfully:',
        response.data,
      );
      return true;
    } catch (error) {
      console.error(
        '[NotificationService] Error registering token with backend:',
        error,
      );
      return false;
    }
  }

  onMessage(callback: (message: any) => void) {
    return messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);

      // If it's a call, show actionable notification via Notifee
      if (
        remoteMessage.data?.type === 'call' ||
        remoteMessage.data?.type === 'video_call'
      ) {
        await this.displayCallNotification(remoteMessage);
      }

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

      // If it's a call, show actionable notification via Notifee
      if (
        remoteMessage.data?.type === 'call' ||
        remoteMessage.data?.type === 'video_call'
      ) {
        await this.displayCallNotification(remoteMessage);
      }
    });
  }

  async displayCallNotification(remoteMessage: any) {
    const { data } = remoteMessage;
    const isVideo = data.type === 'video_call';
    const callerName = data.callerName || 'Unknown Caller';
    const callerId = data.callerId || data.from;

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'calls',
      name: 'Incoming Calls',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'passpot_bell', // Custom sound file without extension
      vibration: true,
    });

    // Display a notification
    await notifee.displayNotification({
      title: `Incoming ${isVideo ? 'Video' : 'Voice'} Call`,
      body: callerName,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.CALL,
        ongoing: true,
        autoCancel: false,
        smallIcon: 'ic_notification', // Ensure this exists or use a default
        color: '#4CAF50',
        actions: [
          {
            title: '<font color="#FF3B30">Decline</font>',
            pressAction: { id: 'reject_call' },
          },
          {
            title: '<font color="#4CAF50">Accept</font>',
            pressAction: { id: 'accept_call', launchActivity: 'default' },
          },
        ],
      },
      data: {
        ...data,
        callerId: callerId.toString(),
      },
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

      // For Android, create a default channel for custom sound if needed
      // Note: Full channel management usually requires a library like Notifee or
      // react-native-push-notification. With just @react-native-firebase/messaging,
      // the backend should specify the channelId and sound in the payload.
      console.log(
        '[NotificationService] Initialized with custom sound support (passpot_bell)',
      );
    } else {
      console.log('Notification permission denied');
    }
  }
}

export const notificationService = new NotificationService();
