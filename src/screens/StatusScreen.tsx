import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    SectionList,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { Plus, Camera, Pencil, X, Send, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useStatus, UserStatus } from '../context/StatusContext';
import { useProfile } from '../context/ProfileContext';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import normalize from 'react-native-normalize';
import { formatDistanceToNow } from 'date-fns';

const StatusItem = React.memo(({ item, onLongPress }: { item: UserStatus, onLongPress?: (storyId: number) => void }) => {
    const latestStory = item.stories[0];
    if (!latestStory) return null;

    return (
        <TouchableOpacity
            style={styles.statusItem}
            activeOpacity={0.7}
            onLongPress={() => onLongPress && onLongPress(latestStory.id)}
        >
            <View style={[styles.imageContainer, styles.unviewedBorder]}>
                {latestStory.type === 'image' ? (
                    <Image source={{ uri: latestStory.content }} style={styles.statusImage} />
                ) : (
                    <View style={[styles.statusImage, { backgroundColor: '#673AB7', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: COLORS.white, fontSize: 10, textAlign: 'center', padding: 2 }} numberOfLines={2}>
                            {latestStory.content}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.statusInfo}>
                <Text style={styles.statusName}>{item.user.displayName}</Text>
                <Text style={styles.statusTime}>{formatDistanceToNow(new Date(latestStory.createdAt), { addSuffix: true })}</Text>
            </View>
        </TouchableOpacity>
    );
});

const StatusScreen = () => {
    const { t } = useTranslation();
    const { statuses, isLoading, error, fetchStatuses, createStatus, deleteStatus } = useStatus();
    const { id: myId, photo } = useProfile();
    const [isTextModalVisible, setIsTextModalVisible] = useState(false);
    const [textStatus, setTextStatus] = useState('');
    const [bgColor, setBgColor] = useState('#673AB7');

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const bgColors = ['#673AB7', '#E91E63', '#4CAF50', '#2196F3', '#FF9800', '#000000'];

    const handlePickImage = useCallback(async (useCamera = false) => {
        const options: any = {
            mediaType: 'photo',
            quality: 0.8,
        };

        const callback = async (response: any) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage);
                return;
            }
            if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                const success = await createStatus(asset.uri, 'image');
                if (!success) {
                    Alert.alert('Error', 'Failed to upload status');
                }
            }
        };

        if (useCamera) {
            launchCamera(options, callback);
        } else {
            launchImageLibrary(options, callback);
        }
    }, [createStatus]);

    const handlePostTextStatus = async () => {
        if (textStatus.trim().length === 0) return;
        const success = await createStatus(textStatus, 'text');
        if (success) {
            setTextStatus('');
            setIsTextModalVisible(false);
        } else {
            Alert.alert('Error', 'Failed to post status');
        }
    };

    const handleDeleteStatus = useCallback((id: number) => {
        Alert.alert(
            t('common.delete', 'Delete Status'),
            t('status.deleteConfirm', 'Are you sure you want to delete this status?'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteStatus(id);
                        if (!success) {
                            Alert.alert('Error', 'Failed to delete status');
                        }
                    }
                }
            ]
        );
    }, [t, deleteStatus]);

    const { myStatus, otherStatuses } = useMemo(() => {
        const my = statuses.find(s => s.user.id === myId);
        const others = statuses.filter(s => s.user.id !== myId);
        return { myStatus: my, otherStatuses: others };
    }, [statuses, myId]);

    const sections = useMemo(() => {
        if (otherStatuses.length === 0) return [];
        return [{ title: t('status.recentUpdates'), data: otherStatuses }];
    }, [t, otherStatuses]);

    const renderItem = useCallback(({ item }: { item: UserStatus }) => (
        <StatusItem item={item} />
    ), []);

    const renderSectionHeader = useCallback(({ section: { title } }: any) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    ), []);

    const ListHeader = useCallback(() => {
        const latestStory = myStatus?.stories[0];
        return (
            <TouchableOpacity
                style={styles.myStatusContainer}
                activeOpacity={0.7}
                onPress={() => handlePickImage(false)}
                onLongPress={() => latestStory && handleDeleteStatus(latestStory.id)}
            >
                <View style={styles.myStatusImageContainer}>
                    {latestStory?.type === 'image' ? (
                        <Image source={{ uri: latestStory.content }} style={styles.myStatusImage} />
                    ) : latestStory?.type === 'text' ? (
                        <View style={[styles.myStatusImage, { backgroundColor: '#673AB7', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: COLORS.white, fontSize: 8, textAlign: 'center' }} numberOfLines={2}>
                                {latestStory.content}
                            </Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' }}
                            style={styles.myStatusImage}
                        />
                    )}
                    <View style={styles.plusIconContainer}>
                        <Plus color={COLORS.white} size={14} strokeWidth={3} />
                    </View>
                </View>
                <View style={styles.statusInfo}>
                    <Text style={styles.statusName}>{t('status.myStatus')}</Text>
                    <Text style={styles.statusTime}>
                        {latestStory ? formatDistanceToNow(new Date(latestStory.createdAt), { addSuffix: true }) : t('status.addStatus')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [t, myStatus, photo, handlePickImage, handleDeleteStatus]);

    return (
        <SafeAreaView style={styles.container}>
            <Header title={t('status.title')} />

            {error && (
                <TouchableOpacity style={styles.errorBanner} onPress={fetchStatuses} activeOpacity={0.8}>
                    <Text style={styles.errorText}>{error}</Text>
                    <RefreshCw size={14} color={COLORS.white} />
                </TouchableOpacity>
            )}

            <SectionList
                sections={sections as any}
                keyExtractor={(item) => item.user.id.toString()}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchStatuses} tintColor={COLORS.black} colors={[COLORS.black]} />
                }
            />

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.miniFab}
                    onPress={() => setIsTextModalVisible(true)}
                >
                    <Pencil color={COLORS.darkGray} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.mainFab}
                    onPress={() => handlePickImage(true)}
                >
                    <Camera color={COLORS.white} size={24} />
                </TouchableOpacity>
            </View>

            <Modal visible={isTextModalVisible} animationType="fade" transparent={true}>
                <View style={[styles.textStatusContainer, { backgroundColor: bgColor }]}>
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsTextModalVisible(false)}>
                                <X color={COLORS.white} size={30} />
                            </TouchableOpacity>
                            <View style={styles.colorPicker}>
                                {bgColors.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[styles.colorOption, { backgroundColor: color }, bgColor === color && styles.activeColor]}
                                        onPress={() => setBgColor(color)}
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={styles.textInputFullContainer}>
                            <TextInput
                                style={styles.textStatusInput}
                                placeholder={t('status.typePlaceholder')}
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                multiline
                                autoFocus
                                value={textStatus}
                                onChangeText={setTextStatus}
                                maxLength={280}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.sendFab}
                            onPress={handlePostTextStatus}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color={bgColor} /> : <Send color={bgColor} size={24} />}
                        </TouchableOpacity>
                    </SafeAreaView>
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
    myStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    myStatusImageContainer: {
        position: 'relative',
    },
    myStatusImage: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: COLORS.lightGray,
    },
    plusIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#25D366',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.darkGray,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F8F9FA',
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
    },
    imageContainer: {
        padding: 2,
        borderRadius: 30,
        borderWidth: 2,
    },
    unviewedBorder: {
        borderColor: '#25D366',
    },
    viewedBorder: {
        borderColor: COLORS.lightGray,
    },
    statusImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.lightGray,
    },
    statusInfo: {
        marginLeft: 16,
        flex: 1,
    },
    statusName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.black,
    },
    statusTime: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        alignItems: 'center',
    },
    mainFab: {
        backgroundColor: COLORS.black,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 16,
    },
    miniFab: {
        backgroundColor: '#F0F2F5',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.22,
    },
    textStatusContainer: {
        flex: 1,
        padding: SPACING.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    colorPicker: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorOption: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginLeft: SPACING.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeColor: {
        borderColor: COLORS.white,
    },
    textInputFullContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStatusInput: {
        width: '100%',
        color: COLORS.white,
        fontSize: normalize(28),
        fontWeight: '700',
        textAlign: 'center',
    },
    sendFab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        backgroundColor: COLORS.white,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
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

export default StatusScreen;
