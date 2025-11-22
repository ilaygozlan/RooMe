import { useTheme } from "@/lib/ui/ThemeProvider";
import { Text, View } from "react-native";

export default function Header({ title }: { title: string }) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingVertical: 6 }}>
      <Text style={{ color: palette.text, fontSize: 28, fontFamily: "Inter_700Bold"}}>{title}</Text>
    </View>
  );
}
