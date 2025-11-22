import { useTheme } from "@/lib/ui/ThemeProvider";
import { Pressable, Text, View, StyleSheet } from "react-native";

type Gender = "male" | "female" | "other" | "prefer-not-to-say";

type Props = {
  label?: string;
  value?: Gender;
  onChange: (gender: Gender) => void;
  error?: string;
};

const genders: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function GenderSelector({ label, value, onChange, error }: Props) {
  const { palette } = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      ) : null}
      <View style={styles.optionsContainer}>
        {genders.map((gender) => {
          const isSelected = value === gender.value;
          return (
            <Pressable
              key={gender.value}
              onPress={() => onChange(gender.value)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? palette.primary : palette.card,
                  borderColor: isSelected ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? palette.onPrimary : palette.text,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {gender.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

