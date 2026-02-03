import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, User, Search } from 'lucide-react-native';
import Header from '../components/Header';
import SecurityOverlay from '../components/SecurityOverlay';
import { api } from '../services/ApiService';
import { format, isToday, isYesterday } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface CallLogItem {
    id: number;
    callerId: number;
    receiverId: number;
    callType: 'audio' | 'video';
    status: 'missed' | 'answered' | 'rejected' | 'outgoing';
    duration?: number;
    createdAt: string;
    caller?: { id: number; name: string; avatar?: string };
    receiver?: { id: number; name: string; avatar?: string };
}

type CallLogNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CallLogScreen = () => {
    const navigation = useNavigation<CallLogNavigationProp>();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [calls, setCalls] = useState<CallLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocked, setIsLocked] = useState(true);

    const fetchCallLogs = useCallback(async () => {
        try {
            const response = await api.get<{ data: CallLogItem[] }>('/calls/history');
            if (response.data?.data) {
                setCalls(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching call logs:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCallLogs();
        }, [fetchCallLogs])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchCallLogs();
    };

    // Filter calls based on search query
    const filteredCalls = useMemo(() => {
        if (!searchQuery.trim()) {
            return calls;
        }
        const query = searchQuery.toLowerCase();
        return calls.filter(call => {
            const isOutgoing = call.status === 'outgoing';
            const otherUser = isOutgoing ? call.receiver : call.caller;
            const userName = otherUser?.name || '';
            return userName.toLowerCase().includes(query);
        });
    }, [calls, searchQuery]);

    const formatCallTime = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return t('callLog.yesterday');
        }
        return format(date, 'dd/MM/yyyy');
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCallIcon = (item: CallLogItem, isOutgoing: boolean) => {
        const iconSize = 16;
        const color = item.status === 'missed' ? COLORS.danger : COLORS.success;

        if (item.status === 'missed') {
            return <PhoneMissed size={iconSize} color={color} />;
        } else if (isOutgoing) {
            return <PhoneOutgoing size={iconSize} color={color} />;
        } else {
            return <PhoneIncoming size={iconSize} color={color} />;
        }
    };

    const renderCallItem = ({ item }: { item: CallLogItem }) => {
        // Determine if call was outgoing (current user is the caller)
        const isOutgoing = item.status === 'outgoing';
        const otherUser = isOutgoing ? item.receiver : item.caller;
        const userName = otherUser?.name || t('callLog.unknownCaller');

        const handleCall = () => {
            if (!otherUser) return;
            if (item.callType === 'video') {
                navigation.navigate('VideoCall', {
                    userId: otherUser.id.toString(),
                    userName: userName
                });
            } else {
                navigation.navigate('VoiceCall', {
                    userId: otherUser.id.toString(),
                    userName: userName
                });
            }
        };

        return (
            <TouchableOpacity style={styles.callItem} onPress={handleCall} activeOpacity={0.7}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <User size={24} color={COLORS.white} />
                    </View>
                </View>

                <View style={styles.callInfo}>
                    <Text style={styles.callerName} numberOfLines={1}>{userName}</Text>
                    <View style={styles.callMeta}>
                        {getCallIcon(item, isOutgoing)}
                        <Text style={[
                            styles.callStatus,
                            item.status === 'missed' && styles.missedCall
                        ]}>
                            {item.callType === 'video' ? t('callLog.videoCall') : t('callLog.voiceCall')}
                            {item.duration ? ` · ${formatDuration(item.duration)}` : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.callActions}>
                    <Text style={styles.callTime}>{formatCallTime(item.createdAt)}</Text>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={handleCall}
                    >
                        {item.callType === 'video' ? (
                            <Video size={20} color={COLORS.black} />
                        ) : (
                            <Phone size={20} color={COLORS.black} />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Phone size={60} color={COLORS.darkGray} />
            <Text style={styles.emptyTitle}>{t('callLog.noCallsTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('callLog.noCallsSubtitle')}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title={t('callLog.title')} showSearch={false} />

            {/* Security Overlay */}
            <SecurityOverlay
                isVisible={isLocked}
                onUnlock={() => setIsLocked(false)}
                onCancel={() => navigation.goBack()}
                title={t('callLog.title')}
            />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Search size={18} color={COLORS.darkGray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('chatList.searchPlaceholder')}
                        placeholderTextColor={COLORS.darkGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.black} />
                </View>
            ) : (
                <FlatList
                    data={filteredCalls}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCallItem}
                    contentContainerStyle={filteredCalls.length === 0 ? styles.emptyContainer : styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[COLORS.black]}
                            tintColor={COLORS.black}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    searchContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        borderRadius: 24,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 15,
        color: COLORS.black,
        paddingVertical: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    emptyContainer: {
        flex: 1,
    },
    callItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    avatarContainer: {
        marginRight: SPACING.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callInfo: {
        flex: 1,
    },
    callerName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    callMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    callStatus: {
        fontSize: 13,
        color: COLORS.darkGray,
        marginLeft: 6,
    },
    missedCall: {
        color: COLORS.danger,
    },
    callActions: {
        alignItems: 'flex-end',
    },
    callTime: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    callButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: SPACING.lg,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});

export default CallLogScreen;
