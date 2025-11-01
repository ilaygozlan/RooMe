import { useTheme } from "@/lib/ui/ThemeProvider";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  const { palette } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, paddingHorizontal: padded ? 20 : 0, paddingTop: padded ? 12 : 0 }}>{children}</View>
    </SafeAreaView>
  );
}



