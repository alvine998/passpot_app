import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform, BackHandler } from 'react-native';
import Header from '../components/Header';
import ChatItem from '../components/ChatItem';
import { COLORS, SPACING } from '../styles/theme';
import { MessageSquarePlus, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../context/ProfileContext';
import SecurityOverlay from '../components/SecurityOverlay';
import { useFocusEffect } from '@react-navigation/native';

import { useChat } from '../context/ChatContext';
import { RefreshControl } from 'react-native';

const ChatListScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { conversations, isLoading: isChatLoading, fetchConversations } = useChat();
    const { id: currentUserId, isUnlocked, setUnlocked } = useProfile();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSecurity, setShowSecurity] = useState(false);

    React.useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useFocusEffect(
        React.useCallback(() => {
            if (!isUnlocked) {
                setShowSecurity(true);
            }
        }, [isUnlocked])
    );

    // Handle back button to exit the app
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, [])
    );

    const filteredChats = useMemo(() =>
        conversations.filter(conv => {
            const otherUser = conv.Users.find(u => u.id !== currentUserId);
            const name = conv.isGroup ? 'Group Chat' : (otherUser?.displayName || 'Unknown');
            const lastMessage = conv.lastMessage?.content || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        }),
        [conversations, searchQuery, currentUserId]);

    const renderItem = useCallback(({ item }: any) => (
        <ChatItem
            conversation={item}
            isLocked={!isUnlocked}
            onUnlockRequest={() => setShowSecurity(true)}
        />
    ), [isUnlocked]);

    return (
        <View style={styles.container}>
            <Header title="Passpot" showSearch={false} />

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

            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl
                        refreshing={isChatLoading}
                        onRefresh={fetchConversations}
                        colors={[COLORS.black]}
                    />
                }
                ListEmptyComponent={
                    !isChatLoading ? (
                        <View style={styles.emptyContainer}>
                            <MessageSquarePlus size={60} color={COLORS.gray} strokeWidth={1} />
                            <Text style={styles.emptyTitle}>{t('chatList.noConversations')}</Text>
                            <Text style={styles.emptySubtitle}>{t('chatList.noConversationsSub')}</Text>
                        </View>
                    ) : null
                }
            />

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ContactList')}
            >
                <MessageSquarePlus color={COLORS.white} size={28} />
            </TouchableOpacity>

            <SecurityOverlay
                isVisible={showSecurity}
                title="Chats"
                onUnlock={() => {
                    setUnlocked(true);
                    setShowSecurity(false);
                }}
                onCancel={() => setShowSecurity(false)}
            />
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
    listContent: {
        paddingBottom: 80,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.lg,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: SPACING.md,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: SPACING.xs,
    },
});

export default ChatListScreen;
