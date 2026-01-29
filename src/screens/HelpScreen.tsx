import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, HelpCircle, MessageSquare, BookOpen, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type HelpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Help'>;

const HelpItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.itemIcon}>
            <Icon size={22} color={COLORS.black} />
        </View>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
    </TouchableOpacity>
);

const HelpScreen = () => {
    const navigation = useNavigation<HelpScreenNavigationProp>();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('help.title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <HelpItem
                        icon={MessageSquare}
                        title={t('help.contactUs')}
                        subtitle={t('help.contactUsDesc')}
                        onPress={() => Linking.openURL('mailto:cs@passpotapp.com')}
                    />
                    <HelpItem
                        icon={BookOpen}
                        title={t('help.termsPrivacy')}
                        onPress={() => navigation.navigate('TermsPrivacy')}
                    />
                    <HelpItem
                        icon={Info}
                        title={t('help.appInfo')}
                        onPress={() => navigation.navigate('AppInfo')}
                    />
                </View>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>{t('help.version')} 1.0.3 (2026)</Text>
                    <Text style={styles.copyrightText}>© 2026 Passpot Inc.</Text>
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
        paddingVertical: SPACING.md,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: SPACING.lg,
    },
    itemIcon: {
        width: 40,
        marginRight: SPACING.md,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    itemSubtitle: {
        fontSize: 13,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    versionContainer: {
        marginTop: 40,
        alignItems: 'center',
        padding: SPACING.lg,
    },
    versionText: {
        fontSize: 14,
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    copyrightText: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
    },
});

export default HelpScreen;
