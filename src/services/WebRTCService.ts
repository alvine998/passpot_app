import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { socketService } from './SocketService';
import { CallService } from './CallService';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
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

  static async getLocalStream(
    isVoiceOnly: boolean = false,
  ): Promise<MediaStream | null> {
    try {
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

      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      return null;
    }
  }

  static async startCall(
    targetId: number,
    isVoiceOnly: boolean = false,
  ): Promise<void> {
    this.targetUserId = targetId;
    this.createPeerConnection(targetId);

    // Log the call attempt
    const callType = isVoiceOnly ? 'audio' : 'video';
    // Not awaiting to not block
    CallService.logCall(targetId, callType).catch(console.error);

    const stream = await this.getLocalStream(isVoiceOnly);
    if (stream) {
      stream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, stream);
      });
    }

    try {
      const offer = await this.peerConnection?.createOffer({});
      await this.peerConnection?.setLocalDescription(offer);

      const callType = isVoiceOnly ? 'audio' : 'video';
      socketService.callUser(targetId, offer, callType);
    } catch (error) {
      console.error('Error starting call:', error);
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
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  static async handleCandidate(candidate: any): Promise<void> {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      }
    } catch (error) {
      console.error('Error handling candidate:', error);
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
