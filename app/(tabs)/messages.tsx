import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Screen from "@/components/ui/Screen";
import { useTheme } from "@/lib/ui/ThemeProvider";
import { Text, View } from "react-native";

export default function Messages() {
  const { palette } = useTheme();
  return (
    <Screen>
      <Header title="Messages" />
      <View style={{ gap: 12, marginTop: 8 }}>
        <Card>
          <Text style={{ color: palette.text, fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 6 }}>
            Your conversations
          </Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular" }}>
            Connect with potential roommates and landlords.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
