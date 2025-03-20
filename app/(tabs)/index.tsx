import {
    StyleSheet,
    TextInput,
    Platform,
    Keyboard,
    ScrollView,
} from "react-native";
import { View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
        width: "100%",
    },
    scrollViewContent: {
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: "center",
    },
    welcomeContainer: {
        maxWidth: 600,
        width: "90%",
        alignItems: "center",
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
        opacity: 0.7,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#202224",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "white",
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
    ideasSection: {
        width: "100%",
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "left",
        alignSelf: "flex-start",
    },
    ideasGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    ideaCard: {
        width: "48%",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        elevation: 3,
        borderWidth: 1,
    },
    ideaIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    ideaTitle: {
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
    },
    recentChatsSection: {
        width: "100%",
        marginBottom: 30,
    },
    recentChatCard: {
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    recentChatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    recentChatTitle: {
        fontSize: 14,
        fontWeight: "500",
    },
    recentChatDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    newChatButton: {
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        justifyContent: "center",
    },
    newChatText: {
        color: "white",
        fontWeight: "600",
        marginLeft: 8,
        fontSize: 16,
    },
});

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [inputText, setInputText] = useState("");

    const quickIdeas = [
        {
            icon: "brain",
            title: "Creative Writing",
            prompt: "Help me write a short story about a robot discovering emotions.",
        },
        {
            icon: "food-apple",
            title: "Recipe Ideas",
            prompt: "Suggest a healthy dinner recipe using chicken, broccoli, and rice.",
        },
        {
            icon: "lightbulb-outline",
            title: "Brainstorm",
            prompt: "Help me brainstorm ideas for my science project about renewable energy.",
        },
        {
            icon: "translate",
            title: "Language Helper",
            prompt: "Translate 'I would like to learn your language' to Spanish, French, and Japanese.",
        },
    ];

    const startNewChat = async (initialMessage: string) => {
        const newChatId = Date.now().toString();

        if (initialMessage) {
            try {
                const firstMessage = {
                    id: `user-${Date.now()}`,
                    role: "user",
                    content: initialMessage,
                };

                await AsyncStorage.setItem(
                    `chat_${newChatId}_messages`,
                    JSON.stringify([firstMessage])
                );

                const newChat = {
                    id: newChatId,
                    title:
                        initialMessage.length > 25
                            ? initialMessage.substring(0, 25) + "..."
                            : initialMessage,
                    lastUpdated: Date.now(),
                    preview: "Start a new conversation",
                };

                // Update chat history
                const historyData = await AsyncStorage.getItem("chatHistory");
                let updatedHistory = [];

                if (historyData) {
                    const parsedHistory = JSON.parse(historyData);
                    updatedHistory = [newChat, ...parsedHistory];
                } else {
                    updatedHistory = [newChat];
                }

                await AsyncStorage.setItem(
                    "chatHistory",
                    JSON.stringify(updatedHistory)
                );
            } catch (error) {
                console.error("Failed to create new chat:", error);
            }
        }

        // Navigate to the new chat
        router.push(`/chat/${newChatId}`);
    };

    const handleSubmit = () => {
        if (inputText.trim()) {
            startNewChat(inputText.trim());
            setInputText("");
            Keyboard.dismiss();
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.welcomeContainer}>
                    <ThemedText style={styles.welcomeTitle}>
                        AI Chat Assistant
                    </ThemedText>
                    <ThemedText style={styles.welcomeSubtitle}>
                        Your personal AI companion for questions, ideas, and
                        conversations
                    </ThemedText>

                    <ThemedView style={styles.ideasSection}>
                        <ThemedView style={styles.ideasGrid}>
                            {quickIdeas.map((idea, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        ...styles.ideaCard,

                                        borderColor:
                                            colorScheme === "dark"
                                                ? "#2a2a2a"
                                                : "rgba(0, 0, 0, 0.36)",
                                    }}
                                    onPress={() => startNewChat(idea.prompt)}
                                >
                                    <LinearGradient
                                        colors={["#007AFF", "#00C6FF"]}
                                        style={styles.ideaIconContainer}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialCommunityIcons
                                            name={idea.icon as any}
                                            size={20}
                                            color="white"
                                        />
                                    </LinearGradient>
                                    <ThemedText style={styles.ideaTitle}>
                                        {idea.title}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ThemedView>
                    </ThemedView>

                    <View
                        style={{
                            ...styles.inputContainer,
                            backgroundColor:
                                colorScheme === "dark" ? "#2a2a2a" : "#e8e8e8",
                        }}
                    >
                        <Ionicons
                            name="search"
                            size={20}
                            color="#999"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={{
                                ...styles.input,
                                outline: "none",
                                color: colorScheme === "dark" ? "#fff" : "#000",
                            }}
                            placeholder="Ask me anything..."
                            placeholderTextColor={
                                Colors[colorScheme ?? "light"].text
                            }
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSubmit}
                            returnKeyType="send"
                        />
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!inputText.trim()}
                            style={[
                                styles.sendButton,
                                !inputText.trim() && styles.sendButtonDisabled,
                            ]}
                        >
                            <Ionicons
                                name="send"
                                size={18}
                                color={inputText.trim() ? "#FFFFFF" : "#AAAAAA"}
                            />
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}
