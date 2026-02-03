import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Lock } from 'lucide-react-native';

import { Conversation } from '../context/ChatContext';
import { useProfile } from '../context/ProfileContext';
import { format } from 'date-fns';

interface ChatItemProps {
    conversation: Conversation;
    isLocked?: boolean;
    onUnlockRequest?: () => void;
}

type ChatItemNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChatItem = React.memo(({ conversation, isLocked = false, onUnlockRequest }: ChatItemProps) => {
    const navigation = useNavigation<ChatItemNavigationProp>();
    const { id: currentUserId } = useProfile();

    const otherUser = conversation.Users.find(u => u.id !== currentUserId);
    const name = conversation.isGroup ? 'Group Chat' : (otherUser?.displayName || 'Unknown');
    const lastMessageContent = conversation.lastMessage?.content || 'No messages yet';
    const time = conversation.lastMessage
        ? format(new Date(conversation.lastMessage.createdAt), 'HH:mm')
        : format(new Date(conversation.updatedAt), 'HH:mm');

    const isEncrypted = lastMessageContent.startsWith('ENC[');

    // Check if content is an image URL
    const isImage = lastMessageContent.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
        lastMessageContent.includes('.r2.dev');

    const displayPreview = isLocked
        ? '••••••••'
        : (isEncrypted
            ? '••••••••••••••••'
            : (isImage ? '📷 Image' : lastMessageContent.substring(0, 30)));

    console.log(otherUser, "oththth");

    const handlePress = () => {
        if (isLocked) {
            onUnlockRequest?.();
        } else {
            navigation.navigate('ChatRoom', {
                id: conversation.id.toString(),
                name,
                recipientCode: otherUser?.userCode,
                avatar: otherUser?.avatar
            });
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                {isLocked ? (
                    <Lock size={24} color={COLORS.white} />
                ) : (
                    otherUser?.avatar ? (
                        <Image source={{ uri: otherUser.avatar }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                    )
                )}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name}>{isLocked ? '*****' : name}</Text>
                    <Text style={styles.time}>{time}</Text>
                </View>
                <View style={styles.footer}>
                    {(isEncrypted || isLocked) && <Lock size={12} color={COLORS.darkGray} style={{ marginRight: 4 }} />}
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {displayPreview}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        alignItems: 'center',
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        marginLeft: SPACING.md,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: SPACING.md,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    time: {
        fontSize: 12,
        color: COLORS.darkGray,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: COLORS.darkGray,
        flex: 1,
        marginRight: SPACING.sm,
    },
    unreadBadge: {
        backgroundColor: COLORS.black,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xs,
    },
    unreadText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
});

export default ChatItem;
