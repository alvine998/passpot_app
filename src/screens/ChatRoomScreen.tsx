import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Platform, KeyboardAvoidingView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Phone, Video, Shield } from 'lucide-react-native';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import SecurityOverlay from '../components/SecurityOverlay';
import { CryptoService } from '../services/CryptoService';
import { socketService } from '../services/SocketService';
import { useTranslation } from 'react-i18next';
import { useChat } from '../context/ChatContext';
import { useProfile } from '../context/ProfileContext';
import { format } from 'date-fns';

interface Message {
    id: string;
    text?: string;
    image?: string;
    time: string;
    isMe: boolean;
    isSecret?: boolean;
}

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

const ChatRoomScreen = () => {
    const route = useRoute<ChatRoomRouteProp>();
    const navigation = useNavigation<ChatRoomNavigationProp>();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { id: initialId, recipientCode, name, avatar } = route.params;
    const { fetchMessages, sendMessage, conversations } = useChat();
    const { id: profileId } = useProfile();
    const [chatName, setChatName] = useState(name || 'Chat');
    const [chatAvatar, setChatAvatar] = useState(avatar);

    const [conversationId, setConversationId] = useState<string | undefined>(initialId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthOverlay, setShowAuthOverlay] = useState(true);
    const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
    const flatListRef = useRef<FlatList>(null);

    // Try to find conversation info if name is not provided (e.g., opening from notification)
    useEffect(() => {
        const convId = conversationId || initialId;
        if (convId && (!name || name === 'Chat')) {
            const found = conversations.find(conv => conv.id.toString() === convId);
            if (found && !found.isGroup) {
                // Find the other user in the conversation (not current user)
                const otherUser = found.Users.find(u => u.id !== profileId);
                if (otherUser) {
                    setChatName(otherUser.displayName || otherUser.userCode || 'Chat');
                    if (otherUser.avatar && !chatAvatar) {
                        setChatAvatar(otherUser.avatar);
                    }
                }
            }
        }
    }, [conversationId, initialId, conversations, name, profileId, chatAvatar]);

    // Try to find conversation ID if only recipientCode is provided
    useEffect(() => {
        if (!conversationId && recipientCode) {
            const found = conversations.find(conv =>
                !conv.isGroup && conv.Users.some(u => u.userCode === recipientCode)
            );
            if (found) {
                setConversationId(found.id.toString());
            }
        }
    }, [recipientCode, conversations, conversationId]);

    // Connect to socket and join conversation room
    useEffect(() => {
        const setupSocket = async () => {
            await socketService.connect();

            if (conversationId) {
                socketService.joinConversation(conversationId);
            }
        };

        setupSocket();

        // Cleanup: leave conversation when unmounting
        return () => {
            if (conversationId) {
                socketService.leaveConversation(conversationId);
            }
        };
    }, [conversationId]);

    // Listen for new messages
    useEffect(() => {
        const callbackId = `chatroom_${conversationId || 'new'}`;

        socketService.onNewMessage(callbackId, async (newMsg: any) => {
            console.log('New message received in ChatRoom:', newMsg);

            // Only process messages for this conversation
            if (newMsg.conversationId?.toString() !== conversationId) {
                return;
            }

            // Skip messages sent by current user - we already add them locally
            if (newMsg.senderId === profileId) {
                console.log('Skipping own message from socket');
                return;
            }

            // Check if message already exists
            setMessages(prev => {
                const exists = prev.some(m => m.id === newMsg.id?.toString());
                if (exists) return prev;

                const isImageContent = newMsg.content &&
                    (newMsg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
                        newMsg.content.includes('.r2.dev'));

                const message: Message = {
                    id: newMsg.id?.toString() || Date.now().toString(),
                    text: isImageContent ? '' : newMsg.content,
                    image: newMsg.fileUrl || (isImageContent ? newMsg.content : undefined),
                    time: format(new Date(newMsg.createdAt || new Date()), 'hh:mm a'),
                    isMe: false, // Messages from socket are always from others now
                    isSecret: false,
                };

                // Decrypt if needed
                if (newMsg.content && newMsg.content.startsWith('ENC[')) {
                    CryptoService.decrypt(newMsg.content).then(decrypted => {
                        setDecryptedMap(prev => ({
                            ...prev,
                            [message.id]: decrypted,
                        }));
                    }).catch(() => {
                        console.error('Failed to decrypt incoming message');
                    });
                } else if (newMsg.content) {
                    if (!isImageContent) {
                        setDecryptedMap(prev => ({
                            ...prev,
                            [message.id]: newMsg.content,
                        }));
                    }
                }

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);

                return [...prev, message];
            });
        });

        return () => {
            socketService.offNewMessage(callbackId);
        };
    }, [conversationId, profileId]);

    const loadMessages = useCallback(async () => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        setIsLoading(true);
        try {
            const fetchedMessages = await fetchMessages(String(conversationId));
            const mappedMessages: Message[] = fetchedMessages.map(msg => {
                const isImageContent = msg.content &&
                    (msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
                        msg.content.includes('.r2.dev'));

                return {
                    id: msg.id.toString(),
                    text: isImageContent ? '' : msg.content,
                    image: msg.fileUrl || (isImageContent ? msg.content : undefined),
                    time: format(new Date(msg.createdAt), 'hh:mm a'),
                    isMe: msg.senderId === profileId,
                    isSecret: false,
                };
            });

            setMessages(mappedMessages);

            // Decrypt messages
            const newDecryptedMap: Record<string, string> = { ...decryptedMap };
            for (const msg of fetchedMessages) {
                if (msg.content && msg.content.startsWith('ENC[')) {
                    try {
                        const decrypted = await CryptoService.decrypt(msg.content);
                        newDecryptedMap[msg.id.toString()] = decrypted;
                    } catch (e) {
                        console.error('Decryption failed for msg', msg.id);
                    }
                } else if (msg.content) {
                    // Check if it is an image before adding to decrypted map
                    const isImage = msg.content &&
                        (msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
                            msg.content.includes('.r2.dev'));

                    if (!isImage) {
                        newDecryptedMap[msg.id.toString()] = msg.content;
                    }
                }
            }
            setDecryptedMap(newDecryptedMap);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, fetchMessages, profileId, decryptedMap]);

    const handleUnlock = useCallback(async () => {
        setIsAuthenticated(true);
        setShowAuthOverlay(false);
        await loadMessages();
    }, [loadMessages]);

    const handleCancelUnlock = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSendMessage = useCallback(async (text: string) => {
        try {
            const encrypted = await CryptoService.encrypt(text);

            const params: any = {};
            if (conversationId) {
                params.conversationId = conversationId;
            } else if (recipientCode) {
                params.recipientCode = recipientCode;
            } else {
                console.error('No conversation or recipient code');
                return;
            }

            const sentMsg = await sendMessage(encrypted, params);

            if (sentMsg) {
                // If this was the first message, update the conversationId
                if (!conversationId) {
                    const newConvId = sentMsg.conversationId.toString();
                    setConversationId(newConvId);
                    // Join the new conversation room
                    socketService.joinConversation(newConvId);
                }

                const newMessage: Message = {
                    id: sentMsg.id.toString(),
                    text: encrypted,
                    time: format(new Date(sentMsg.createdAt), 'hh:mm a'),
                    isMe: true,
                };

                setMessages(prev => [...prev, newMessage]);
                setDecryptedMap(prev => ({ ...prev, [sentMsg.id.toString()]: text }));

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }, [conversationId, recipientCode, sendMessage]);

    const handleSendAttachment = useCallback(async (imageUri: string, isSecret: boolean) => {
        try {
            const params: any = {
                messageType: 'file',
                file: {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image_${Date.now()}.jpg`,
                },
            };

            if (conversationId) {
                params.conversationId = conversationId;
            } else if (recipientCode) {
                params.recipientCode = recipientCode;
            } else {
                console.error('No conversation or recipient code for attachment');
                return;
            }

            const sentMsg = await sendMessage('', params);

            if (sentMsg) {
                // If this was the first message, update the conversationId
                if (!conversationId) {
                    const newConvId = sentMsg.conversationId.toString();
                    setConversationId(newConvId);
                    socketService.joinConversation(newConvId);
                }

                const newMessage: Message = {
                    id: sentMsg.id.toString(),
                    image: sentMsg.fileUrl || imageUri,
                    isSecret: isSecret,
                    time: format(new Date(sentMsg.createdAt), 'hh:mm a'),
                    isMe: true,
                };

                setMessages(prev => [...prev, newMessage]);

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error) {
            console.error('Error sending attachment:', error);
        }
    }, [conversationId, recipientCode, sendMessage]);

    const handleForwardMessage = useCallback((messageId: string, text?: string, image?: string) => {
        // Navigate to contact list to select forward recipient
        navigation.navigate('ContactList', {
            forwardMessage: {
                messageId,
                text: text || '',
                image
            }
        });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: Message }) => (
        <MessageBubble
            id={item.id}
            text={isAuthenticated ? (decryptedMap[item.id] || item.text) : item.text}
            image={item.image}
            time={item.time}
            isMe={item.isMe}
            isLocked={!isAuthenticated}
            isSecret={item.isSecret}
            onPress={() => { }}
            onForward={handleForwardMessage}
        />
    ), [decryptedMap, isAuthenticated, handleForwardMessage]);

    console.log('messages', messages, conversationId);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.profileInfo}
                        onPress={() => navigation.navigate('FriendProfile', { id: initialId || '', name: chatName, userCode: recipientCode, avatar: chatAvatar })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatar}>
                            {chatAvatar ? (
                                <Image source={{ uri: chatAvatar }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{chatName.charAt(0)}</Text>
                            )}
                        </View>
                        <View style={styles.headerTitle}>
                            <Text style={styles.nameText}>{chatName}</Text>
                            <Text style={styles.statusText}>{t('chat.online')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('VideoCall', { userId: initialId || '', userName: chatName })}
                    >
                        <Video size={22} color={COLORS.black} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('VoiceCall', { userId: initialId || '', userName: chatName })}
                    >
                        <Phone size={22} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <SecurityOverlay
                    isVisible={showAuthOverlay}
                    onUnlock={handleUnlock}
                    onCancel={handleCancelUnlock}
                    title={t('chat.secureSession')}
                />

                <View style={styles.infoBar}>
                    <Shield size={12} color={COLORS.darkGray} />
                    <Text style={styles.infoText}>{t('chat.encryptedInfo')}</Text>
                </View>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.black} />
                    </View>
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    initialNumToRender={15}
                />
            </View>

            <View style={{ paddingBottom: insets.bottom }}>
                <MessageInput onSend={handleSendMessage} onSendAttachment={handleSendAttachment} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        height: 65,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: SPACING.sm,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    headerTitle: {},
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    statusText: {
        fontSize: 11,
        color: '#34C759',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: SPACING.md,
    },
    infoBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray,
        padding: SPACING.sm,
        margin: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 11,
        color: COLORS.darkGray,
        flex: 1,
        marginLeft: SPACING.xs,
        textAlign: 'center',
    },
    messageList: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    loadingContainer: {
        padding: SPACING.sm,
        alignItems: 'center',
    },
});

export default ChatRoomScreen;
