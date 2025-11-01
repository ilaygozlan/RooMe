import { useTheme } from "@/lib/ui/ThemeProvider";
import { Pressable, Text } from "react-native";

export default function Button({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={{
        backgroundColor: disabled ? palette.muted : palette.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <Text
        style={{
          color: disabled ? "#9CA3AF" : palette.onPrimary,
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}


