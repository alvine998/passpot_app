import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, Pressable } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { COLORS, SPACING } from '../styles/theme';
import { Lock, Shield, Eye, Copy, Forward, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface MessageBubbleProps {
    id?: string;
    text?: string;
    image?: string;
    time: string;
    isMe: boolean;
    isLocked?: boolean;
    isSecret?: boolean;
    onPress?: () => void;
    onForward?: (messageId: string, text?: string, image?: string) => void;
}

const MessageBubble = React.memo(({
    id,
    text,
    image,
    time,
    isMe,
    isLocked = false,
    isSecret = false,
    onPress,
    onForward
}: MessageBubbleProps) => {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);

    const handleLongPress = useCallback(() => {
        if (!isLocked) {
            setShowMenu(true);
        }
    }, [isLocked]);

    const handleCopy = useCallback(() => {
        if (text) {
            Clipboard.setString(text);
            Alert.alert(
                t('common.copied', 'Copied'),
                t('chat.messageCopied', 'Message copied to clipboard')
            );
        }
        setShowMenu(false);
    }, [text, t]);

    const handleForward = useCallback(() => {
        if (onForward && id) {
            onForward(id, text, image);
        }
        setShowMenu(false);
    }, [onForward, id, text, image]);

    const renderContent = () => {
        if (isSecret && isLocked) {
            return (
                <View style={styles.secretPlaceholder}>
                    <Shield size={32} color={isMe ? COLORS.white : COLORS.black} />
                    <Text style={[styles.secretText, isMe ? styles.myText : styles.theirText]}>
                        Secret Attachment
                    </Text>
                    <View style={styles.unlockIndicator}>
                        <Eye size={12} color={isMe ? COLORS.white : COLORS.darkGray} />
                        <Text style={[styles.unlockText, isMe ? styles.myTime : styles.theirTime]}>Tap to unlock</Text>
                    </View>
                </View>
            );
        }

        if (image) {
            return (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.messageImage} />
                    {text && <Text style={[styles.text, isMe ? styles.myText : styles.theirText, { marginTop: SPACING.xs }]}>{isLocked ? '••••••••' : text}</Text>}
                </View>
            );
        }

        return (
            <Text style={[
                styles.text,
                isMe ? styles.myText : styles.theirText
            ]}>
                {isLocked ? '••••••••' : text}
            </Text>
        );
    };

    return (
        <>
            <View style={[
                styles.container,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <TouchableOpacity
                    style={[
                        styles.bubble,
                        isMe ? styles.myBubble : styles.theirBubble,
                        image && !text && styles.imageBubble
                    ]}
                    onPress={onPress}
                    onLongPress={handleLongPress}
                    delayLongPress={500}
                    activeOpacity={0.8}
                >
                    <View style={styles.content}>
                        {renderContent()}
                        <View style={styles.footer}>
                            {(isLocked || isSecret) && (
                                <Lock size={10} color={isMe ? COLORS.white : COLORS.darkGray} style={styles.lockIcon} />
                            )}
                            <Text style={[
                                styles.time,
                                isMe ? styles.myTime : styles.theirTime
                            ]}>
                                {time}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Context Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={styles.menuContainer}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>{t('chat.messageOptions', 'Message Options')}</Text>
                            <TouchableOpacity onPress={() => setShowMenu(false)}>
                                <X size={20} color={COLORS.darkGray} />
                            </TouchableOpacity>
                        </View>

                        {text && (
                            <TouchableOpacity style={styles.menuItem} onPress={handleCopy}>
                                <Copy size={20} color={COLORS.black} />
                                <Text style={styles.menuItemText}>{t('common.copy', 'Copy')}</Text>
                            </TouchableOpacity>
                        )}

                        {onForward && (
                            <TouchableOpacity style={styles.menuItem} onPress={handleForward}>
                                <Forward size={20} color={COLORS.black} />
                                <Text style={styles.menuItemText}>{t('common.forward', 'Forward')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.xs,
        flexDirection: 'row',
        width: '100%',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        elevation: 1,
    },
    myBubble: {
        backgroundColor: COLORS.black,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: COLORS.gray,
        borderBottomLeftRadius: 4,
    },
    imageBubble: {
        padding: 4,
        borderRadius: 12,
    },
    imageContainer: {
        width: 240,
        height: 180,
    },
    messageImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    secretPlaceholder: {
        width: 200,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.md,
    },
    secretText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: SPACING.sm,
    },
    unlockIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        opacity: 0.8,
    },
    unlockText: {
        fontSize: 11,
        marginLeft: 4,
    },
    content: {
        flexDirection: 'column',
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
    },
    myText: {
        color: COLORS.white,
    },
    theirText: {
        color: COLORS.black,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 2,
    },
    lockIcon: {
        marginRight: 4,
    },
    time: {
        fontSize: 10,
    },
    myTime: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    theirTime: {
        color: COLORS.darkGray,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '80%',
        maxWidth: 300,
        padding: SPACING.md,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    menuItemText: {
        fontSize: 16,
        color: COLORS.black,
        marginLeft: SPACING.md,
    },
});

export default MessageBubble;
