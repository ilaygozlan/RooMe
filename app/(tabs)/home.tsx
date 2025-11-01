import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Screen from "@/components/ui/Screen";
import { useTheme } from "@/lib/ui/ThemeProvider";
import { Text, View } from "react-native";

export default function Home() {
  const { palette } = useTheme();
  return (
    <Screen>
      <Header title="Roome" />
      <View style={{ gap: 12, marginTop: 8 }}>
        <Card>
          <Text style={{ color: palette.text, fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 6 }}>
            Welcome 👋
          </Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular" }}>
            Start exploring apartments and roommate matches tailored for you.
          </Text>
        </Card>
        <Card>
          <Text style={{ color: palette.text, fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 6 }}>
            Quick actions
          </Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular" }}>
            Search • Post listing • Messages
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
