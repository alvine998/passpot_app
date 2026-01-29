import { api } from './ApiService';

export class CallService {
  /**
   * Log a call attempt to the backend
   * @param receiverId - The ID of the user being called
   * @param callType - The type of call ('audio' or 'video')
   */
  static async logCall(
    receiverId: number,
    callType: 'audio' | 'video',
  ): Promise<void> {
    try {
      console.log('Logging call:', { receiverId, callType });
      await api.post('/calls', {
        receiverId,
        callType,
      });
    } catch (error) {
      console.error('Error logging call:', error);
      // We don't want to block the call flow if logging fails
    }
  }
}
