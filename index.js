/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { notificationService } from './src/services/NotificationService';
import notifee from '@notifee/react-native';
import { handleCallAction } from './src/services/CallActionHandler';

// Register FCM background handler
notificationService.setBackgroundMessageHandler();

// Register Notifee background event handler
notifee.onBackgroundEvent(handleCallAction);

AppRegistry.registerComponent(appName, () => App);
