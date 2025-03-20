import { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Platform,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { View, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateAPIUrl } from "@/utils";
import { Message, useChat } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import Markdown from "react-native-markdown-display";

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const [savedMessages, setSavedMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const colorScheme = useColorScheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    const textColor = Colors[colorScheme ?? "light"].text;
    const markdownStyles = {};

    useEffect(() => {
        const loadChatMessages = async () => {
            try {
                setIsLoading(true);
                const messagesData = await AsyncStorage.getItem(
                    `chat_${id}_messages`
                );
                if (messagesData) {
                    const parsedMessages = JSON.parse(messagesData);
                    setSavedMessages(parsedMessages);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load chat messages:", error);
                setIsLoading(false);
            }
        };

        if (id) {
            loadChatMessages();
        }
    }, [id]);

    const { messages, error, handleInputChange, input, handleSubmit } = useChat(
        {
            fetch: expoFetch as unknown as typeof globalThis.fetch,
            api: generateAPIUrl("/api/chat"),
            onError: (error) => console.error(error, "ERROR"),
            initialMessages: savedMessages,

            onResponse: async () => {
                setTimeout(async () => {
                    inputRef.current?.focus();
                    if (messages.length === 2) {
                        try {
                            const historyData = await AsyncStorage.getItem(
                                "chatHistory"
                            );
                            if (historyData) {
                                const history = JSON.parse(historyData);
                                const updatedHistory = history.map(
                                    (chat: any) => {
                                        if (chat.id === id) {
                                            const userMessage =
                                                messages[0].content;
                                            const title =
                                                userMessage.length > 25
                                                    ? userMessage.substring(
                                                          0,
                                                          25
                                                      ) + "..."
                                                    : userMessage;

                                            const aiMessage =
                                                messages[1].content;
                                            const preview =
                                                aiMessage.length > 40
                                                    ? aiMessage.substring(
                                                          0,
                                                          40
                                                      ) + "..."
                                                    : aiMessage;

                                            return {
                                                ...chat,
                                                title,
                                                preview,
                                                lastUpdated: Date.now(),
                                            };
                                        }
                                        return chat;
                                    }
                                );

                                await AsyncStorage.setItem(
                                    "chatHistory",
                                    JSON.stringify(updatedHistory)
                                );
                            }
                        } catch (error) {
                            console.error("Failed to update chat info:", error);
                        }
                    }

                    try {
                        await AsyncStorage.setItem(
                            `chat_${id}_messages`,
                            JSON.stringify(messages)
                        );
                    } catch (error) {
                        console.error("Failed to save messages:", error);
                    }
                }, 100);
            },
        }
    );

    useEffect(() => {
        if (
            messages.length > 0 &&
            messages[messages.length - 1].role === "user"
        ) {
            handleSubmit();
        }
    }, []);
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    useEffect(() => {
        const saveMessages = async () => {
            try {
                await AsyncStorage.setItem(
                    `chat_${id}_messages`,
                    JSON.stringify(messages)
                );
            } catch (error) {
                console.error("Failed to save messages:", error);
            }
        };

        if (messages.length > 0) {
            saveMessages();
        }
    }, [messages, id]);

    const isGenerating =
        messages.length > 0 && messages[messages.length - 1].role === "user";

    if (error) return <ThemedText>{error.message}</ThemedText>;

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                    Loading chat...
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.messageContainer}
                contentContainerStyle={styles.scrollViewContent}
            >
                {messages.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>
                            Start a new conversation
                        </ThemedText>
                    </ThemedView>
                ) : (
                    messages.map((m) => (
                        <ThemedView
                            key={m.id}
                            style={[
                                styles.messageItem,
                                m.role === "user"
                                    ? styles.userMessage
                                    : {
                                          ...styles.botMessage,
                                          backgroundColor:
                                              colorScheme === "dark"
                                                  ? "#2a2a2a"
                                                  : "#e8e8e8",
                                      },
                            ]}
                        >
                            <Markdown
                                style={{
                                    body: {
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                    },
                                    heading1: {
                                        fontSize: 24,
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                    },
                                    heading2: {
                                        fontSize: 20,
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                    },
                                    heading3: {
                                        fontSize: 18,
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                    },
                                    paragraph: {
                                        fontSize: 16,
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                    },
                                    link: {
                                        color: "#007AFF",
                                    },
                                    code_block: {
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "#3a3a3a"
                                                : "#e1e1e1",
                                    },
                                    code_inline: {
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "#3a3a3a"
                                                : "#e1e1e1",
                                        borderWidth: 0,
                                        padding: 0,
                                        paddingHorizontal: 4,
                                    },
                                    fence: {
                                        color:
                                            m.role === "user"
                                                ? "#fff"
                                                : textColor,
                                        backgroundColor:
                                            colorScheme === "dark"
                                                ? "#3a3a3a"
                                                : "#e1e1e1",
                                        borderWidth: 0,
                                        padding: 10,
                                    },
                                }}
                            >
                                {m.content}
                            </Markdown>
                        </ThemedView>
                    ))
                )}

                {isGenerating && (
                    <ThemedView style={styles.generatingContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <ThemedText style={styles.generatingText}>
                            Generating response...
                        </ThemedText>
                    </ThemedView>
                )}
            </ScrollView>

            <ThemedView
                style={{
                    padding: 16,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <ThemedView
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor:
                                colorScheme === "dark" ? "#2a2a2a" : "#e8e8e8",
                        },
                    ]}
                >
                    <TextInput
                        ref={inputRef}
                        style={{
                            ...styles.input,
                            outline: "none",
                            color: colorScheme === "dark" ? "#fff" : "#000",
                        }}
                        placeholder="Type a message..."
                        placeholderTextColor={
                            Colors[colorScheme ?? "light"].text
                        }
                        value={input}
                        onChange={(e) =>
                            handleInputChange({
                                ...e,
                                target: {
                                    ...e.target,
                                    value: e.nativeEvent.text,
                                },
                            } as unknown as React.ChangeEvent<HTMLInputElement>)
                        }
                        onSubmitEditing={(e) => {
                            if (isGenerating) return;
                            handleSubmit(e);
                            e.preventDefault();
                        }}
                        autoFocus
                    />
                    <TouchableOpacity
                        onPress={(e) => {
                            handleSubmit(e);
                            // Keyboard.dismiss();
                        }}
                        disabled={!input.trim()}
                        style={[
                            styles.sendButton,
                            !input.trim() && styles.sendButtonDisabled,
                        ]}
                    >
                        <Ionicons
                            name="send"
                            size={18}
                            color={input.trim() ? "#FFFFFF" : "#AAAAAA"}
                        />
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    messageContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollViewContent: {
        paddingTop: 16,
        paddingBottom: 100,
    },
    messageItem: {
        marginVertical: 8,
        padding: 16,
        borderRadius: 16,
        maxWidth: "80%",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#007AFF",
        color: "#fff",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#2a2a2a",
    },
    messageContent: {
        fontSize: 16,
        color: "#fff",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: "100%",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        position: "relative",
        bottom: 0,
        // left: 0,
        // left: 16,
        // right: 16,
        // marginHorizontal: 10,
        elevation: 4,
    },
    input: {
        width: "100%",
        flex: 1,
        fontSize: 16,
        borderWidth: 0,
        paddingVertical: Platform.OS === "android" ? 12 : 0,
    },
    sendButton: {
        backgroundColor: "#007AFF",
        borderRadius: 50,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    sendButtonDisabled: {
        backgroundColor: "#E0E0E0",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
    },
    generatingContainer: {
        alignItems: "center",
        marginVertical: 10,
    },
    generatingText: {
        marginTop: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 300,
    },
    emptyText: {
        color: "#999",
        fontSize: 16,
    },
});
