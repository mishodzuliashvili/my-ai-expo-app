import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from "react-native";
import { useRouter, Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { ChatInfo, useChatHistory } from "@/providers/ChatHistoryProvider";

export default function AppLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { chatHistory, setChatHistory } = useChatHistory();

    const backgroundColor = Colors[colorScheme ?? "light"].background;
    const textColor = Colors[colorScheme ?? "light"].text;
    const tintColor = Colors[colorScheme ?? "light"].tint;
    const cardColor = colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5";
    const borderColor = colorScheme === "dark" ? "#ffffff1a" : "#bdb9b9";

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const startNewChat = async () => {
        router.push({ pathname: "/", params: {} });
        setSidebarOpen(false);
    };

    const selectChat = (chatId: string) => {
        router.push({ pathname: "/chat/[id]", params: { id: chatId } });

        setSidebarOpen(false);
    };

    const deleteChat = async (chatId: string) => {
        const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
        setChatHistory(updatedHistory);

        try {
            await AsyncStorage.setItem(
                "chatHistory",
                JSON.stringify(updatedHistory)
            );
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

            {/* Header */}
            <View style={{ ...styles.header, borderColor: borderColor }}>
                <TouchableOpacity
                    onPress={toggleSidebar}
                    style={{
                        ...styles.menuButton,
                    }}
                >
                    <Ionicons name="menu" size={24} color={textColor} />
                </TouchableOpacity>

                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <TouchableOpacity
                        onPress={startNewChat}
                        style={{
                           
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            // zIndex: 1,
                            gap: "8",
                        }}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={24}
                            color={textColor}
                        />

                        <ThemedText style={[styles.logoText]}>
                            AI Chat
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {pathname !== "/" && (
                    <TouchableOpacity
                        onPress={startNewChat}
                        style={styles.newChatButton}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={24}
                            color={textColor}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content area with sidebar overlay */}
            <View style={styles.contentContainer}>
                {/* Sidebar */}
                {sidebarOpen && (
                    <View style={[styles.sidebar, { backgroundColor }]}>
                        <Text
                            style={[styles.historyLabel, { color: textColor }]}
                        >
                            Chat History
                        </Text>

                        <ScrollView style={styles.historyList}>
                            {chatHistory.length === 0 ? (
                                <Text
                                    style={[
                                        styles.emptyHistory,
                                        { color: textColor },
                                    ]}
                                >
                                    No chat history yet
                                </Text>
                            ) : (
                                chatHistory.map((chat) => (
                                    <TouchableOpacity
                                        key={chat.id}
                                        style={[
                                            styles.historyItem,
                                            {
                                                backgroundColor: cardColor,
                                                borderColor:
                                                    pathname ===
                                                    `/chat/${chat.id}`
                                                        ? tintColor
                                                        : "transparent",
                                                borderWidth:
                                                    pathname ===
                                                    `/chat/${chat.id}`
                                                        ? 1
                                                        : 0,
                                            },
                                        ]}
                                        onPress={() => selectChat(chat.id)}
                                    >
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={16}
                                            color={textColor}
                                        />
                                        <View style={styles.historyItemContent}>
                                            <Text
                                                style={[
                                                    styles.historyItemTitle,
                                                    { color: textColor },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {chat.title}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.historyItemPreview,
                                                    { color: textColor + "99" },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {chat.preview}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={{
                                                width: 60,
                                                height: "100%",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                            onPress={() => deleteChat(chat.id)}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={16}
                                                color={textColor}
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                )}

                {/* Main content */}
                <View style={styles.mainContent}>
                    <Slot />
                </View>

                {/* Overlay to close sidebar when clicked outside */}
                {sidebarOpen && (
                    <TouchableOpacity
                        style={styles.overlay}
                        onPress={toggleSidebar}
                        activeOpacity={0.2}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        height: 65,
        borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: "#ffffff1a",
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        zIndex: 1,
        gap: 8,
    },
    logoText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    newChatButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        position: "relative",
    },
    sidebar: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 280,
        height: "100%",
        zIndex: 10,
        paddingTop: 16,
        paddingHorizontal: 12,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: "#ffffff1a",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 5,
    },
    mainContent: {
        flex: 1,
    },
    newChatItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    newChatText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "500",
    },
    historyLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    historyList: {
        flex: 1,
    },
    historyItem: {
        flexDirection: "row",
        alignItems: "center",
        // padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        paddingLeft: 15,
        height: 55,
    },
    historyItemContent: {
        padding: 12,
        flex: 1,
        marginLeft: 8,
    },
    historyItemTitle: {
        fontSize: 14,
        fontWeight: "500",
    },
    historyItemPreview: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyHistory: {
        textAlign: "center",
        marginTop: 20,
        fontStyle: "italic",
    },
});
