import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { api } from '../services/ApiService';

export interface Friend {
    id: number;
    email: string;
    userCode: string;
    displayName: string;
    avatar: string;
}

interface FriendsContextType {
    friends: Friend[];
    isLoading: boolean;
    error: string | null;
    fetchFriends: () => Promise<void>;
    addFriend: (friendCode: string) => Promise<{ success: boolean; message?: string }>;
    removeFriend: (id: number) => Promise<boolean>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ success: boolean; message: string; data: Friend[] }>('/friends');
            if (response.data && response.data.data) {
                setFriends(response.data.data);
            }
        } catch (err: any) {
            console.error('Error fetching friends:', err);
            setError(err.message || 'Failed to fetch friends');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addFriend = useCallback(async (friendCode: string): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean; message: string }>('/friends', { friendCode });
            if (response.data.success) {
                await fetchFriends();
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (err: any) {
            // Check specifically for 404 Not Found error
            if (err.status === 404) {
                return { success: false, message: 'User not found' };
            }
            return { success: false, message: err.message || 'Failed to add friend' };
        } finally {
            setIsLoading(false);
        }
    }, [fetchFriends]);

    const removeFriend = useCallback(async (id: number): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.delete<{ success: boolean }>(`/friends/${id}`);
            if (response.data.success) {
                await fetchFriends();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('Error removing friend:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchFriends]);

    return (
        <FriendsContext.Provider value={{
            friends,
            isLoading,
            error,
            fetchFriends,
            addFriend,
            removeFriend
        }}>
            {children}
        </FriendsContext.Provider>
    );
};

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
};
