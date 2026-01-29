import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING } from '../styles/theme';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

type LogoutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Logout'>;

const LogoutScreen = () => {
    const navigation = useNavigation<LogoutScreenNavigationProp>();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout? You will need to verify your email and 2FA again to sign in.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        // Clear persisted auth state
                        await logout();
                        // Clear stack and navigate to Welcome
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            })
                        );
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Logout</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <ShieldAlert size={80} color={COLORS.black} />
                </View>

                <Text style={styles.title}>Signing Out?</Text>
                <Text style={styles.description}>
                    Logging out will remove your active session. You'll need your email access and Google Authenticator code to sign back in.
                </Text>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={COLORS.white} />
                    <Text style={styles.logoutButtonText}>LOGOUT</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>KEEP ME SIGNED IN</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: SPACING.xl,
        opacity: 0.1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: 15,
        color: COLORS.darkGray,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    logoutButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10,
    },
    cancelButton: {
        padding: SPACING.md,
    },
    cancelButtonText: {
        color: COLORS.black,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LogoutScreen;
