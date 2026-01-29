import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { api } from '../services/ApiService';

interface ProfileData {
    id: number;
    email: string;
    userCode: string;
    displayName: string;
    avatar: string | null;
    twoFactorSecret?: string | null;
    pin?: string | null;
}

interface ProfileContextType {
    name: string;
    photo: string | null;
    pin: string;
    email: string | null;
    userCode: string | null;
    id: number | null;
    securityPIN: string | null;
    twoFactorSecret: string | null;
    isLoading: boolean;
    error: string | null;
    setName: (name: string) => void;
    setPhoto: (photo: string | null) => void;
    setSecurityPIN: (pin: string) => void;
    isUnlocked: boolean;
    setUnlocked: (unlocked: boolean) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (name: string, photo: string | null) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('Agen Passpot');
    const [photo, setPhoto] = useState<string | null>(null);
    const [pin, setPin] = useState('');
    const [email, setEmail] = useState<string | null>(null);
    const [userCode, setUserCode] = useState<string | null>(null);
    const [id, setId] = useState<number | null>(null);
    const [securityPIN, setSecurityPIN] = useState<string | null>(null);
    const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
    const [isUnlocked, setUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ success: boolean; data: ProfileData }>('/users/profile');
            if (response.data && response.data.data) {
                const profile = response.data.data;
                setName(profile.displayName);
                setPhoto(profile.avatar);
                setPin(profile.userCode);
                setUserCode(profile.userCode);
                setEmail(profile.email);
                setId(profile.id);
                setSecurityPIN(profile.pin || null);
                setTwoFactorSecret(profile.twoFactorSecret || null);
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'Failed to retrieve profile');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateProfile = async (newName: string, newPhoto: string | null): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('displayName', newName);

            if (newPhoto && !newPhoto.startsWith('http')) {
                // If it's a local URI (from picker), send as file
                formData.append('file', {
                    uri: newPhoto,
                    name: 'avatar.jpg',
                    type: 'image/jpeg',
                } as any);
            } else if (newPhoto) {
                // If it's already a URL, send as avatar string
                formData.append('avatar', newPhoto);
            }

            const response = await api.put<{ success: boolean; data: ProfileData }>('/users/profile', formData);
            if (response.data && response.data.data) {
                const profile = response.data.data;
                setName(profile.displayName);
                setPhoto(profile.avatar);
                setUserCode(profile.userCode);
                setEmail(profile.email);
                setId(profile.id);
                setSecurityPIN(profile.pin || null);
                setTwoFactorSecret(profile.twoFactorSecret || null);
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <ProfileContext.Provider value={{
            name, photo, pin, email, userCode, id, securityPIN, twoFactorSecret, isUnlocked, isLoading, error,
            setName, setPhoto, setSecurityPIN, setUnlocked, fetchProfile, updateProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
