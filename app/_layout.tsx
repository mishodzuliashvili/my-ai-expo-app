import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ChatHistoryProvider } from "@/providers/ChatHistoryProvider";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "react-native/Libraries/NewAppScreen";
import "@/polyfills";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const pathname = usePathname();

    const colorScheme = useColorScheme();

    const backgroundColor = Colors[colorScheme ?? "light"].background;
    const textColor = Colors[colorScheme ?? "light"].text;
    const tintColor = Colors[colorScheme ?? "light"].tint;
    const cardColor = colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5";
    const borderColor = colorScheme === "dark" ? "#ffffff1a" : "#bdb9b9";

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }
    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <ChatHistoryProvider>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
            </ChatHistoryProvider>
        </ThemeProvider>
    );
}
