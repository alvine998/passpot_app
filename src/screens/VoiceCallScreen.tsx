import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { PhoneOff, Mic, MicOff, Volume2, User } from 'lucide-react-native';
import { WebRTCService } from '../services/WebRTCService';
import { MediaStream } from 'react-native-webrtc';

type VoiceCallRouteProp = RouteProp<RootStackParamList, 'VoiceCall'>;

const VoiceCallScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<VoiceCallRouteProp>();
    const { userName } = route.params;

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startStream = async () => {
            stream = await WebRTCService.getLocalStream(true);
            setLocalStream(stream);
        };
        startStream();

        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
            WebRTCService.stopStream(stream);
        };
    }, []);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        WebRTCService.setAudioEnabled(localStream, !newMuted);
    };

    const handleEndCall = () => {
        WebRTCService.stopStream(localStream);
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
                    <Text style={styles.status}>{seconds === 0 ? 'Calling...' : formatTime(seconds)}</Text>
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
