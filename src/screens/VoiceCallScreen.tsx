import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { PhoneOff, Mic, MicOff, Volume2, User } from 'lucide-react-native';
import { WebRTCService } from '../services/WebRTCService';
import { socketService } from '../services/SocketService';
import { CallService } from '../services/CallService';
import { useProfile } from '../context/ProfileContext';
import { MediaStream } from 'react-native-webrtc';

type VoiceCallRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

const VoiceCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<VoiceCallRouteProp>();
    const { userName, userId, isIncoming } = route.params;

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const { id: currentUserId } = useProfile();
    const callStartTime = useRef<Date | null>(null);
    const callConnectedTime = useRef<Date | null>(null);

    useEffect(() => {
        // Record call start time
        callStartTime.current = new Date();

        const startCall = async () => {
            console.log('[VoiceCall] startCall triggered. userId:', userId, 'isIncoming:', isIncoming, 'currentUserId:', currentUserId);
            // Get local stream from service if available, or request it
            let stream = WebRTCService.localStream;
            if (!stream) {
                stream = await WebRTCService.getLocalStream(true);
            }
            setLocalStream(stream);

            // Start the actual call only if not incoming
            if (userId && !isIncoming) {
                await WebRTCService.startCall(userId, true);
            } else if (isIncoming) {
                // Incoming call is already connected
                setCallState('connected');
                callConnectedTime.current = new Date();
            }
        };
        startCall();

        // Register socket listeners for signaling
        socketService.onCallAnswered((data) => {
            console.log('Call answered:', data);
            setCallState('connected');
            callConnectedTime.current = new Date();
            WebRTCService.handleAnswer(data.answer);
        });

        socketService.onIceCandidate((data) => {
            console.log('ICE candidate received:', data);
            WebRTCService.handleCandidate(data.candidate);
        });

        socketService.onCallRejected(() => {
            console.log('Call was rejected');
            // Log rejected call
            logCallEnd('rejected');
            navigation.goBack();
        });

        // Listen for call ended
        WebRTCService.onCallEnded = () => {
            navigation.goBack();
        };

        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            WebRTCService.onCallEnded = null;
            socketService.offSignalingEvents();
            // The service handles stream cleanup on endCall
        };
    }, [userId, isIncoming, navigation]);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        WebRTCService.setAudioEnabled(localStream, !newMuted);
    };

    const logCallEnd = async (status: 'completed' | 'missed' | 'rejected' | 'busy') => {
        if (!currentUserId || !userId) {
            console.warn('[VoiceCall] Missing IDs for logging:', { currentUserId, userId });
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
            console.warn('[VoiceCall] Cannot log call: Missing IDs', {
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
            callType: 'audio',
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.infoContainer}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User size={80} color={COLORS.white} />
                        </View>
                    </View>
                    <Text style={styles.name}>{userName}</Text>
                    <Text style={styles.status}>
                        {callState === 'calling' ? 'Calling...' : callState === 'connected' ? formatTime(seconds) : 'Ringing...'}
                    </Text>
                </View>

                <View style={styles.controlsContainer}>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                            onPress={toggleMute}
                        >
                            {isMuted ? <MicOff size={28} color={COLORS.black} /> : <Mic size={28} color={COLORS.white} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
                            onPress={() => setIsSpeaker(!isSpeaker)}
                        >
                            <Volume2 size={28} color={isSpeaker ? COLORS.black : COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={handleEndCall}
                    >
                        <PhoneOff size={32} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: SPACING.xl * 2,
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    avatarContainer: {
        marginBottom: SPACING.xl,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    name: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: SPACING.sm,
    },
    status: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
    },
    controlsContainer: {
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: SPACING.xl * 2,
    },
    controlButton: {
        width: 65,
        height: 65,
        borderRadius: 33,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: COLORS.white,
    },
    endButton: {
        width: 75,
        height: 75,
        borderRadius: 38,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VoiceCallScreen;
