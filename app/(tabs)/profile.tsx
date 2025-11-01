import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/ui/ThemeProvider";
import { Text, View } from "react-native";

export default function Profile() {
  const { logout, user } = useAuth();
  const { palette } = useTheme();
  return (
    <Screen>
      <Header title="Profile" />
      <View style={{ gap: 12, marginTop: 8 }}>
        <Card>
          <Text style={{ color: palette.text, fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 6 }}>
            Account
          </Text>
          {user ? (
            <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular", marginBottom: 12 }}>
              Signed in as {user.displayName} ({user.email})
            </Text>
          ) : null}
          <Button title="Sign out" onPress={() => logout()} />
        </Card>
      </View>
    </Screen>
  );
}
