import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Bell, Lock, Shield, CircleHelp, LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, Alert } from 'react-native';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { t } = useTranslation();
    const { name, photo } = useProfile();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            t('profile.logout', 'Log Out'),
            t('profile.logoutConfirmation', 'Are you sure you want to logout?'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('profile.logout', 'Log Out'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            })
                        );
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon: Icon, title, subtitle, onPress, type = 'chevron' }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.itemIcon}>
                <Icon size={22} color={COLORS.black} />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            {type === 'switch' ? (
                <Switch
                    trackColor={{ false: COLORS.lightGray, true: COLORS.black }}
                    thumbColor={COLORS.white}
                    value={true}
                    disabled // Make it disabled for mock
                />
            ) : (
                <View style={styles.chevron} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Chats')} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                <TouchableOpacity
                    style={styles.profileSection}
                    onPress={() => navigation.navigate('EditProfile')}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarLarge}>
                        {photo ? (
                            <Image source={{ uri: photo }} style={styles.avatarImage} />
                        ) : (
                            <User size={40} color={COLORS.white} />
                        )}
                    </View>
                    <Text style={styles.profileName}>{name}</Text>
                    <Text style={styles.profileStatus}>Securely connected</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <SettingItem
                        icon={User}
                        title={t('profile.settingProfile')}
                        subtitle={t('profile.settingProfileSub')}
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <SettingItem
                        icon={Lock}
                        title={t('profile.settingPrivacy')}
                        subtitle={t('profile.settingPrivacySub')}
                        onPress={() => navigation.navigate('Privacy')}
                    />
                    {/* <SettingItem icon={Shield} title={t('profile.settingSecurity')} subtitle={t('profile.settingSecuritySub')} onPress={() => navigation.navigate('Security')} /> */}
                    <SettingItem
                        icon={Bell}
                        title={t('profile.settingNotifications')}
                        subtitle={t('profile.settingNotificationsSub')}
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <SettingItem
                        icon={CircleHelp}
                        title={t('profile.settingHelp')}
                        subtitle={t('profile.settingHelpSub')}
                        onPress={() => navigation.navigate('Help')}
                    />
                </View>

                <View style={styles.section}>
                    <SettingItem icon={LogOut} title={t('profile.logout')} onPress={handleLogout} />
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
    },
    profileStatus: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: SPACING.xs,
    },
    section: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
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
    },
    itemTitle: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 13,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    chevron: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.lightGray,
    },
});

export default SettingsScreen;
