import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { api } from '../services/ApiService';

export interface StatusUser {
    id: number;
    email: string;
    userCode: string;
    displayName: string;
    avatar: string;
}

export interface Story {
    id: number;
    userId: number;
    content: string;
    type: string;
    expiresAt: string;
    createdAt: string;
}

export interface UserStatus {
    user: StatusUser;
    stories: Story[];
}

interface StatusContextType {
    statuses: UserStatus[];
    isLoading: boolean;
    error: string | null;
    fetchStatuses: () => Promise<void>;
    createStatus: (content: string, type: string) => Promise<boolean>;
    deleteStatus: (id: number) => Promise<boolean>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
    const [statuses, setStatuses] = useState<UserStatus[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatuses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ success: boolean; data: UserStatus[] }>('/status');
            if (response.data && response.data.data) {
                setStatuses(response.data.data);
            }
        } catch (err: any) {
            console.error('Error fetching statuses:', err);
            setError(err.message || 'Failed to fetch statuses');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createStatus = useCallback(async (content: string, type: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.post<{ success: boolean }>('/status', { content, type });
            if (response.data.success) {
                await fetchStatuses(); // Refresh after create
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('Error creating status:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchStatuses]);

    const deleteStatus = useCallback(async (id: number): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await api.delete<{ success: boolean }>(`/status/${id}`);
            if (response.data.success) {
                await fetchStatuses(); // Refresh after delete
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('Error deleting status:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchStatuses]);

    return (
        <StatusContext.Provider value={{
            statuses,
            isLoading,
            error,
            fetchStatuses,
            createStatus,
            deleteStatus
        }}>
            {children}
        </StatusContext.Provider>
    );
};

export const useStatus = () => {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error('useStatus must be used within a StatusProvider');
    }
    return context;
};
