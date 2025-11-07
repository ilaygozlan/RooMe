import { AuthProvider } from "@/lib/auth/AuthContext";
import { FontsProvider } from "@/lib/ui/Fonts";
import { ThemeProvider } from "@/lib/ui/ThemeProvider";
import { ApartmentsProvider } from "@/context/ApartmentsContext";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <FontsProvider>
      <ThemeProvider>
        <AuthProvider>
          <ApartmentsProvider>
          <StatusBar barStyle="dark-content" />
          <Stack screenOptions={{ headerShown: false }} />
          </ApartmentsProvider>
        </AuthProvider>
      </ThemeProvider>
    </FontsProvider>
  );
}
