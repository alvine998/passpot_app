import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import { Search, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import normalize from 'react-native-normalize';

interface HeaderProps {
    title: string;
    showSearch?: boolean;
    onSearchPress?: () => void;
}

type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Header = ({ title, showSearch = true, onSearchPress }: HeaderProps) => {
    const navigation = useNavigation<HeaderNavigationProp>();

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {/* <Text style={styles.title}>{title}</Text> */}
                <Image source={require('../assets/images/passpot_row_black-removebg.png')} style={{ width: normalize(150), height: normalize(50) }} />
            </View>
            <View style={styles.rightContainer}>
                {showSearch && (
                    <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
                        <Search size={24} color={COLORS.black} />
                    </TouchableOpacity>
                )}
                {/* <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
                    <MoreVertical size={24} color={COLORS.black} />
                </TouchableOpacity> */}
            </View>
        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
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
        marginLeft: SPACING.md,
        padding: SPACING.xs,
    },
});

export default Header;
