import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/ApiService';

const AUTH_STORAGE_KEY = '@passpot_auth';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userEmail: string | null;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Check stored auth state on app launch
    useEffect(() => {
        const checkAuthState = async () => {
            try {
                const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
                if (storedAuth) {
                    const authData = JSON.parse(storedAuth);
                    setIsAuthenticated(true);
                    setUserEmail(authData.email);
                }
            } catch (error) {
                console.error('Error loading auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthState();
    }, []);

    const login = async (email: string) => {
        try {
            const authData = { email, loggedInAt: new Date().toISOString() };
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
            setUserEmail(email);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error saving auth state:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call backend logout
            await api.post('/auth/logout').catch(err => console.error('Backend logout error:', err));

            // Clear API token from storage
            await api.removeAuthToken();

            // Clear local auth state
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setUserEmail(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error clearing auth state:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
