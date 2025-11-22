import { useTheme } from "@/lib/ui/ThemeProvider";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export default function ToggleField({ label, value, onChange, icon, error }: Props) {
  const { palette } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange(!value)}
        style={[
          styles.toggleContainer,
          {
            backgroundColor: value ? palette.primary : palette.card,
            borderColor: error ? palette.danger : value ? palette.primary : palette.border,
          },
        ]}
      >
        <View style={styles.leftSection}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={value ? palette.onPrimary : palette.textMuted}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.label,
              {
                color: value ? palette.onPrimary : palette.text,
                fontFamily: value ? "Inter_600SemiBold" : "Inter_400Regular",
              },
            ]}
          >
            {label}
          </Text>
        </View>
        <View
          style={[
            styles.toggle,
            {
              backgroundColor: value ? palette.onPrimary : palette.muted,
            },
          ]}
        >
          <View
            style={[
              styles.toggleCircle,
              {
                backgroundColor: value ? palette.primary : "#CBD5E1",
                transform: [{ translateX: value ? 18 : 0 }],
              },
            ]}
          />
        </View>
      </Pressable>
      {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 15,
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    padding: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

