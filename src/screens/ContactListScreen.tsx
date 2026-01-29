import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    SafeAreaView,
    Platform,
    Modal,
    KeyboardAvoidingView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { MessageSquarePlus, ArrowLeft, Shield, UserPlus, Search, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useFriends, Friend } from '../context/FriendsContext';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactList'>;

const ContactItem = React.memo(({ item, onPress, onLongPress }: { item: Friend; onPress: () => void; onLongPress: () => void }) => (
    <TouchableOpacity
        style={styles.contactItem}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
    >
        <Image source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' }} style={styles.avatar} />
        <View style={styles.contactInfo}>
            <Text style={styles.name}>{item.displayName}</Text>
            <Text style={styles.status} numberOfLines={1}>{item.userCode}</Text>
        </View>
    </TouchableOpacity>
));

const ContactListScreen = ({ navigation }: Props) => {
    const { t } = useTranslation();
    const { friends, isLoading, error, fetchFriends, addFriend, removeFriend } = useFriends();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Remove Friend Modal State
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const filteredContacts = useMemo(() =>
        friends.filter(contact =>
            (contact.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '')),
        [friends, searchQuery]);

    const groupedData = useMemo(() => {
        const groups = filteredContacts.reduce((acc: { [key: string]: Friend[] }, contact) => {
            const name = contact.displayName || 'Unknown';
            const firstLetter = name.charAt(0).toUpperCase() || '#';
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(contact);
            return acc;
        }, {});

        return Object.keys(groups).sort().map(letter => ({
            title: letter,
            data: groups[letter],
        }));
    }, [filteredContacts]);

    const handleContactPress = useCallback((item: Friend) => {
        navigation.navigate('ChatRoom', { recipientCode: item.userCode, name: item.displayName });
    }, [navigation]);

    const handleRemoveFriend = useCallback((friend: Friend) => {
        setSelectedFriend(friend);
        setShowRemoveModal(true);
    }, []);

    const confirmRemoveFriend = async () => {
        if (!selectedFriend) return;

        setIsSubmitting(true);
        const success = await removeFriend(selectedFriend.id);
        setIsSubmitting(false);

        setShowRemoveModal(false);
        setSelectedFriend(null);

        if (success) {
            Toast.show({
                type: 'success',
                text1: t('contact.removed', 'Friend removed'),
            });
        } else {
            Toast.show({
                type: 'error',
                text1: t('contact.removeFailed', 'Failed to remove friend'),
            });
        }
    };

    const handleAddFriend = async () => {
        if (pinInput.length < 6) return;
        setIsSubmitting(true);
        const result = await addFriend(pinInput);
        setIsSubmitting(false);
        if (result.success) {
            setShowPinModal(false);
            setPinInput('');
            Toast.show({
                type: 'success',
                text1: t('contact.added', 'Contact added successfully'),
            });
        } else {
            Toast.show({
                type: 'error',
                text1: result.message || t('contact.addFailed', 'Failed to add contact'),
            });
        }
    };

    const renderSection = useCallback(({ item }: any) => (
        <View>
            <Text style={styles.sectionLetter}>{item.title}</Text>
            {item.data.map((contact: Friend) => (
                <ContactItem
                    key={contact.id.toString()}
                    item={contact}
                    onPress={() => handleContactPress(contact)}
                    onLongPress={() => handleRemoveFriend(contact)}
                />
            ))}
        </View>
    ), [handleContactPress, handleRemoveFriend]);

    const ListHeader = useCallback(() => (
        <View>
            <TouchableOpacity style={styles.actionItem} onPress={() => setShowPinModal(true)}>
                <View style={[styles.actionIconContainer, { backgroundColor: COLORS.black }]}>
                    <Shield color={COLORS.white} size={20} />
                </View>
                <Text style={styles.actionText}>{t('profile.inviteByPin')}</Text>
            </TouchableOpacity>
            <Text style={styles.sectionHeaderTitle}>Kontak di Passpot</Text>
        </View>
    ), [t]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft color={COLORS.black} size={24} />
                    </TouchableOpacity>
                    {!isSearching ? (
                        <>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Pilih Kontak</Text>
                                <Text style={styles.subtitle}>{friends.length} kontak</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.headerAction}>
                                <Search color={COLORS.black} size={24} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                autoFocus
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity onPress={() => {
                                setSearchQuery('');
                                setIsSearching(false);
                            }}>
                                <Trash2 color={COLORS.black} size={24} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {error && (
                <TouchableOpacity style={styles.errorBanner} onPress={fetchFriends}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Trash2 size={14} color={COLORS.white} />
                </TouchableOpacity>
            )}

            <FlatList
                data={groupedData}
                ListHeaderComponent={!isSearching ? ListHeader : null}
                keyExtractor={(item) => item.title}
                renderItem={renderSection}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading && !isSubmitting} onRefresh={fetchFriends} tintColor={COLORS.black} colors={[COLORS.black]} />
                }
            />

            <Modal
                visible={showPinModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPinModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Shield size={32} color={COLORS.black} />
                            <Text style={styles.modalTitle}>{t('profile.enterPinTitle')}</Text>
                            <Text style={styles.modalSubtitle}>{t('profile.enterPinSubtitle')}</Text>
                        </View>

                        <TextInput
                            style={styles.pinInput}
                            placeholder="e.g. A1B2C3"
                            autoFocus
                            maxLength={6}
                            autoCapitalize="characters"
                            value={pinInput}
                            onChangeText={setPinInput}
                            placeholderTextColor={COLORS.darkGray}
                            editable={!isSubmitting}
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowPinModal(false);
                                    setPinInput('');
                                }}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addButton, (pinInput.length < 6 || isSubmitting) && styles.addButtonDisabled]}
                                onPress={handleAddFriend}
                                disabled={pinInput.length < 6 || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={COLORS.white} size="small" />
                                ) : (
                                    <Text style={styles.addButtonText}>{t('profile.addContact')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Remove Friend Confirmation Modal */}
            <Modal
                visible={showRemoveModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRemoveModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2', marginBottom: 16 }]}>
                                <Trash2 color={COLORS.danger} size={32} />
                            </View>
                            <Text style={styles.modalTitle}>Hapus Pertemanan</Text>
                            <Text style={styles.modalSubtitle}>
                                Apakah kamu yakin ingin menghapus pertemanan dengan
                                <Text style={{ fontWeight: '700', color: COLORS.black }}> {selectedFriend?.displayName ?? selectedFriend?.userCode}</Text>?
                            </Text>
                        </View>

                        <View style={[styles.modalFooter, { marginTop: 24 }]}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowRemoveModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: COLORS.danger }]}
                                onPress={confirmRemoveFriend}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color={COLORS.white} />
                                ) : (
                                    <Text style={styles.addButtonText}>Hapus</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 4,
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    headerAction: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.black,
        padding: 0,
    },
    listContent: {
        paddingBottom: 20,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    sectionHeaderTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkGray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
    },
    sectionLetter: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkGray,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 16,
        backgroundColor: COLORS.lightGray,
    },
    contactInfo: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    status: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: 12,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: 8,
    },
    pinInput: {
        width: '100%',
        height: 60,
        backgroundColor: COLORS.gray,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: COLORS.black,
        letterSpacing: 8,
        marginBottom: 24,
    },
    modalFooter: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cancelButtonText: {
        color: COLORS.darkGray,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: COLORS.black,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: '700',
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
});

export default ContactListScreen;
