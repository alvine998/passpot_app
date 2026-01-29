import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform, BackHandler } from 'react-native';
import Header from '../components/Header';
import ChatItem from '../components/ChatItem';
import { COLORS, SPACING } from '../styles/theme';
import { MessageSquarePlus, ArrowLeft, X } from 'lucide-react-native';
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
    const [isSearching, setIsSearching] = useState(false);
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

    const filteredChats = React.useMemo(() =>
        conversations.filter(conv => {
            const otherUser = conv.Users.find(u => u.id !== currentUserId);
            const name = conv.isGroup ? 'Group Chat' : (otherUser?.displayName || 'Unknown');
            const lastMessage = conv.lastMessage?.content || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        }),
        [conversations, searchQuery, currentUserId]);

    const renderChatListHeader = React.useCallback(() => {
        if (isSearching) {
            return (
                <View style={styles.searchHeader}>
                    <TouchableOpacity onPress={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                    }} style={styles.searchBackIcon}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('chatList.searchPlaceholder')}
                        autoFocus
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearIcon}>
                            <X size={20} color={COLORS.black} />
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return <Header title="Passpot" onSearchPress={() => setIsSearching(true)} />;
    }, [isSearching, searchQuery, t]);

    const renderItem = React.useCallback(({ item }: any) => (
        <ChatItem
            conversation={item}
            isLocked={!isUnlocked}
            onUnlockRequest={() => setShowSecurity(true)}
        />
    ), [isUnlocked]);

    return (
        <View style={styles.container}>
            {renderChatListHeader()}

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
    searchHeader: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    searchBackIcon: {
        marginRight: SPACING.md,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: COLORS.black,
        padding: 0,
    },
    searchClearIcon: {
        marginLeft: SPACING.sm,
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
