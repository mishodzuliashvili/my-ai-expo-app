import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatInfo = {
    id: string;
    title: string;
    lastUpdated: number;
    preview: string;
};

export type ChatHistoryContextType = {
    chatHistory: ChatInfo[];
    setChatHistory: (history: ChatInfo[]) => void;
};

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
    undefined
);

export const ChatHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [chatHistory, setChatHistory] = useState<ChatInfo[]>([]);

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const historyData = await AsyncStorage.getItem("chatHistory");
                if (historyData) {
                    const parsedHistory = JSON.parse(historyData) as ChatInfo[];
                    parsedHistory.sort((a, b) => b.lastUpdated - a.lastUpdated);
                    setChatHistory(parsedHistory);
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            }
        };

        loadChatHistory();
    }, []);

    return (
        <ChatHistoryContext.Provider value={{ chatHistory, setChatHistory }}>
            {children}
        </ChatHistoryContext.Provider>
    );
};

export const useChatHistory = () => {
    const context = useContext(ChatHistoryContext);
    if (!context) {
        throw new Error(
            "useChatHistory must be used within a ChatHistoryProvider"
        );
    }
    return context;
};
