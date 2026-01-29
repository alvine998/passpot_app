import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/ApiService';
import { notificationService } from '../services/NotificationService';
import { socketService } from '../services/SocketService';

type SetupPINScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetupPIN'>;
type SetupPINScreenRouteProp = RouteProp<RootStackParamList, 'SetupPIN'>;

const SetupPINScreen = () => {
    const navigation = useNavigation<SetupPINScreenNavigationProp>();
    const route = useRoute<SetupPINScreenRouteProp>();
    const { isOnboarding, email } = route.params;
    const { t } = useTranslation();
    const { setSecurityPIN } = useProfile();
    const { login } = useAuth();

    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handlePinChange = (value: string, index: number) => {
        if (isLoading) return;

        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value.length !== 0 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSave = async () => {
        const securityPin = pin.join('');
        if (securityPin.length < 6) {
            Alert.alert(t('common.error'), 'Please enter a 6-digit PIN');
            return;
        }

        setIsLoading(true);
        try {
            // Call API to setup PIN with explicit auth header
            const token = await api.getAuthToken();
            console.log('token = ', token ?? "---token---")
            await api.post('/auth/setup-pin', { pin: securityPin }, {
                'Authorization': `Bearer ${token}`
            });

            // Save locally as well
            setSecurityPIN(securityPin);

            // Persist login state if onboarding
            if (isOnboarding && email) {
                await login(email);
            }

            Alert.alert(
                t('setupPin.successTitle'),
                t('setupPin.successDesc'),
                [{
                    text: isOnboarding ? t('common.startChatting') : t('common.great'),
                    onPress: async () => {
                        if (isOnboarding) {
                            // Register push token and connect socket for real-time features
                            await notificationService.registerTokenWithBackend();
                            await socketService.connect();
                        }
                        navigation.navigate(isOnboarding ? 'MainTabs' : 'Settings');
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert(
                t('common.error', 'Error'),
                error.message || t('setupPin.error', 'Failed to setup PIN. Please try again.')
            );
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
                {!isOnboarding && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isLoading}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{t('setupPin.title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Lock size={60} color={COLORS.black} strokeWidth={1.5} />
                    </View>

                    <Text style={styles.title}>{t('setupPin.setPin')}</Text>
                    <Text style={styles.description}>
                        {t('setupPin.description')}
                    </Text>

                    <View style={styles.pinContainer}>
                        {pin.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={styles.pinInput}
                                value={digit}
                                onChangeText={(value) => handlePinChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                secureTextEntry={true}
                                selectTextOnFocus
                                editable={!isLoading}
                            />
                        ))}
                    </View>

                    <View style={styles.flexSpacer} />

                    <TouchableOpacity
                        style={[styles.saveButton, (pin.join('').length < 6 || isLoading) && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={pin.join('').length < 6 || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>{t('setupPin.saveContinue')}</Text>
                        )}
                    </TouchableOpacity>
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
        marginTop: SPACING.xl,
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
        marginBottom: SPACING.xl * 2,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.lg,
    },
    pinInput: {
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
    flexSpacer: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: COLORS.black,
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
    },
    saveButtonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SetupPINScreen;
