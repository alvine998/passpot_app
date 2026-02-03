import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, Pressable } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { MoreVertical, Camera, ImageIcon, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import normalize from 'react-native-normalize';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { useStatus } from '../context/StatusContext';

interface HeaderProps {
    title: string;
    showSearch?: boolean;
    onSearchPress?: () => void;
}

type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Header = ({ title, showSearch = true, onSearchPress }: HeaderProps) => {
    const navigation = useNavigation<HeaderNavigationProp>();
    const { createStatus } = useStatus();
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const handleMediaSelection = async (useCamera: boolean) => {
        setShowMediaPicker(false);

        const options: CameraOptions | ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8,
        };

        const callback = async (response: any) => {
            if (response.didCancel) {
                return;
            }
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to pick image');
                return;
            }
            if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                const success = await createStatus(asset.uri!, 'image');
                if (!success) {
                    Alert.alert('Error', 'Failed to upload status');
                }
            }
        };

        if (useCamera) {
            launchCamera(options as CameraOptions, callback);
        } else {
            launchImageLibrary(options as ImageLibraryOptions, callback);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    {/* <Text style={styles.title}>{title}</Text> */}
                    <Image source={require('../assets/images/passpot_row_black-removebg.png')} style={{ width: normalize(150), height: normalize(50) }} />
                </View>
                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setShowMediaPicker(true)}>
                        <Camera size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
                        <MoreVertical size={24} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Media Picker Modal */}
            <Modal
                visible={showMediaPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMediaPicker(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowMediaPicker(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Status</Text>
                            <TouchableOpacity onPress={() => setShowMediaPicker(false)}>
                                <X size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleMediaSelection(true)}
                        >
                            <Camera size={24} color={COLORS.black} />
                            <Text style={styles.optionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleMediaSelection(false)}
                        >
                            <ImageIcon size={24} color={COLORS.black} />
                            <Text style={styles.optionText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: normalize(60),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.white,
        // borderBottomWidth: 1,
        // borderBottomColor: COLORS.lightGray,
    },
    leftContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.black,
        letterSpacing: 0.5,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: SPACING.sm,
        padding: SPACING.xs,
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
        padding: SPACING.lg,
        paddingBottom: SPACING.xl + 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.black,
        marginLeft: SPACING.md,
    },
});

export default Header;

