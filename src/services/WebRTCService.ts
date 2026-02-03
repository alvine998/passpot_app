import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { socketService } from './SocketService';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: [
        'turn:154.26.137.37:3478?transport=udp',
        'turn:154.26.137.37:3478?transport=tcp',
      ],
      username: 'webrtc',
      credential: 'StrongPasswordHere',
    },
  ],
};

export class WebRTCService {
  static peerConnection: RTCPeerConnection | null = null;
  static localStream: MediaStream | null = null;
  static remoteStream: MediaStream | null = null;
  static targetUserId: number | null = null; // ID of the user we are calling/connected to state

  // Callbacks for UI updates
  static onRemoteStream: ((stream: MediaStream) => void) | null = null;
  static onCallEnded: (() => void) | null = null;

  static async requestPermissions(isVoiceOnly: boolean): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const permissions = isVoiceOnly
          ? [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]
          : [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const audioGranted =
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const cameraGranted = isVoiceOnly
          ? true
          : granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED;

        console.log(
          '[WebRTC] Permissions granted - Audio:',
          audioGranted,
          'Camera:',
          cameraGranted,
        );

        if (!audioGranted || !cameraGranted) {
          Alert.alert(
            'Permissions Required',
            'Camera and microphone permissions are required for calls.',
            [{ text: 'OK' }],
          );
          return false;
        }
        return true;
      } catch (err) {
        console.error('[WebRTC] Permission request error:', err);
        return false;
      }
    }
    // iOS handles permissions automatically when getUserMedia is called
    return true;
  }

  static async getLocalStream(
    isVoiceOnly: boolean = false,
  ): Promise<MediaStream | null> {
    try {
      // Request permissions first
      const hasPermissions = await this.requestPermissions(isVoiceOnly);
      if (!hasPermissions) {
        console.error('[WebRTC] Permissions not granted');
        return null;
      }

      const constraints = {
        audio: true,
        video: isVoiceOnly
          ? false
          : {
              facingMode: 'user',
              width: 640,
              height: 480,
              frameRate: 30,
            },
      };

      console.log(
        '[WebRTC] Requesting media with constraints:',
        JSON.stringify(constraints),
      );
      const stream = await mediaDevices.getUserMedia(constraints);
      console.log(
        '[WebRTC] Got local stream with tracks:',
        stream.getTracks().length,
      );
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('[WebRTC] Error getting local stream:', error);
      Alert.alert(
        'Call Error',
        'Failed to access camera/microphone. Please check permissions.',
      );
      return null;
    }
  }

  static async startCall(
    targetId: number,
    isVoiceOnly: boolean = false,
  ): Promise<void> {
    console.log(
      '[WebRTC] Starting call to:',
      targetId,
      'isVoiceOnly:',
      isVoiceOnly,
    );
    this.targetUserId = targetId;
    this.createPeerConnection(targetId);

    // Call logging is now handled in the call screens when call ends

    const stream = await this.getLocalStream(isVoiceOnly);
    console.log('[WebRTC] Local stream obtained:', !!stream);
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('[WebRTC] Adding track to peer connection:', track.kind);
        this.peerConnection?.addTrack(track, stream);
      });
    }

    try {
      const offer = await this.peerConnection?.createOffer({});
      console.log('[WebRTC] Offer created:', !!offer);
      await this.peerConnection?.setLocalDescription(offer);
      console.log('[WebRTC] Local description set');

      const callType = isVoiceOnly ? 'audio' : 'video';
      console.log('[WebRTC] Emitting call-user event to:', targetId);
      socketService.callUser(targetId, offer, callType);
    } catch (error) {
      console.error('[WebRTC] Error starting call:', error);
    }
  }

  static async handleIncomingCall(
    offer: any,
    callerId: number,
    isVoiceOnly: boolean = false,
  ): Promise<void> {
    this.targetUserId = callerId;
    this.createPeerConnection(callerId);

    // Set remote description (offer)
    await this.peerConnection?.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    // Get local stream and add tracks
    const stream = await this.getLocalStream(isVoiceOnly);
    if (stream) {
      stream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, stream);
      });
    }

    // Create answer
    try {
      const answer = await this.peerConnection?.createAnswer();
      await this.peerConnection?.setLocalDescription(answer);
      socketService.makeAnswer(callerId, answer);
    } catch (error) {
      console.error('Error answering call:', error);
    }
  }

  static async handleAnswer(answer: any): Promise<void> {
    console.log(
      '[WebRTC] Handling answer, peerConnection exists:',
      !!this.peerConnection,
    );
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        console.log('[WebRTC] Remote description (answer) set successfully');
      } else {
        console.warn('[WebRTC] No peer connection when handling answer!');
      }
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error);
    }
  }

  static async handleCandidate(candidate: any): Promise<void> {
    console.log(
      '[WebRTC] Handling ICE candidate, peerConnection exists:',
      !!this.peerConnection,
    );
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
        console.log('[WebRTC] ICE candidate added successfully');
      }
    } catch (error) {
      console.error('[WebRTC] Error handling candidate:', error);
    }
  }

  static createPeerConnection(targetId: number) {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(configuration);

    // @ts-ignore
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socketService.sendIceCandidate(targetId, event.candidate);
      }
    };

    // @ts-ignore
    this.peerConnection.ontrack = event => {
      if (event.streams && event.streams[0]) {
        console.log('Remote stream received');
        const stream = event.streams[0];
        this.remoteStream = stream;
        if (this.onRemoteStream) {
          this.onRemoteStream(stream);
        }
      }
    };

    // @ts-ignore
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (
        this.peerConnection?.connectionState === 'disconnected' ||
        this.peerConnection?.connectionState === 'failed' ||
        this.peerConnection?.connectionState === 'closed'
      ) {
        this.cleanup();
        if (this.onCallEnded) this.onCallEnded();
      }
    };
  }

  static stopStream(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          /* ignore */
        }
      });
    }
  }

  static cleanup() {
    if (this.localStream) {
      this.stopStream(this.localStream);
      this.localStream = null;
    }

    if (this.remoteStream) {
      // usually remote tracks end when connection closes, but to be sure
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.targetUserId = null;
  }

  static endCall() {
    if (this.targetUserId) {
      socketService.endCall(this.targetUserId);
    }
    this.cleanup();
  }

  static setAudioEnabled(stream: MediaStream | null, enabled: boolean) {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  static setVideoEnabled(stream: MediaStream | null, enabled: boolean) {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  static switchCamera(stream: MediaStream | null) {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        // @ts-ignore
        if (track._switchCamera) {
          // @ts-ignore
          track._switchCamera();
        }
      });
    }
  }
}
