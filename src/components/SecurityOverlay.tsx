import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { Lock, Fingerprint, ShieldAlert, Smartphone, Key } from 'lucide-react-native';
import { BiometricService } from '../services/BiometricService';
import { useProfile } from '../context/ProfileContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { api } from '../services/ApiService';

interface SecurityOverlayProps {
    isVisible: boolean;
    onUnlock: () => void;
    onCancel?: () => void;
    title?: string;
}

const SecurityOverlay = ({ isVisible, onUnlock, onCancel, title = 'Encrypted Chat' }: SecurityOverlayProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { securityPIN } = useProfile();
    const [biometryType, setBiometryType] = React.useState<string | null>(null);
    const [unlockMode, setUnlockMode] = useState<'biometric' | 'pin'>('biometric');
    const [pinInput, setPinInput] = useState(['', '', '', '', '', '']);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const pinInputRefs = useRef<Array<TextInput | null>>([]);

    React.useEffect(() => {
        const checkType = async () => {
            const type = await BiometricService.getBiometryType();
            setBiometryType(type);
        };
        checkType();
    }, []);

    React.useEffect(() => {
        if (!isVisible) {
            setUnlockMode('biometric');
            setPinInput(['', '', '', '', '', '']);
            setIsVerifying(false);
        }
    }, [isVisible]);

    const handleAuthenticate = async () => {
        const success = await BiometricService.authenticate(`Unlock ${title}`);
        if (success) {
            onUnlock();
        }
    };

    const verifyPinWithApi = async (pin: string) => {
        setIsVerifying(true);
        try {
            await api.post('/auth/verify-pin', { pin });
            setFailedAttempts(0);
            onUnlock();
        } catch (error: any) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if (newAttempts >= 3) {
                Alert.alert(
                    t('security.alertTitle'),
                    t('security.tooManyAttempts'),
                    [{
                        text: 'OK',
                        onPress: () => {
                            setPinInput(['', '', '', '', '', '']);
                            setFailedAttempts(0);
                            navigation.replace('Welcome');
                        }
                    }]
                );
            } else {
                Alert.alert(
                    t('security.incorrectPin'),
                    error.message || t('security.attemptsRemaining', { count: 3 - newAttempts }),
                    [{
                        text: t('security.tryAgain'),
                        onPress: () => {
                            setPinInput(['', '', '', '', '', '']);
                            pinInputRefs.current[0]?.focus();
                        }
                    }]
                );
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePinChange = (value: string, index: number) => {
        if (isVerifying) return;

        const newPin = [...pinInput];
        newPin[index] = value;
        setPinInput(newPin);

        if (value.length !== 0 && index < 5) {
            pinInputRefs.current[index + 1]?.focus();
        }

        if (index === 5 && value.length === 1) {
            const fullPin = newPin.join('');
            if (fullPin.length === 6) {
                verifyPinWithApi(fullPin);
            }
        }
    };

    const handlePinKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && pinInput[index] === '' && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    };

    const getIcon = () => {
        if (biometryType === 'FaceID') return <Smartphone size={24} color={COLORS.white} />;
        return <Fingerprint size={24} color={COLORS.white} />;
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.promptContent}
                >
                    <View style={styles.iconContainer}>
                        {unlockMode === 'biometric' ? (
                            <Fingerprint size={30} color={COLORS.black} strokeWidth={1.5} />
                        ) : (
                            <Key size={30} color={COLORS.black} strokeWidth={1.5} />
                        )}
                    </View>
                    <Text style={styles.title}>{unlockMode === 'biometric' ? t('security.overlayTitle') : t('security.enterPinTitle')}</Text>
                    <Text style={styles.subtitle}>
                        {unlockMode === 'biometric'
                            ? t('security.biometricSubtitle', { type: biometryType || 'Biometrics', title: title.toLowerCase() })
                            : t('security.enterPinSubtitle')}
                    </Text>

                    {unlockMode === 'biometric' ? (
                        <>
                            <TouchableOpacity
                                style={styles.unlockButton}
                                onPress={handleAuthenticate}
                                activeOpacity={0.8}
                            >
                                {getIcon()}
                                <Text style={styles.unlockButtonText}>
                                    {t('security.unlockWith', { type: biometryType?.toUpperCase() || 'BIOMETRICS' })}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.textOptionButton}
                                onPress={() => setUnlockMode('pin')}
                            >
                                <Text style={styles.textOptionText}>{t('security.usePin')}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.pinGrid}>
                                {pinInput.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { pinInputRefs.current[index] = ref; }}
                                        style={styles.pinInput}
                                        value={digit}
                                        onChangeText={(v) => handlePinChange(v, index)}
                                        onKeyPress={(e) => handlePinKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        secureTextEntry
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.textOptionButton}
                                onPress={() => setUnlockMode('biometric')}
                            >
                                <Text style={styles.textOptionText}>{t('security.useBiometrics')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity onPress={onCancel || onUnlock} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>{t('security.cancel')}</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    promptContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        padding: SPACING.xl,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: SPACING.xs,
        marginBottom: SPACING.xl,
    },
    unlockButton: {
        width: '100%',
        backgroundColor: COLORS.black,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: 30,
        marginBottom: SPACING.md,
    },
    unlockButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        marginLeft: SPACING.sm,
        letterSpacing: 1,
    },
    textOptionButton: {
        paddingVertical: SPACING.md,
        width: '100%',
        alignItems: 'center',
    },
    textOptionText: {
        color: COLORS.black,
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 1,
    },
    pinGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.xl,
    },
    pinInput: {
        width: 40,
        height: 50,
        borderWidth: 1.5,
        borderColor: COLORS.lightGray,
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        backgroundColor: '#F8F9FA',
    },
    cancelButton: {
        paddingVertical: SPACING.sm,
        marginTop: SPACING.sm,
    },
    cancelButtonText: {
        color: COLORS.darkGray,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default SecurityOverlay;
