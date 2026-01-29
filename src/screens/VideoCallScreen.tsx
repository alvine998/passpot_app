import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { PhoneOff, Mic, MicOff, Camera, CameraOff, SwitchCamera, User } from 'lucide-react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { WebRTCService } from '../services/WebRTCService';

const { width, height } = Dimensions.get('window');

type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;

const VideoCallScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallRouteProp>();
    const { userName, userId, isIncoming } = route.params;

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const startCall = async () => {
            // Get local stream
            let stream = WebRTCService.localStream;
            if (!stream) {
                stream = await WebRTCService.getLocalStream(false);
            }
            setLocalStream(stream);

            // Start call only if not incoming
            if (userId && !isIncoming) {
                await WebRTCService.startCall(parseInt(userId), false);
            }
        };
        startCall();

        // Listeners implementation
        WebRTCService.onRemoteStream = (rStream) => {
            console.log('Setting remote stream in UI');
            setRemoteStream(rStream);
        };

        WebRTCService.onCallEnded = () => {
            navigation.goBack();
        };

        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            WebRTCService.onCallEnded = null;
            WebRTCService.onRemoteStream = null;
            // Service cleans up streams on endCall
        };
    }, [userId]);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        WebRTCService.setAudioEnabled(localStream, !newMuted);
    };

    const toggleCamera = () => {
        const newCameraOff = !isCameraOff;
        setIsCameraOff(newCameraOff);
        WebRTCService.setVideoEnabled(localStream, !newCameraOff);
    };

    const handleSwitchCamera = () => {
        WebRTCService.switchCamera(localStream);
    };

    const handleEndCall = () => {
        WebRTCService.endCall();
        navigation.goBack();
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            {/* Main Video Area (Remote) */}
            <View style={styles.remoteVideo}>
                {remoteStream ? (
                    <RTCView
                        streamURL={remoteStream.toURL()}
                        style={StyleSheet.absoluteFill}
                        objectFit="cover"
                    />
                ) : (
                    <View style={styles.remoteAvatar}>
                        <User size={100} color={COLORS.white} />
                        <Text style={styles.remoteName}>{userName}</Text>
                        <Text style={styles.timer}>{formatTime(seconds)}</Text>
                    </View>
                )}
            </View>

            {/* Local Video Area (Self) */}
            <View style={styles.localVideo}>
                {isCameraOff || !localStream ? (
                    <View style={styles.localCameraOff}>
                        <CameraOff size={24} color={COLORS.white} />
                    </View>
                ) : (
                    <RTCView
                        streamURL={localStream.toURL()}
                        style={styles.localCameraOn}
                        objectFit="cover"
                        mirror={true}
                    />
                )}
            </View>

            {/* Controls */}
            <SafeAreaView style={styles.controlsLayer}>
                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                        onPress={toggleMute}
                    >
                        {isMuted ? <MicOff size={24} color={COLORS.black} /> : <Mic size={24} color={COLORS.white} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
                        onPress={toggleCamera}
                    >
                        {isCameraOff ? <CameraOff size={24} color={COLORS.black} /> : <Camera size={24} color={COLORS.white} />}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={handleSwitchCamera}>
                        <SwitchCamera size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={handleEndCall}
                    >
                        <PhoneOff size={28} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    remoteAvatar: {
        alignItems: 'center',
    },
    remoteName: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '700',
        marginTop: SPACING.md,
    },
    timer: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        marginTop: SPACING.xs,
    },
    localVideo: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 100,
        height: 150,
        borderRadius: 12,
        backgroundColor: '#000000',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    localCameraOff: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    localCameraOn: {
        flex: 1,
        width: '100%',
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsLayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: SPACING.xl,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        alignItems: 'center',
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: COLORS.white,
    },
    endButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VideoCallScreen;
