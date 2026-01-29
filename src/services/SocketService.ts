import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket configuration - should match your API base URL (without /api path)
const SOCKET_URL = 'https://5253c5958be2.ngrok-free.app';
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
