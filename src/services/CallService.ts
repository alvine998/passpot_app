import { api } from './ApiService';

export interface CallLogPayload {
  callerId: string;
  receiverId: string;
  callType: 'audio' | 'video';
  status: 'missed' | 'completed' | 'rejected' | 'busy';
  duration?: number;
  startTime: string;
  endTime?: string;
}

export class CallService {
  /**
   * Log a call to the backend
   * @param payload - The call log data
   */
  static async logCall(payload: CallLogPayload): Promise<boolean> {
    try {
      console.log('Logging call:', payload);
      await api.post('/calls', payload);
      return true;
    } catch (error) {
      console.error('Error logging call:', error);
      return false;
    }
  }

  /**
   * Get call history
   */
  static async getCallHistory(): Promise<any[]> {
    try {
      const response = await api.get<{ data: any[] }>('/calls/history');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }
}
