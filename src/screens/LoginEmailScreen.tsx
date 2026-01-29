import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../services/ApiService';

type LoginEmailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginEmail'>;

const LoginEmailScreen = () => {
    const navigation = useNavigation<LoginEmailScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const handleNext = async () => {
        if (!email.includes('@')) return;

        setIsLoading(true);
        try {
            await api.post('/auth/request-otp', { email });
            navigation.navigate('VerifyOTP', { email });
        } catch (error: any) {
            Alert.alert(
                t('common.error', 'Error'),
                error.message || t('loginEmail.otpError', 'Failed to send OTP. Please try again.')
            );
        } finally {
            setIsLoading(false);
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
                    <Text style={styles.headerTitle}>{t('loginEmail.title')}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <Mail size={50} color={COLORS.black} />
                    </View>

                    <Text style={styles.instruction}>
                        {t('loginEmail.description')}
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.emailInput}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('loginEmail.placeholder')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoFocus
                            editable={!isLoading}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.button, (!email || !email.includes('@') || isLoading) && styles.buttonDisabled]}
                        onPress={handleNext}
                        disabled={!email || !email.includes('@') || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>{t('loginEmail.button').toUpperCase()}</Text>
                        )}
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
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 40,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
    },
    instruction: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    inputContainer: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.black,
        paddingVertical: 10,
    },
    emailInput: {
        fontSize: 18,
        color: COLORS.black,
        padding: 0,
        textAlign: 'left',
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

export default LoginEmailScreen;
