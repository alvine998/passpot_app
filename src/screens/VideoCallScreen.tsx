import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { PhoneOff, Mic, MicOff, Camera, CameraOff, SwitchCamera, User } from 'lucide-react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import { WebRTCService } from '../services/WebRTCService';
import { socketService } from '../services/SocketService';
import { CallService } from '../services/CallService';
import { useProfile } from '../context/ProfileContext';

const { width, height } = Dimensions.get('window');

type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;

const VideoCallScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<VideoCallRouteProp>();
    const { userName, userId, isIncoming } = route.params;

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const { id: currentUserId } = useProfile();
    const callStartTime = useRef<Date | null>(null);
    const callConnectedTime = useRef<Date | null>(null);

    useEffect(() => {
        // Record call start time
        callStartTime.current = new Date();

        const startCall = async () => {
            console.log('[VideoCall] startCall triggered. userId:', userId, 'isIncoming:', isIncoming, 'currentUserId:', currentUserId);
            // Get local stream
            let stream = WebRTCService.localStream;
            if (!stream) {
                stream = await WebRTCService.getLocalStream(false);
            }
            setLocalStream(stream);

            // Start call only if not incoming
            if (userId && !isIncoming) {
                await WebRTCService.startCall(userId, false);
            } else if (isIncoming) {
                // Incoming call is already connected
                setCallState('connected');
                callConnectedTime.current = new Date();
            }
        };
        startCall();

        // Register socket listeners for signaling
        socketService.onCallAnswered((data: any) => {
            console.log('Call answered:', data);
            setCallState('connected');
            callConnectedTime.current = new Date();
            WebRTCService.handleAnswer(data.answer);
        });

        socketService.onIceCandidate((data: any) => {
            console.log('ICE candidate received:', data);
            WebRTCService.handleCandidate(data.candidate);
        });

        socketService.onCallRejected(() => {
            console.log('Call was rejected');
            // Log rejected call
            logCallEnd('rejected');
            navigation.goBack();
        });

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
            socketService.offSignalingEvents();
            // Service cleans up streams on endCall
        };
    }, [userId, isIncoming, navigation]);

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

    const logCallEnd = async (status: 'completed' | 'missed' | 'rejected' | 'busy') => {
        if (!currentUserId || !userId) {
            console.warn('[VideoCall] Missing IDs for logging:', { currentUserId, userId });
            return;
        }

        const endTime = new Date();
        const startTime = callStartTime.current || endTime;
        const connectedTime = callConnectedTime.current;

        // Calculate duration only if call was connected
        let duration = 0;
        if (connectedTime && status === 'completed') {
            duration = Math.floor((endTime.getTime() - connectedTime.getTime()) / 1000);
        }

        // Send IDs as strings directly (matching CallLogPayload UUID migration)
        const callerId = isIncoming ? userId : (currentUserId ? currentUserId.toString() : '');
        const receiverId = isIncoming ? (currentUserId ? currentUserId.toString() : '') : userId;

        if (!callerId || !receiverId) {
            console.warn('[VideoCall] Cannot log call: Missing IDs', {
                userId,
                currentUserId,
                callerId,
                receiverId
            });
            return;
        }

        await CallService.logCall({
            callerId,
            receiverId,
            callType: 'video',
            status,
            duration,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        });
    };

    const handleEndCall = async () => {
        // Log completed call if it was connected, otherwise missed
        const status = callState === 'connected' ? 'completed' : 'missed';
        await logCallEnd(status);
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
                        <Text style={styles.timer}>
                            {callState === 'calling' ? 'Calling...' : callState === 'connected' ? formatTime(seconds) : 'Ringing...'}
                        </Text>
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
