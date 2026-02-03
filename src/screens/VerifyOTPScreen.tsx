import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/ApiService';
import { useProfile } from '../context/ProfileContext';
import normalize from 'react-native-normalize';

type VerifyOTPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VerifyOTP'>;
type VerifyOTPScreenRouteProp = RouteProp<RootStackParamList, 'VerifyOTP'>;

interface AuthStatusResponse {
    success: boolean;
    data: {
        pinSet: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret?: string;
    };
}

const VerifyOTPScreen = () => {
    const navigation = useNavigation<VerifyOTPScreenNavigationProp>();
    const route = useRoute<VerifyOTPScreenRouteProp>();
    const { email } = route.params;
    const { t } = useTranslation();
    const { fetchProfile } = useProfile();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const verifyOtp = async (otpCode: string) => {
        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean; data: { token: string, user: { twoFactorEnabled: boolean, pinSet: boolean, twoFactorSecret: string } } }>('/auth/verify-otp', { email, otp: otpCode });
            console.log('Auth status:', response.data);
            // Store token if returned
            if (response.data.data.user.twoFactorSecret) {
                api.setAuthToken(response.data.data.token);
                // Fetch auth status to check 2FA and PIN status
                try {

                    if (response.data.data.user.twoFactorSecret) {
                        navigation.navigate('Verify2FA', {
                            secret: response.data.data.user.twoFactorSecret || '',
                            isOnboarding: true,
                            email
                        });
                    } else if (response.data.data.user.pinSet) {
                        navigation.navigate('VerifyPIN', { email });
                    } else {
                        navigation.navigate('Setup2FA', { isOnboarding: true, email });
                    }

                    // Also sync profile in background
                    fetchProfile().catch(console.error);
                } catch (statusError) {
                    console.error('Error fetching auth status after OTP:', statusError);
                    navigation.navigate('Setup2FA', { isOnboarding: true, email });
                }
            } else {
                navigation.navigate('Setup2FA', { isOnboarding: true, email });
            }
        } catch (error: any) {
            Alert.alert(
                t('common.error', 'Error'),
                error.message || t('verifyOTP.invalidOtp', 'Invalid OTP. Please try again.')
            );
            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (text: string, index: number) => {
        if (isLoading) return;

        if (text.length > 1) {
            const pastedData = text.split('');
            const newOtp = [...otp];
            let lastIndex = index;

            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                    lastIndex = index + i;
                }
            }
            setOtp(newOtp);

            if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
                const enteredOtp = newOtp.join('');
                verifyOtp(enteredOtp);
            } else if (lastIndex < 5) {
                inputRefs.current[lastIndex + 1]?.focus();
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            const enteredOtp = newOtp.join('');
            verifyOtp(enteredOtp);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/request-otp', { email });
            setTimer(60);
            Alert.alert(
                t('common.success', 'Success'),
                t('verifyOTP.otpResent', 'A new OTP has been sent to your email.')
            );
        } catch (error: any) {
            Alert.alert(
                t('common.error', 'Error'),
                error.message || t('verifyOTP.resendError', 'Failed to resend OTP. Please try again.')
            );
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isLoading}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('verifyOTP.title', { email })}</Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <MoreVertical size={24} color={COLORS.black} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.instruction}>
                        {t('verifyOTP.instruction', { email })}
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={6}
                                autoFocus={index === 0}
                                editable={!isLoading}
                            />
                        ))}
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.black} style={{ marginBottom: 20 }} />
                    ) : (
                        <Text style={styles.resendText}>
                            {t('verifyOTP.enterCode')}
                        </Text>
                    )}

                    {timer > 0 ? (
                        <Text style={styles.timer}>{t('verifyOTP.timer', { time: formatTimer(timer) })}</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                            <Text style={styles.resendLink}>{t('verifyOTP.resendLink')}</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
    },
    backButton: {
        marginRight: SPACING.lg,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    moreButton: {
        padding: SPACING.xs,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
    },
    instruction: {
        fontSize: 14,
        color: COLORS.black,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    link: {
        color: '#007AFF',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 40,
        height: 50,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.black,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.black,
    },
    resendText: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 20,
    },
    timer: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
    resendLink: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default VerifyOTPScreen;
