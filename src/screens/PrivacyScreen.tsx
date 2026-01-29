import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Lock, Eye, User, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type PrivacyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Privacy'>;

const PrivacyItem = ({ icon: Icon, title, subtitle, value, onValueChange, type = 'toggle' }: any) => (
    <View style={styles.itemContainer}>
        <View style={styles.itemIcon}>
            <Icon size={22} color={COLORS.black} />
        </View>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
        {type === 'toggle' ? (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: COLORS.lightGray, true: COLORS.black }}
                thumbColor={COLORS.white}
            />
        ) : (
            <Text style={styles.itemValue}>{value}</Text>
        )}
    </View>
);

const PrivacyScreen = () => {
    const navigation = useNavigation<PrivacyScreenNavigationProp>();
    const { t } = useTranslation();
    const [readReceipts, setReadReceipts] = useState(true);
    const [liveLocation, setLiveLocation] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('privacy.sectionPersonalInfo')}</Text>
                    <PrivacyItem
                        icon={Eye}
                        title={t('privacy.lastSeen')}
                        value={t('privacy.everyone')}
                        type="select"
                    />
                    <PrivacyItem
                        icon={User}
                        title={t('privacy.profilePhoto')}
                        value={t('privacy.everyone')}
                        type="select"
                    />
                    <PrivacyItem
                        icon={Info}
                        title={t('privacy.about')}
                        value={t('privacy.myContacts')}
                        type="select"
                    />
                    <PrivacyItem
                        icon={Lock}
                        title={t('privacy.groups')}
                        value={t('privacy.everyone')}
                        type="select"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('privacy.sectionDisappearing')}</Text>
                    <PrivacyItem
                        icon={Eye}
                        title={t('privacy.defaultTimer')}
                        subtitle={t('privacy.defaultTimerDesc')}
                        value={t('privacy.off')}
                        type="select"
                    />
                </View>

                <View style={styles.section}>
                    <PrivacyItem
                        icon={Lock}
                        title={t('privacy.readReceipts')}
                        subtitle={t('privacy.readReceiptsDesc')}
                        value={readReceipts}
                        onValueChange={setReadReceipts}
                    />
                    <PrivacyItem
                        icon={Lock}
                        title={t('privacy.liveLocation')}
                        value={liveLocation}
                        onValueChange={setLiveLocation}
                    />
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkGray,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
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
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    itemValue: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
});

export default PrivacyScreen;
