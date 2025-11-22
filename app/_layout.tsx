import { AuthProvider } from "@/lib/auth/AuthContext";
import { FontsProvider } from "@/lib/ui/Fonts";
import { ThemeProvider } from "@/lib/ui/ThemeProvider";
import { ApartmentsProvider } from "@/context/ApartmentsContext";
import { SavedApartmentsProvider } from "@/context/SavedApartmentsContext";
import { ToastProvider } from "@/lib/ui/ToastAlertsProvider";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <FontsProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ApartmentsProvider>
              <SavedApartmentsProvider>
                <StatusBar barStyle="dark-content" />
                <Stack screenOptions={{ headerShown: false }} />
              </SavedApartmentsProvider>
            </ApartmentsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </FontsProvider>
  );
}
