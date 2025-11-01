import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { View } from "react-native";

export function FontsProvider({ children }: { children: React.ReactNode }) {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  return <>{children}</>;
}


