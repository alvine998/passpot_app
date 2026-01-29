import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Bell, BellOff, Volume2, MessageSquare, Users, Phone, ChevronRight, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const NOTIFICATION_SETTINGS_KEY = '@passpot_notification_settings';

// Default notification settings
const DEFAULT_SETTINGS = {
    // Messages
    msgNotifications: true,
    msgNotificationTone: 'default',
    msgVibrate: 'default',
    msgReaction: true,
    // Groups
    grpNotifications: true,
    grpNotificationTone: 'default',
    grpVibrate: 'default',
    grpReaction: true,
    // Calls
    callRingtone: 'default',
    callVibrate: 'default',
};

type NotificationSettings = typeof DEFAULT_SETTINGS;

interface SelectionOption {
    key: string;
    label: string;
}

interface NotificationItemProps {
    icon: React.ComponentType<{ size: number; color: string }>;
    title: string;
    subtitle?: string;
    value: boolean | string;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    type?: 'toggle' | 'select';
}

const NotificationItem = ({ icon: Icon, title, subtitle, value, onValueChange, onPress, type = 'toggle' }: NotificationItemProps) => (
    <TouchableOpacity
        style={styles.itemContainer}
        onPress={type === 'select' ? onPress : undefined}
        activeOpacity={type === 'select' ? 0.7 : 1}
        disabled={type === 'toggle'}
    >
        <View style={styles.itemIcon}>
            <Icon size={22} color={COLORS.black} />
        </View>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
        {type === 'toggle' ? (
            <Switch
                value={value as boolean}
                onValueChange={onValueChange}
                trackColor={{ false: COLORS.lightGray, true: COLORS.black }}
                thumbColor={COLORS.white}
            />
        ) : (
            <View style={styles.selectContainer}>
                <Text style={styles.itemValue}>{value as string}</Text>
                <ChevronRight size={18} color={COLORS.darkGray} />
            </View>
        )}
    </TouchableOpacity>
);

