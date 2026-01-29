import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { api } from '../services/ApiService';
import { socketService } from '../services/SocketService';

export interface Friend {
    id: number;
    email: string;
    userCode: string;
    displayName: string;
    avatar: string;
    fcmToken?: string;
    isOnline?: boolean;
}

interface FriendsContextType {
    friends: Friend[];
    isLoading: boolean;
    error: string | null;
    fetchFriends: () => Promise<void>;
    addFriend: (friendCode: string) => Promise<{ success: boolean; message?: string }>;
    removeFriend: (id: number) => Promise<boolean>;
    friendRequests: Friend[];
    fetchFriendRequests: () => Promise<void>;
    acceptFriendRequest: (senderId: number) => Promise<boolean>;
    rejectFriendRequest: (senderId: number) => Promise<boolean>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ success: boolean; message: string; data: Friend[] }>('/friends');
            console.log('Fetch friends response:', response.data);
            if (response.data && response.data.data) {
                console.log('Friends loaded:', response.data.data.length);
                setFriends(response.data.data);
            } else {
                console.log('No friends data in response');
                setFriends([]);
            }
        } catch (err: any) {
            console.error('Error fetching friends:', err);
            setError(err.message || 'Failed to fetch friends');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Listen for socket events
    useEffect(() => {
        const handleUserOnline = ({ userId }: { userId: number }) => {
            console.log('User online:', userId);
            setFriends(prev => prev.map(f =>
                f.id === userId ? { ...f, isOnline: true } : f
            ));
        };

        const handleUserOffline = ({ userId }: { userId: number }) => {
            console.log('User offline:', userId);
            setFriends(prev => prev.map(f =>
                f.id === userId ? { ...f, isOnline: false } : f
            ));
        };

        // We need to wait for socket to be initialized/connected
        // Re-register listeners if friends list changes (or better, just once if using functional state updates)
        // Actually, we can just register once.

        socketService.onUserOnline(handleUserOnline);
        socketService.onUserOffline(handleUserOffline);

        return () => {
            socketService.offStatusEvents();
        };
    }, []); // Empty dependency array as we use functional state updates

    const fetchFriendRequests = useCallback(async () => {
        try {
            const response = await api.get<{ success: boolean; data: Friend[] }>('/friends/requests');
            if (response.data && response.data.data) {
                setFriendRequests(response.data.data);
            } else {
                setFriendRequests([]);
            }
        } catch (err) {
            console.error('Error fetching friend requests:', err);
        }
    }, []);

    const acceptFriendRequest = useCallback(async (senderId: number): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean }>(`/friends/${senderId}/accept`);
            if (response.data.success) {
                await Promise.all([fetchFriends(), fetchFriendRequests()]); // Refresh both lists
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error accepting friend request:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchFriends, fetchFriendRequests]);

    const rejectFriendRequest = useCallback(async (senderId: number): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean }>(`/friends/${senderId}/reject`);
            if (response.data.success) {
                await fetchFriendRequests(); // Refresh requests list
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error rejecting friend request:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchFriendRequests]);

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
            removeFriend,
            friendRequests,
            fetchFriendRequests,
            acceptFriendRequest,
            rejectFriendRequest
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
