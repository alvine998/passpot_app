import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

type Verify2FAScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Verify2FA'>;
type Verify2FAScreenRouteProp = RouteProp<RootStackParamList, 'Verify2FA'>;

const Verify2FAScreen = () => {
    const navigation = useNavigation<Verify2FAScreenNavigationProp>();
    const route = useRoute<Verify2FAScreenRouteProp>();
    const { secret, isOnboarding, email } = route.params;
    const { t } = useTranslation();
    const { logout } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        if (isLoading) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value.length !== 0 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const token = otp.join('');
        if (token.length < 6) {
            Alert.alert(t('verify2FA.error'), t('verify2FA.errorDesc'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean; data: { token: string, user: { twoFactorEnabled: boolean, pinSet: boolean } } }>('/auth/verify-2fa', { email, token });

            // Store auth token if returned
            if (response.data?.data?.token) {
                await api.setAuthToken(response.data.data.token);
            }

            console.log('Auth token:', response.data.data);

            Alert.alert(
                t('verify2FA.success'),
                isOnboarding
                    ? t('verify2FA.enabledOnboarding')
                    : t('verify2FA.enabledSecurity'),
                [{
                    text: t('common.continue', 'Continue'),
                    onPress: async () => {
                        if (isOnboarding) {
                            try {
                                if (response.data.data.user.pinSet) {
                                    navigation.navigate('VerifyPIN', { email });
                                } else {
                                    navigation.navigate('SetupPIN', { isOnboarding: true, email });
                                }
                            } catch {
                                navigation.navigate('SetupPIN', { isOnboarding: true, email });
                            }
                        } else {
                            navigation.navigate('Security');
                        }
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert(
                t('verify2FA.invalidCode'),
                t('security.contactAdmin'),
                [{
                    text: t('common.back', 'Back'),
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoginEmail' }],
                        });
                    }
                }]
            );
            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isLoading}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('verify2FA.headerTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <CheckCircle2 size={60} color={COLORS.black} />
                    </View>

                    <Text style={styles.title}>{t('verify2FA.title')}</Text>
                    <Text style={styles.description}>
                        {t('verify2FA.description')}
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!isLoading}
                            />
                        ))}
                    </View>

                    {/* <Text style={styles.secretHint}>{t('verify2FA.secret')}: {secret}</Text> */}

                    <View style={styles.flexSpacer} />

                    <TouchableOpacity
                        style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.verifyButtonText}>{t('verify2FA.button')}</Text>
                        )}
                    </TouchableOpacity>

                    {!isOnboarding && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.navigate('Security')}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>{t('verify2FA.cancel')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.lg,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: COLORS.lightGray,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
        backgroundColor: '#F8F9FA',
    },
    secretHint: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: SPACING.sm,
    },
    flexSpacer: {
        flex: 1,
    },
    verifyButton: {
        backgroundColor: COLORS.black,
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    verifyButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    verifyButtonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    cancelButton: {
        marginTop: SPACING.md,
        padding: SPACING.sm,
    },
    cancelButtonText: {
        color: COLORS.darkGray,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default Verify2FAScreen;
