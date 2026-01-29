import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import normalize from 'react-native-normalize';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    {/* <ShieldCheck size={80} color={COLORS.black} strokeWidth={1.5} /> */}

                    {/* <Text style={styles.title}>{t('welcome.title')}</Text> */}
                    <Image source={require('../assets/images/passpot_col_black-removebg.png')} style={{ width: 300, height: 300 }} />
                    {/* <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text> */}
                </View>

                <View style={styles.illustration}>
                    {/* Placeholder for a premium graphic or just minimalist text */}
                    <Text style={styles.securityText}>{t('welcome.securityText')}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.termsText}>
                    {t('welcome.termsText')}
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('LoginEmail')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{t('welcome.agreeButton')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: normalize(-150)
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: SPACING.md,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginTop: SPACING.xs,
    },
    illustration: {
        marginTop: normalize(-70),
        padding: SPACING.md,
        backgroundColor: COLORS.gray,
        borderRadius: 20,
    },
    securityText: {
        fontSize: 12,
        color: COLORS.black,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: SPACING.xl,
    },
    termsText: {
        fontSize: 12,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 18,
    },
    button: {
        backgroundColor: COLORS.black,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default WelcomeScreen;
