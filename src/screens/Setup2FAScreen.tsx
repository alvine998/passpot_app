import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Copy, Shield, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Clipboard, Linking } from 'react-native';
import { api } from '../services/ApiService';

import QRCode from 'react-native-qrcode-svg';

type Setup2FAScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Setup2FA'>;
type Setup2FAScreenRouteProp = RouteProp<RootStackParamList, 'Setup2FA'>;

interface Setup2FAResponse {
    secret: string;
    otpauthUrl?: string;
    qrCodeUrl?: string;
}

const Setup2FAScreen = () => {
    const navigation = useNavigation<Setup2FAScreenNavigationProp>();
    const route = useRoute<Setup2FAScreenRouteProp>();
    const isOnboarding = route.params?.isOnboarding;
    const email = route.params?.email;
    const { t } = useTranslation();

    const [secretKey, setSecretKey] = useState<string>('');
    const [otpauthUrl, setOtpauthUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch 2FA setup data from API
    useEffect(() => {
        const setup2FA = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.post<{ success: boolean; data: Setup2FAResponse }>('/auth/setup-2fa', { email });

                if (response.data?.data?.secret) {
                    const setupData = response.data.data;
                    setSecretKey(setupData.secret);
                    // Use provided otpauthUrl or construct one
                    const authUrl = setupData.otpauthUrl ||
                        `otpauth://totp/Passpot:${email}?secret=${setupData.secret}&issuer=Passpot`;
                    setOtpauthUrl(authUrl);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err: any) {
                console.error('Error setting up 2FA:', err);
                setError(err.message || t('setup2FA.error', 'Failed to setup 2FA. Please try again.'));
            } finally {
                setIsLoading(false);
            }
        };

        if (email) {
            setup2FA();
        } else {
            setError(t('setup2FA.noEmail', 'Email is required for 2FA setup.'));
            setIsLoading(false);
        }
    }, [email, t]);

    const handleCopySecret = () => {
        if (secretKey) {
            Clipboard.setString(secretKey);
            Alert.alert(
                t('common.success', 'Success'),
                t('setup2FA.secretCopied', 'Secret key copied to clipboard!')
            );
        }
    };

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        // Re-trigger the effect
        const setup2FA = async () => {
            try {
                const response = await api.post<{ success: boolean; data: Setup2FAResponse }>('/auth/setup-2fa', { email });
                if (response.data?.data?.secret) {
                    const setupData = response.data.data;
                    setSecretKey(setupData.secret);
                    const authUrl = setupData.otpauthUrl ||
                        `otpauth://totp/Passpot:${email}?secret=${setupData.secret}&issuer=Passpot`;
                    setOtpauthUrl(authUrl);
                }
            } catch (err: any) {
                setError(err.message || t('setup2FA.error', 'Failed to setup 2FA. Please try again.'));
            } finally {
                setIsLoading(false);
            }
        };
        setup2FA();
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isOnboarding ? t('setup2FA.titleOnboarding') : t('setup2FA.title')}</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>{t('setup2FA.loading', 'Setting up 2FA...')}</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isOnboarding ? t('setup2FA.titleOnboarding') : t('setup2FA.title')}</Text>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>{t('common.retry', 'Retry')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isOnboarding ? t('setup2FA.titleOnboarding') : t('setup2FA.title')}</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.stepContainer}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepTitle}>{t('setup2FA.step1')}</Text>
                    <Text style={styles.stepDescription}>
                        {t('setup2FA.step1Desc')}
                    </Text>

                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={otpauthUrl}
                                size={180}
                                color={COLORS.black}
                                backgroundColor={COLORS.white}
                            />
                        </View>
                        <Text style={styles.scanText}>{t('setup2FA.scanText')}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.openAuthButton}
                    onPress={() => {
                        if (otpauthUrl) {
                            Linking.openURL(otpauthUrl).catch(err => {
                                console.error('Failed to open URL:', err);
                                Alert.alert(t('common.error'), t('setup2FA.openAuthError', 'Could not open Authenticator app'));
                            });
                        }
                    }}
                >
                    <Shield size={20} color={COLORS.black} style={{ marginRight: 8 }} />
                    <Text style={styles.openAuthButtonText}>{t('setup2FA.openApp', 'Open Authenticator App')}</Text>
                </TouchableOpacity>



                <View style={[styles.stepContainer, { marginTop: SPACING.xl }]}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepTitle}>{t('setup2FA.step2')}</Text>
                    <Text style={styles.stepDescription}>
                        {t('setup2FA.step2Desc')}
                    </Text>

                    <View style={styles.secretBox}>
                        <Text style={styles.secretKey}>{secretKey}</Text>
                        <TouchableOpacity style={styles.copyButton} onPress={handleCopySecret}>
                            <Copy size={20} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Info size={18} color={COLORS.darkGray} />
                    <Text style={styles.infoText}>
                        {t('setup2FA.infoText')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => navigation.navigate('Verify2FA', { secret: secretKey, isOnboarding, email })}
                >
                    <Text style={styles.nextButtonText}>{t('setup2FA.next')}</Text>
                </TouchableOpacity>
            </ScrollView >
        </View >
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
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    stepContainer: {
        alignItems: 'center',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    stepNumberText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    stepDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.lg,
    },
    qrContainer: {
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    qrWrapper: {
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    scanText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.darkGray,
        marginTop: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    secretBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        padding: SPACING.md,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'space-between',
    },
    secretKey: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.black,
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    copyButton: {
        padding: SPACING.xs,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF9E6',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.xl,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.darkGray,
        marginLeft: SPACING.sm,
        lineHeight: 18,
    },
    nextButton: {
        backgroundColor: COLORS.black,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    nextButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: 16,
        color: COLORS.darkGray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    retryButton: {
        backgroundColor: COLORS.black,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 25,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    openAuthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    openAuthButtonText: {
        color: COLORS.black,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default Setup2FAScreen;
