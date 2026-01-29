import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { api } from '../services/ApiService';

export interface ChatUser {
    id: number;
    email: string;
    userCode: string;
    displayName: string;
    avatar: string | null;
    fcmToken: string | null;
}

export interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    messageType?: string;
    fileUrl?: string;
    createdAt: string;
    sender: ChatUser;
}

export interface Conversation {
    id: number;
    isGroup: boolean;
    lastMessageId: number | null;
    updatedAt: string;
    Users: ChatUser[];
    lastMessage: {
        id: number;
        content: string;
        createdAt: string;
    } | null;
}

interface SendMessageParams {
    conversationId?: string;
    recipientId?: number;
    recipientCode?: string;
    messageType?: string;
    file?: {
        uri: string;
        type: string;
        name: string;
    };
}

interface ChatContextType {
    conversations: Conversation[];
    isLoading: boolean;
    error: string | null;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<ChatMessage[]>;
    sendMessage: (content: string, params: SendMessageParams) => Promise<ChatMessage | null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations');
            if (response.data.success) {
                setConversations(response.data.data);
            } else {
                setError('Failed to fetch conversations');
            }
        } catch (err: any) {
            console.error('Error fetching conversations:', err);
            setError(err.message || 'An error occurred while fetching conversations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const response = await api.get<{ success: boolean; data: ChatMessage[] }>(`/chat/messages/${conversationId}`);
            if (response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (err) {
            console.error('Error fetching messages:', err);
            return [];
        }
    }, []);

    const sendMessage = useCallback(async (content: string, params: SendMessageParams) => {
        try {
            // Build FormData for multipart/form-data request
            const formData = new FormData();

            // Add conversation or recipient identifier
            if (params.conversationId) {
                formData.append('conversationId', params.conversationId);
            }
            if (params.recipientId) {
                formData.append('recipientId', params.recipientId.toString());
            }
            if (params.recipientCode) {
                formData.append('recipientCode', params.recipientCode);
            }

            // Add content if provided
            if (content) {
                formData.append('content', content);
            }

            // Add message type if provided
            if (params.messageType) {
                formData.append('messageType', params.messageType);
            }

            // Add file if provided
            if (params.file) {
                formData.append('file', {
                    uri: params.file.uri,
                    type: params.file.type,
                    name: params.file.name,
                } as any);
            }

            const response = await api.post<{ success: boolean; data: ChatMessage }>('/chat/messages', formData);

            if (response.data.success) {
                // Refresh conversations to update last message
                fetchConversations();
                return response.data.data;
            }
            return null;
        } catch (err) {
            console.error('Error sending message:', err);
            return null;
        }
    }, [fetchConversations]);

    return (
        <ChatContext.Provider value={{
            conversations,
            isLoading,
            error,
            fetchConversations,
            fetchMessages,
            sendMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
