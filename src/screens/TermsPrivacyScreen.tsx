import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { useTranslation } from 'react-i18next';

const TermsPrivacyScreen = () => {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <Header title={t('termsPrivacy.title')} showSearch={false} />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.text}>
                    {t('termsPrivacy.content')}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        padding: SPACING.lg,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: COLORS.black,
    },
});

export default TermsPrivacyScreen;
