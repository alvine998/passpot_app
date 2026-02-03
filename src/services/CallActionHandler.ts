import notifee, { EventType } from '@notifee/react-native';
import { socketService } from './SocketService';
import { WebRTCService } from './WebRTCService';
import { navigationRef } from '../../App';

export const handleCallAction = async ({
  type,
  detail,
}: {
  type: EventType;
  detail: any;
}) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS) {
    if (pressAction.id === 'accept_call') {
      console.log('[CallActionHandler] User accepted call from notification');

      const { data } = notification;

      // If offer is present in data, handle it
      if (data.offer) {
        try {
          const offer =
            typeof data.offer === 'string'
              ? JSON.parse(data.offer)
              : data.offer;
          await WebRTCService.handleIncomingCall(
            offer,
            data.callerId,
            data.type === 'call',
          );
        } catch (e) {
          console.error('[CallActionHandler] Error parsing offer:', e);
        }
      }

      // Navigate to call screen
      if (navigationRef.isReady()) {
        const screen = data.type === 'video_call' ? 'VideoCall' : 'VoiceCall';

        navigationRef.navigate(screen, {
          userId: data.callerId,
          userName: data.callerName || 'Unknown Caller',
          isIncoming: true,
        });
      }

      // Remove notification
      await notifee.cancelNotification(notification.id);
    } else if (pressAction.id === 'reject_call') {
      console.log('[CallActionHandler] User rejected call from notification');

      // Reject via socket - ensure connected first
      const { data } = notification;
      await socketService.connect(data.callerId);
      socketService.rejectCall(data.callerId);

      // Remove notification
      await notifee.cancelNotification(notification.id);
    }
  }
};
