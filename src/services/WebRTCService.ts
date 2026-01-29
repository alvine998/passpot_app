import { mediaDevices, MediaStream } from 'react-native-webrtc';

export class WebRTCService {
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
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      return null;
    }
  }

  static stopStream(stream: MediaStream | null) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
        // @ts-ignore - _switchCamera is a custom property in react-native-webrtc
        if (track._switchCamera) {
          // @ts-ignore
          track._switchCamera();
        }
      });
    }
  }
}
