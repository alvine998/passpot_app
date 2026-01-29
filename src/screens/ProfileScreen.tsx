import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { User, Bell, Lock, Shield, CircleHelp, LogOut, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { t } = useTranslation();
    const { name, photo, pin, isLoading, error, fetchProfile } = useProfile();
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
                    disabled
                />
            ) : (
                <View style={styles.chevron} />
            )}
        </TouchableOpacity>
    );

    if (isLoading && !name) {
        return (
            <View style={styles.container}>
                <Header title={t('profile.title')} showSearch={false} />
                <View style={[styles.content, styles.centerContent]}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                    <Text style={styles.loadingText}>{t('common.loading', 'Loading profile...')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title={t('profile.title')} showSearch={false} />

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={fetchProfile}
                        colors={[COLORS.black]}
                        tintColor={COLORS.black}
                    />
                }
            >
                {error && (
                    <TouchableOpacity style={styles.errorBanner} onPress={fetchProfile}>
                        <Text style={styles.errorText}>{error}</Text>
                        <RefreshCw size={14} color={COLORS.white} />
                    </TouchableOpacity>
                )}

                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        {photo ? (
                            <Image source={{ uri: photo }} style={styles.avatarImage} />
                        ) : (
                            <User size={40} color={COLORS.white} />
                        )}
                    </View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.id}>ID PASSPOT: {pin}</Text>
                </View>

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
    content: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.darkGray,
    },
    errorBanner: {
        backgroundColor: COLORS.danger,
        padding: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    errorText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    avatar: {
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
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
    },
    id: {
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

export default ProfileScreen;
