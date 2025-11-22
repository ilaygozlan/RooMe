import { useTheme } from "@/lib/ui/ThemeProvider";
import { Text, TextInput, View, StyleSheet } from "react-native";

type Props = {
  label?: string;
  value?: string;
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
};

export default function DatePickerField({ label, value, onChange, error, placeholder = "YYYY-MM-DD" }: Props) {
  const { palette } = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: palette.card,
            color: palette.text,
            borderColor: error ? palette.danger : palette.border,
          },
        ]}
        keyboardType="numeric"
        maxLength={10}
      />
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
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

