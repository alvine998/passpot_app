import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, MessageSquare, Phone, Video, MoreVertical, User, MapPin, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import normalize from 'react-native-normalize';

type FriendProfileRouteProp = RouteProp<RootStackParamList, 'FriendProfile'>;
type FriendProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FriendProfile'>;

const FriendProfileScreen = () => {
    const route = useRoute<FriendProfileRouteProp>();
    const navigation = useNavigation<FriendProfileNavigationProp>();
    const { t } = useTranslation();
    const { name, id } = route.params;

    const ProfileAction = ({ icon: Icon, label, onPress, color = COLORS.black }: any) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconContainer, { backgroundColor: color + '10' }]}>
                <Icon size={24} color={color} />
            </View>
            <Text style={[styles.actionLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );

    const InfoItem = ({ icon: Icon, label, value }: any) => (
        <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
                <Icon size={20} color={COLORS.darkGray} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={24} color={COLORS.black} />
                </TouchableOpacity> */}
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileHero}>
                    <View style={styles.avatar}>
                        <User size={60} color={COLORS.white} />
                    </View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.status}>{t('chat.online')}</Text>
                </View>

                <View style={styles.actionsRow}>
                    <ProfileAction
                        icon={MessageSquare}
                        label={t('editProfile.about')}
                        onPress={() => navigation.navigate('ChatRoom', { id, name })}
                    />
                    <ProfileAction
                        icon={Phone}
                        label={t('notifications.sectionCalls')}
                        onPress={() => navigation.navigate('VoiceCall', { userId: id, userName: name })}
                    />
                    <ProfileAction
                        icon={Video}
                        label={t('notifications.sectionCalls')}
                        onPress={() => navigation.navigate('VideoCall', { userId: id, userName: name })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('friendProfile.about')}</Text>
                    <InfoItem
                        icon={Info}
                        label={t('friendProfile.bio')}
                        value="Secure communication is not an option, it is a necessity. Staying private in a digital world."
                    />
                    <InfoItem
                        icon={User}
                        label="ID PASSPOT"
                        value={route.params.userCode?.toUpperCase() || id.toUpperCase()}
                    />
                    {/* <InfoItem
                        icon={Phone}
                        label="Phone"
                        value="+1 234 567 890"
                    /> */}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('friendProfile.sharedMedia')}</Text>
                    <View style={styles.mediaPlaceholder}>
                        <Text style={styles.mediaPlaceholderText}>{t('friendProfile.noSharedMedia')}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
    },
    backButton: {
        padding: 4,
    },
    moreButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    profileHero: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.black,
    },
    status: {
        fontSize: 14,
        color: '#34C759',
        marginTop: 4,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        width: normalize(100),
        textAlign: 'center',
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkGray,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    infoIcon: {
        width: 40,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.darkGray,
    },
    infoValue: {
        fontSize: 15,
        color: COLORS.black,
        fontWeight: '500',
        marginTop: 2,
    },
    mediaPlaceholder: {
        height: 100,
        backgroundColor: COLORS.gray,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.darkGray,
    },
    mediaPlaceholderText: {
        color: COLORS.darkGray,
        fontSize: 14,
    },
});

export default FriendProfileScreen;