const NotificationsScreen = () => {
    const navigation = useNavigation<NotificationsScreenNavigationProp>();
    const { t } = useTranslation();

    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalOptions, setModalOptions] = useState<SelectionOption[]>([]);
    const [modalCurrentValue, setModalCurrentValue] = useState('');
    const [modalSettingKey, setModalSettingKey] = useState<keyof NotificationSettings | null>(null);

    // Available options for selection items
    const toneOptions: SelectionOption[] = [
        { key: 'default', label: t('notifications.default') },
        { key: 'chime', label: t('notifications.tones.chime', 'Chime') },
        { key: 'bell', label: t('notifications.tones.bell', 'Bell') },
        { key: 'digital', label: t('notifications.tones.digital', 'Digital') },
        { key: 'none', label: t('notifications.tones.none', 'None') },
    ];

    const vibrateOptions: SelectionOption[] = [
        { key: 'default', label: t('notifications.default') },
        { key: 'short', label: t('notifications.vibrate.short', 'Short') },
        { key: 'long', label: t('notifications.vibrate.long', 'Long') },
        { key: 'off', label: t('notifications.vibrate.off', 'Off') },
    ];

    const ringtoneOptions: SelectionOption[] = [
        { key: 'default', label: t('notifications.default') },
        { key: 'classic', label: t('notifications.ringtones.classic', 'Classic') },
        { key: 'modern', label: t('notifications.ringtones.modern', 'Modern') },
        { key: 'simple', label: t('notifications.ringtones.simple', 'Simple') },
        { key: 'silent', label: t('notifications.ringtones.silent', 'Silent') },
    ];

    // Load settings from AsyncStorage on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
                if (storedSettings) {
                    const parsedSettings = JSON.parse(storedSettings);
                    setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
                }
            } catch (error) {
                console.error('Error loading notification settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Save settings to AsyncStorage
    const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
        try {
            await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }, []);

    // Update a specific setting
    const updateSetting = useCallback(async <K extends keyof NotificationSettings>(
        key: K,
        value: NotificationSettings[K]
    ) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await saveSettings(newSettings);
    }, [settings, saveSettings]);

    // Get display label for a setting value
    const getDisplayLabel = useCallback((key: keyof NotificationSettings, value: string): string => {
        let options: SelectionOption[] = [];

        if (key.includes('Tone') || key.includes('tone')) {
            options = toneOptions;
        } else if (key.includes('Vibrate') || key.includes('vibrate')) {
            options = vibrateOptions;
        } else if (key.includes('Ringtone') || key.includes('ringtone')) {
            options = ringtoneOptions;
        }

        const option = options.find(opt => opt.key === value);
        return option?.label || value;
    }, [toneOptions, vibrateOptions, ringtoneOptions]);

    // Open selection modal
    const openSelectionModal = useCallback((
        title: string,
        options: SelectionOption[],
        currentValue: string,
        settingKey: keyof NotificationSettings
    ) => {
        setModalTitle(title);
        setModalOptions(options);
        setModalCurrentValue(currentValue);
        setModalSettingKey(settingKey);
        setModalVisible(true);
    }, []);

    // Handle modal option selection
    const handleOptionSelect = useCallback(async (optionKey: string) => {
        if (modalSettingKey) {
            await updateSetting(modalSettingKey, optionKey as any);
        }
        setModalVisible(false);
    }, [modalSettingKey, updateSetting]);

    // Close modal
    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={COLORS.black} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('notifications.sectionMessages')}</Text>
                    <NotificationItem
                        icon={Bell}
                        title={t('notifications.convTones')}
                        subtitle={t('notifications.convTonesDesc')}
                        value={settings.msgNotifications}
                        onValueChange={(value) => updateSetting('msgNotifications', value)}
                    />
                    <NotificationItem
                        icon={Volume2}
                        title={t('notifications.notificationTone')}
                        value={getDisplayLabel('msgNotificationTone', settings.msgNotificationTone)}
                        type="select"
                        onPress={() => openSelectionModal(
                            t('notifications.notificationTone'),
                            toneOptions,
                            settings.msgNotificationTone,
                            'msgNotificationTone'
                        )}
                    />
                    <NotificationItem
                        icon={Bell}
                        title={t('notifications.vibrate')}
                        value={getDisplayLabel('msgVibrate', settings.msgVibrate)}
                        type="select"
                        onPress={() => openSelectionModal(
                            t('notifications.vibrate'),
                            vibrateOptions,
                            settings.msgVibrate,
                            'msgVibrate'
                        )}
                    />
                    <NotificationItem
                        icon={MessageSquare}
                        title={t('notifications.reactionNotifications')}
                        subtitle={t('notifications.reactionNotificationsDesc')}
                        value={settings.msgReaction}
                        onValueChange={(value) => updateSetting('msgReaction', value)}
                    />
                </View>

                {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('notifications.sectionGroups')}</Text>
                    <NotificationItem
                        icon={Users}
                        title={t('notifications.groupNotifications')}
                        value={settings.grpNotifications}
                        onValueChange={(value) => updateSetting('grpNotifications', value)}
                    />
                    <NotificationItem
                        icon={Volume2}
                        title={t('notifications.notificationTone')}
                        value={getDisplayLabel('grpNotificationTone', settings.grpNotificationTone)}
                        type="select"
                        onPress={() => openSelectionModal(
                            t('notifications.notificationTone'),
                            toneOptions,
                            settings.grpNotificationTone,
                            'grpNotificationTone'
                        )}
                    />
                    <NotificationItem
                        icon={Users}
                        title={t('notifications.reactionNotifications')}
                        value={settings.grpReaction}
                        onValueChange={(value) => updateSetting('grpReaction', value)}
                    />
                </View> */}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('notifications.sectionCalls')}</Text>
                    <NotificationItem
                        icon={Phone}
                        title={t('notifications.ringtone')}
                        value={getDisplayLabel('callRingtone', settings.callRingtone)}
                        type="select"
                        onPress={() => openSelectionModal(
                            t('notifications.ringtone'),
                            ringtoneOptions,
                            settings.callRingtone,
                            'callRingtone'
                        )}
                    />
                    <NotificationItem
                        icon={BellOff}
                        title={t('notifications.vibrate')}
                        value={getDisplayLabel('callVibrate', settings.callVibrate)}
                        type="select"
                        onPress={() => openSelectionModal(
                            t('notifications.vibrate'),
                            vibrateOptions,
                            settings.callVibrate,
                            'callVibrate'
                        )}
                    />
                </View>
            </ScrollView>

            {/* Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <Pressable style={styles.modalOverlay} onPress={closeModal}>
                    <Pressable style={styles.modalContent} onPress={() => { }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseText}>{t('common.close', 'Close')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalOptions}>
                            {modalOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={styles.modalOption}
                                    onPress={() => handleOptionSelect(option.key)}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        modalCurrentValue === option.key && styles.modalOptionTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {modalCurrentValue === option.key && (
                                        <Check size={20} color={COLORS.success} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.darkGray,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.lg,
    },
    itemIcon: {
        width: 40,
        marginRight: SPACING.md,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    itemSubtitle: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    itemValue: {
        fontSize: 14,
        color: COLORS.darkGray,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    modalCloseButton: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
    },
    modalCloseText: {
        fontSize: 16,
        color: COLORS.darkGray,
    },
    modalOptions: {
        paddingVertical: SPACING.sm,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 14,
    },
    modalOptionText: {
        fontSize: 16,
        color: COLORS.black,
    },
    modalOptionTextSelected: {
        fontWeight: '600',
        color: COLORS.success,
    },
});

export default NotificationsScreen;
