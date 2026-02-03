import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket configuration - should match your API base URL (without /api path)
const SOCKET_URL = 'http://154.26.137.37:5040';
const AUTH_TOKEN_KEY = '@passpot_auth_token';
const USER_PROFILE_KEY = '@passpot_user_profile';

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: Map<string, (message: any) => void> = new Map();
  private isConnecting: boolean = false;
  private userId: number | null = null;

  async connect(userId?: number): Promise<Socket | null> {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Socket connection in progress...');
      return null;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        console.log('No auth token available for socket connection');
        this.isConnecting = false;
        return null;
      }

      // Get userId from parameter or from stored profile
      if (userId) {
        this.userId = userId;
      } else {
        const profileStr = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (profileStr) {
          try {
            const profile = JSON.parse(profileStr);
            this.userId = profile.id;
          } catch (e) {
            console.error('Error parsing user profile:', e);
          }
        }
      }

      console.log('Connecting to socket server...');

      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnecting = false;

        // Register user ID for direct messaging/calls
        if (this.userId) {
          console.log('Registering user with socket:', this.userId);
          this.socket?.emit('register-user', this.userId);
        }
      });

      this.socket.on('disconnect', reason => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', error => {
        console.error('Socket connection error:', error.message);
        this.isConnecting = false;
      });

      // Listen for new messages
      this.socket.on('new_message', message => {
        console.log('Received new message:', message);
        // Notify all registered callbacks
        this.messageCallbacks.forEach(callback => {
          callback(message);
        });
      });

      // Listen for typing indicators
      this.socket.on('user_typing', data => {
        console.log('User typing:', data);
      });

      this.socket.on('user_stopped_typing', data => {
        console.log('User stopped typing:', data);
      });

      // Listen for incoming call events
      this.socket.on('incoming-call', data => {
        console.log('Incoming call:', data);
      });

      this.socket.on('call-accepted', data => {
        console.log('Call accepted:', data);
      });

      this.socket.on('call-rejected', data => {
        console.log('Call rejected:', data);
      });

      this.socket.on('call-ended', data => {
        console.log('Call ended:', data);
      });

      return this.socket;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      this.isConnecting = false;
      return null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  registerUser(userId: number): void {
    this.userId = userId;
    if (this.socket?.connected) {
      console.log('Registering user:', userId);
      this.socket.emit('register-user', userId);
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      console.log('Joining conversation:', conversationId);
      this.socket.emit('join_conversation', conversationId);
    } else {
      console.log('Socket not connected, cannot join conversation');
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      console.log('Leaving conversation:', conversationId);
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // WebRTC Signaling Methods

  callUser(to: string | number, offer: any, callType: 'audio' | 'video'): void {
    console.log('[Socket] callUser called, connected:', this.socket?.connected);
    console.log('[Socket] Calling user:', to, 'callType:', callType);
    if (this.socket?.connected) {
      this.socket.emit('call-user', { to, offer, type: callType });
      console.log('[Socket] call-user event emitted successfully');
    } else {
      console.warn('[Socket] Cannot call user - socket not connected!');
    }
  }

  makeAnswer(to: string | number, answer: any): void {
    if (this.socket?.connected) {
      console.log('Sending answer to:', to);
      this.socket.emit('make-answer', { to, answer });
    }
  }

  sendIceCandidate(to: string | number, candidate: any): void {
    if (!to) {
      console.warn(
        '[Socket] Cannot send ICE candidate: target ID is null/undefined',
      );
      return;
    }
    if (this.socket?.connected) {
      console.log('[Socket] Sending ICE candidate to:', to);
      this.socket.emit('ice-candidate', { to, candidate });
    }
  }

  rejectCall(to: string | number): void {
    if (this.socket?.connected) {
      console.log('Rejecting call from:', to);
      this.socket.emit('reject-call', { to });
    }
  }

  endCall(to: string | number): void {
    if (this.socket?.connected) {
      console.log('Ending call with:', to);
      this.socket.emit('end-call', { to });
    }
  }

  // Register callbacks for WebRTC events
  onIncomingCall(callback: (data: any) => void): void {
    console.log(
      '[Socket] Registering incoming call listener (call-made & incoming-call)',
    );
    // Listen for 'call-made' (standard WebRTC naming in this app)
    this.socket?.on('call-made', data => {
      console.log('[Socket] call-made event received:', data);
      callback(data);
    });
    // Add redundant listener for 'incoming-call' (common in some socket implementations)
    this.socket?.on('incoming-call', data => {
      console.log('[Socket] incoming-call event received:', data);
      callback(data);
    });
  }

  onCallAnswered(callback: (data: any) => void): void {
    console.log('[Socket] Registering call answered listener (answer-made)');
    this.socket?.on('answer-made', data => {
      console.log('[Socket] answer-made event received:', data);
      callback(data);
    });
  }

  onIceCandidate(callback: (data: any) => void): void {
    console.log('[Socket] Registering ICE candidate listener');
    this.socket?.on('ice-candidate', data => {
      console.log('[Socket] ice-candidate event received');
      callback(data);
    });
  }

  onCallRejected(callback: (data: any) => void): void {
    console.log('[Socket] Registering call rejected listener');
    this.socket?.on('call-rejected', data => {
      console.log('[Socket] call-rejected event received:', data);
      callback(data);
    });
  }

  onCallEnded(callback: (data: any) => void): void {
    console.log('[Socket] Registering call ended listeners');
    this.socket?.on('end-call', data => {
      console.log('[Socket] end-call event received:', data);
      callback(data);
    });
    this.socket?.on('call-ended', data => {
      console.log('[Socket] call-ended event received:', data);
      callback(data);
    });
  }

  // User Status Events
  onUserOnline(callback: (data: { userId: number }) => void): void {
    this.socket?.on('user-online', callback);
  }

  onUserOffline(callback: (data: { userId: number }) => void): void {
    this.socket?.on('user-offline', callback);
  }

  offStatusEvents(): void {
    if (this.socket) {
      this.socket.off('user-online');
      this.socket.off('user-offline');
    }
  }

  offSignalingEvents(): void {
    if (this.socket) {
      this.socket.off('call-made');
      this.socket.off('answer-made');
      this.socket.off('ice-candidate');
      this.socket.off('call-rejected');
      this.socket.off('end-call');
      this.socket.off('call-ended');
    }
  }

  sendTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId });
    }
  }

  sendStopTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { conversationId });
    }
  }

  // Register a callback for new messages
  onNewMessage(callbackId: string, callback: (message: any) => void): void {
    this.messageCallbacks.set(callbackId, callback);
  }

  // Unregister a callback
  offNewMessage(callbackId: string): void {
    this.messageCallbacks.delete(callbackId);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getUserId(): number | null {
    return this.userId;
  }
}

export const socketService = new SocketService();
