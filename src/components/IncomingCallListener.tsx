import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { socketService } from '../services/SocketService';
import { WebRTCService } from '../services/WebRTCService';
import { COLORS, SPACING } from '../styles/theme';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { navigationRef } from '../../App';

interface IncomingCallData {
    callerId: number;
    offer: any;
    type: 'audio' | 'video';
    callerName?: string; // Optional if backend provides it, otherwise we might just show "Incoming Call" or fetch profile
}

const IncomingCallListener = () => {
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);

    useEffect(() => {
        // Listen for incoming calls
        socketService.onIncomingCall((data) => {
            console.log('Incoming call received:', data);
            setIncomingCall({
                callerId: data.from,
                offer: data.offer,
                type: data.type || 'audio',
                callerName: data.callerName || 'Unknown Caller'
            });
        });

        // Listen for call ended (remotely)
        socketService.onCallEnded((data) => {
            console.log('Call ended remotely:', data);
            setIncomingCall(null);
        });

        return () => {
            socketService.offSignalingEvents();
        };
    }, []);

    const handleAccept = async () => {
        if (!incomingCall) return;

        const { callerId, offer, type, callerName } = incomingCall;

        // Hide modal
        setIncomingCall(null);

        // Handle WebRTC answer logic
        await WebRTCService.handleIncomingCall(offer, callerId, type === 'audio');

        // Navigate to appropriate screen
        if (navigationRef.isReady()) {
            if (type === 'video') {
                navigationRef.navigate('VideoCall', {
                    userId: callerId.toString(),
                    userName: callerName || 'Caller',
                    isIncoming: true
                });
            } else {
                navigationRef.navigate('VoiceCall', {
                    userId: callerId.toString(),
                    userName: callerName || 'Caller',
                    isIncoming: true
                });
            }
        }
    };

    const handleReject = () => {
        if (incomingCall) {
            socketService.rejectCall(incomingCall.callerId);
            setIncomingCall(null);
        }
    };

    if (!incomingCall) return null;

    return (
        <Modal
            visible={!!incomingCall}
            transparent={true}
            animationType="slide"
            onRequestClose={handleReject}
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</Text>
                    <Text style={styles.name}>{incomingCall.callerName}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleReject}>
                            <PhoneOff size={32} color={COLORS.white} />
                            <Text style={styles.buttonText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={handleAccept}>
                            {incomingCall.type === 'video' ? (
                                <Video size={32} color={COLORS.white} />
                            ) : (
                                <Phone size={32} color={COLORS.white} />
                            )}
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.xl,
        alignItems: 'center',
        elevation: 5,
    },
    title: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginBottom: SPACING.sm,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.xl * 2,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.success,
        marginBottom: SPACING.xs,
    },
    rejectButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.danger,
        marginBottom: SPACING.xs,
    },
    buttonText: {
        marginTop: SPACING.xs,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.black,
    }
});

export default IncomingCallListener;
