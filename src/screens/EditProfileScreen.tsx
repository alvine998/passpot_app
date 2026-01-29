import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { ArrowLeft, Camera, Check, User, Info, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import { useProfile } from '../context/ProfileContext';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const { t } = useTranslation();
    const {
        name: contextName,
        photo: contextPhoto,
        email: contextEmail,
        userCode: contextUserCode,
        isLoading,
        updateProfile
    } = useProfile();

    const [name, setName] = useState(contextName);
    const [about, setAbout] = useState('Securely connected');
    const [phone, setPhone] = useState(contextEmail || '');
    const [photo, setPhoto] = useState<string | null>(contextPhoto);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(contextName);
        setPhoto(contextPhoto);
        setPhone(contextEmail || '');
    }, [contextName, contextPhoto, contextEmail]);

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateProfile(name, photo);
        setIsSaving(false);

        if (success) {
            Toast.show({
                type: 'success',
                text1: t('editProfile.successTitle', 'Success'),
                text2: t('editProfile.successDesc', 'Profile updated successfully'),
                position: 'bottom'
            });
            navigation.goBack();
        } else {
            Toast.show({
                type: 'error',
                text1: t('editProfile.errorTitle', 'Error'),
                text2: t('editProfile.errorDesc', 'Failed to update profile'),
                position: 'bottom'
            });
        }
    };

    const handleChangePhoto = () => {
        launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1000,
            maxHeight: 1000,
        }, (response) => {
            if (response.assets && response.assets.length > 0) {
                setPhoto(response.assets[0].uri || null);
            }
        });
    };

    if (isLoading && !contextName) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.black} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isSaving}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('editProfile.title')}</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={COLORS.black} />
                    ) : (
                        <Check size={24} color={COLORS.black} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={handleChangePhoto} style={styles.avatar} disabled={isSaving}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.avatarImage} />
                            ) : (
                                <User size={60} color={COLORS.white} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleChangePhoto} style={styles.cameraIcon} disabled={isSaving}>
                            <Camera size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleChangePhoto} disabled={isSaving}>
                        <Text style={styles.changePhotoText}>{t('editProfile.changePhoto')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                        <User size={22} color={COLORS.darkGray} />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>{t('editProfile.name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('editProfile.namePlaceholder')}
                            editable={!isSaving}
                        />
                        <Text style={styles.inputHint}>{t('editProfile.nameHint')}</Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                        <Info size={22} color={COLORS.darkGray} />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>{t('editProfile.about')}</Text>
                        <TextInput
                            style={styles.input}
                            value={about}
                            onChangeText={setAbout}
                            placeholder={t('editProfile.aboutPlaceholder')}
                            editable={!isSaving}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                        <Phone size={22} color={COLORS.darkGray} />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>EMAIL / {t('editProfile.phone', 'PHONE')}</Text>
                        <TextInput
                            value={phone}
                            editable={false}
                            style={[styles.input, { color: COLORS.darkGray }]}
                        />
                        <Text style={styles.inputHint}>User Code: {contextUserCode}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
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
        marginRight: SPACING.lg,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
    },
    saveButton: {
        padding: SPACING.xs,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.black,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    changePhotoText: {
        marginTop: SPACING.md,
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    inputIcon: {
        marginTop: 10,
        width: 50,
    },
    inputWrapper: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: SPACING.md,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        color: COLORS.black,
        paddingVertical: 4,
    },
    inputHint: {
        fontSize: 12,
        color: COLORS.darkGray,
        marginTop: 8,
        lineHeight: 18,
    },
});

export default EditProfileScreen;
