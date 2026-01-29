import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { Send, Plus, Paperclip, X, Shield, ShieldCheck } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

interface MessageInputProps {
    onSend: (text: string) => void;
    onSendAttachment?: (image: string, isSecret: boolean) => void;
}

const MessageInput = ({ onSend, onSendAttachment }: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [isSecret, setIsSecret] = useState(false);

    const handleSend = () => {
        if (attachment && onSendAttachment) {
            onSendAttachment(attachment, isSecret);
            setAttachment(null);
            setIsSecret(false);
            if (message.trim()) {
                onSend(message.trim());
                setMessage('');
            }
        } else if (message.trim()) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handlePickImage = () => {
        launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setAttachment(response.assets[0].uri || null);
            }
        });
    };

    return (
        <View style={styles.outerContainer}>
            {attachment && (
                <View style={styles.attachmentPreview}>
                    <View style={styles.previewImageContainer}>
                        <Image source={{ uri: attachment }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeButton} onPress={() => setAttachment(null)}>
                            <X size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.secretToggle, isSecret && styles.secretToggleActive]}
                        onPress={() => setIsSecret(!isSecret)}
                    >
                        {isSecret ? <ShieldCheck size={18} color={COLORS.white} /> : <Shield size={18} color={COLORS.darkGray} />}
                        <Text style={[styles.secretToggleText, isSecret && styles.secretToggleTextActive]}>
                            {isSecret ? 'Secret: ON' : 'Send Secretly'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.container}>
                <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
                    <Plus size={24} color={COLORS.black} />
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={COLORS.darkGray}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        selectionColor={COLORS.black}
                        cursorColor={COLORS.black}
                    />
                    <TouchableOpacity style={styles.iconButtonSmall} onPress={handlePickImage}>
                        <Paperclip size={20} color={COLORS.darkGray} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!message.trim() && !attachment) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() && !attachment}
                >
                    <Send size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    attachmentPreview: {
        padding: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        margin: SPACING.sm,
        borderRadius: 12,
    },
    previewImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 4,
    },
    secretToggle: {
        flex: 1,
        marginLeft: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    secretToggleActive: {
        backgroundColor: COLORS.black,
        borderColor: COLORS.black,
    },
    secretToggleText: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.darkGray,
    },
    secretToggleTextActive: {
        color: COLORS.white,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.gray,
        borderRadius: 25,
        marginHorizontal: SPACING.sm,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
        minHeight: 45,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        color: '#000000',
        fontSize: 16,
        paddingVertical: SPACING.sm,
        paddingHorizontal: 0,
        minHeight: 40,
        textAlignVertical: 'center',
    },
    iconButton: {
        padding: SPACING.sm,
    },
    iconButtonSmall: {
        padding: SPACING.xs,
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.darkGray,
    },
});

export default MessageInput;
