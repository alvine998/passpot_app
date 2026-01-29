import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/NotificationService';
import { socketService } from '../services/SocketService';

type Login2FAScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login2FA'>;

const Login2FAScreen = () => {
    const navigation = useNavigation<Login2FAScreenNavigationProp>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const { t } = useTranslation();

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            const enteredOtp = newOtp.join('');
            if (enteredOtp === '123456') { // Mock verification
                // Register push token and connect socket for real-time features
                notificationService.registerTokenWithBackend();
                socketService.connect();
                navigation.navigate('MainTabs');
            } else {
                Alert.alert(t('login2FA.invalidCode'), t('login2FA.invalidCodeDesc'));
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('login2FA.title')}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <ShieldCheck size={60} color={COLORS.black} />
                    </View>

                    <Text style={styles.title}>{t('login2FA.header')}</Text>
                    <Text style={styles.instruction}>
                        {t('login2FA.instruction')}
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
                                maxLength={1}
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, otp.some(digit => digit === '') && styles.buttonDisabled]}
                        onPress={() => {
                            if (!otp.some(digit => digit === '')) {
                                if (otp.join('') === '123456') {
                                    notificationService.registerTokenWithBackend();
                                    socketService.connect();
                                    navigation.navigate('MainTabs');
                                }
                                else Alert.alert(t('login2FA.invalidCode'), t('login2FA.invalidCodeDesc'));
                            }
                        }}
                        disabled={otp.some(digit => digit === '')}
                    >
                        <Text style={styles.buttonText}>{t('login2FA.verify')}</Text>
                    </TouchableOpacity>
                </View>
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
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 10,
    },
    instruction: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpInput: {
        width: 45,
        height: 55,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.black,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.black,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    button: {
        backgroundColor: COLORS.black,
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 30,
    },
    buttonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default Login2FAScreen;
