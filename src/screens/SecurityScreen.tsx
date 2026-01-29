import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Shield, Smartphone, ExternalLink } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type SecurityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Security'>;

const SecurityScreen = () => {
    const navigation = useNavigation<SecurityScreenNavigationProp>();
    const { t } = useTranslation();
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    const handleToggle2FA = (value: boolean) => {
        if (value) {
            navigation.navigate('Setup2FA', { isOnboarding: false });
        } else {
            setIs2FAEnabled(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('security.title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, { alignItems: 'center', paddingVertical: SPACING.xl }]}>
                    <View style={styles.iconCircle}>
                        <Shield size={40} color={COLORS.white} />
                    </View>
                    <Text style={styles.sectionHeading}>{t('security.protected')}</Text>
                    <Text style={styles.sectionDescription}>
                        {t('security.description')}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>{t('security.twoStep')}</Text>
                    <View style={styles.item}>
                        <View style={styles.itemIcon}>
                            <Smartphone size={22} color={COLORS.black} />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>{t('security.authenticator')}</Text>
                            <Text style={styles.itemSubtitle}>{t('security.authenticatorDesc')}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: COLORS.lightGray, true: COLORS.black }}
                            thumbColor={COLORS.white}
                            onValueChange={handleToggle2FA}
                            value={is2FAEnabled}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>{t('security.encryption')}</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            {t('security.encryptionDesc')}
                        </Text>
                        <TouchableOpacity style={styles.learnMore}>
                            <Text style={styles.learnMoreText}>{t('security.learnMore')}</Text>
                            <ExternalLink size={14} color={COLORS.black} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
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
    section: {
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.lg,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
        textAlign: 'center',
    },
    sectionDescription: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: SPACING.xs,
        lineHeight: 20,
        paddingHorizontal: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkGray,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
    },
    itemIcon: {
        width: 40,
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: SPACING.sm,
        marginRight: SPACING.sm,
    },
    itemTitle: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    infoBox: {
        backgroundColor: '#F8F9FA',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.xs,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.darkGray,
        lineHeight: 20,
    },
    learnMore: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    learnMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.black,
    },
});

export default SecurityScreen;
