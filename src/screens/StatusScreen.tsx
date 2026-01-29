import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    RefreshControl,
    Dimensions,
    TouchableWithoutFeedback,
    StatusBar
} from 'react-native';
import Header from '../components/Header';
import { COLORS, SPACING } from '../styles/theme';
import { Plus, Camera, Pencil, X, Send, RefreshCw, Eye } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useStatus, UserStatus } from '../context/StatusContext';
import { useProfile } from '../context/ProfileContext';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import normalize from 'react-native-normalize';
import { formatDistanceToNow } from 'date-fns';

const { width, height } = Dimensions.get('window');

const StatusItem = React.memo(({ item, onPress, onLongPress }: { item: UserStatus, onPress: (status: UserStatus) => void, onLongPress?: (storyId: number) => void }) => {
    const latestStory = item.stories[0];
    if (!latestStory) return null;

    return (
        <TouchableOpacity
            style={styles.statusItem}
            activeOpacity={0.7}
            onPress={() => onPress(item)}
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

    // Status Viewer State
    const [viewingStatus, setViewingStatus] = useState<UserStatus | null>(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (viewingStatus) {
            setProgress(0);
            startProgress();
        } else {
            if (progressTimer.current) clearInterval(progressTimer.current);
        }
    }, [viewingStatus, currentStoryIndex]);

    const startProgress = () => {
        if (progressTimer.current) clearInterval(progressTimer.current);

        const duration = 5000; // 5 seconds per story
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        progressTimer.current = setInterval(() => {
            currentStep++;
            setProgress(currentStep / steps);

            if (currentStep >= steps) {
                moveToNextStory();
            }
        }, interval);
    };

    const moveToNextStory = () => {
        if (!viewingStatus) return;

        if (currentStoryIndex < viewingStatus.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            closeViewer();
        }
    };

    const moveToPrevStory = () => {
        if (!viewingStatus) return;

        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else {
            // Restart current story or close? Let's just restart for index 0
            setCurrentStoryIndex(0);
            setProgress(0);
        }
    };

    const closeViewer = () => {
        setViewingStatus(null);
        setCurrentStoryIndex(0);
        if (progressTimer.current) clearInterval(progressTimer.current);
    };

    const handleStatusPress = useCallback((status: UserStatus) => {
        if (status.stories.length > 0) {
            setViewingStatus(status);
            setCurrentStoryIndex(0);
        }
    }, []);

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
        const my = statuses.find(s => String(s.user.id) === String(myId));
        const others = statuses.filter(s => String(s.user.id) !== String(myId));
        return { myStatus: my, otherStatuses: others };
    }, [statuses, myId]);

    const sections = useMemo(() => {
        if (otherStatuses.length === 0) return [];
        return [{ title: t('status.recentUpdates'), data: otherStatuses }];
    }, [t, otherStatuses]);

    const renderItem = useCallback(({ item }: { item: UserStatus }) => (
        <StatusItem item={item} onPress={handleStatusPress} />
    ), [handleStatusPress]);

    const renderSectionHeader = useCallback(({ section: { title } }: any) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    ), []);

    const ListHeader = useCallback(() => {
        const latestStory = myStatus?.stories[0];
        return (
            <TouchableOpacity
                style={styles.myStatusContainer}
                activeOpacity={0.7}
                onPress={() => latestStory ? handleStatusPress(myStatus!) : handlePickImage(false)}
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

            {/* Status Viewer Modal */}
            <Modal visible={!!viewingStatus} animationType="fade" transparent={false}>
                {viewingStatus && (
                    <View style={viewerStyles.container}>
                        <StatusBar barStyle="light-content" backgroundColor="black" hidden />

                        {/* Progress Bars */}
                        <View style={viewerStyles.progressContainer}>
                            {viewingStatus.stories.map((story, index) => (
                                <View key={story.id} style={viewerStyles.progressBarBackground}>
                                    <View
                                        style={[
                                            viewerStyles.progressBarFill,
                                            {
                                                width: index < currentStoryIndex ? '100%' :
                                                    index === currentStoryIndex ? `${progress * 100}%` : '0%'
                                            }
                                        ]}
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Header */}
                        <View style={viewerStyles.header}>
                            <Image
                                source={{ uri: viewingStatus.user.avatar || 'https://via.placeholder.com/40' }}
                                style={viewerStyles.avatar}
                            />
                            <Text style={viewerStyles.name}>{viewingStatus.user.displayName}</Text>
                            <Text style={viewerStyles.time}>
                                {formatDistanceToNow(new Date(viewingStatus.stories[currentStoryIndex].createdAt), { addSuffix: true })}
                            </Text>
                            <TouchableOpacity onPress={closeViewer} style={viewerStyles.closeButton}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={viewerStyles.contentContainer}>
                            {viewingStatus.stories[currentStoryIndex].type === 'image' ? (
                                <Image
                                    source={{ uri: viewingStatus.stories[currentStoryIndex].content }}
                                    style={viewerStyles.imageContent}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={[viewerStyles.textContent, { backgroundColor: '#673AB7' }]}>
                                    <Text style={viewerStyles.textStory}>
                                        {viewingStatus.stories[currentStoryIndex].content}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Viewers Footer (Only for My Status) */}
                        {viewingStatus.user.id.toString() === myId?.toString() && (
                            <TouchableOpacity
                                style={viewerStyles.footer}
                                activeOpacity={0.8}
                                onPress={() => {
                                    const viewers = viewingStatus.stories[currentStoryIndex].viewers || [];
                                    if (viewers.length > 0) {
                                        Alert.alert(
                                            'Viewed by',
                                            viewers.map(v => `${v.displayName} (${formatDistanceToNow(new Date(v.viewedAt), { addSuffix: true })})`).join('\n')
                                        );
                                    } else {
                                        Alert.alert('Viewers', 'No views yet');
                                    }
                                }}
                            >
                                <View style={viewerStyles.eyeIcon}>
                                    <Image
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/159/159604.png' }}
                                        style={{ width: 20, height: 20, tintColor: COLORS.white }}
                                    />
                                </View>
                                <Text style={viewerStyles.viewerCount}>
                                    {viewingStatus.stories[currentStoryIndex].viewers?.length || 0}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Interactive Zones */}
                        <View style={viewerStyles.touchOverlay}>
                            <TouchableWithoutFeedback onPress={moveToPrevStory}>
                                <View style={viewerStyles.leftZone} />
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={moveToNextStory}>
                                <View style={viewerStyles.rightZone} />
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                )}
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

const viewerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    progressContainer: {
        flexDirection: 'row',
        paddingTop: 10, // StatusBar height approximation
        paddingHorizontal: 10,
        gap: 5,
        zIndex: 10,
    },
    progressBarBackground: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        zIndex: 10,
        position: 'absolute',
        top: 20,
        width: '100%',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    name: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    time: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginLeft: 10,
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    imageContent: {
        width: '100%',
        height: '100%',
    },
    textContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    textStory: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    touchOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 5, // Below header/progress but above content
    },
    leftZone: {
        flex: 1,
    },
    rightZone: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 20,
    },
    eyeIcon: {
        marginRight: 8,
    },
    viewerCount: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});

export default StatusScreen;
