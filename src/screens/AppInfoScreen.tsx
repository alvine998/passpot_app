import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react-native';

const AppInfoScreen = () => {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <Header title={t('appInfo.title')} showSearch={false} />
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Shield size={60} color={COLORS.white} />
                    </View>
                    <Text style={styles.appName}>Passpot</Text>
                    <Text style={styles.version}>{t('help.version')} 1.3.2</Text>
                </View>

                <Text style={styles.description}>
                    {t('appInfo.desc')}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.copyright}>© 2026 Passpot Inc.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    version: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 4,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.black,
        textAlign: 'center',
        marginTop: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    copyright: {
        fontSize: 12,
        color: COLORS.gray,
    },
});

export default AppInfoScreen;
