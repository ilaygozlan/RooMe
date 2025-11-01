import { useTheme } from "@/lib/ui/ThemeProvider";
import { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  returnKeyType?: any;
  onSubmitEditing?: () => void;
};

export default forwardRef<TextInput, Props>(function TextField({ label, error, ...p }, ref) {
  const { palette } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? (
        <Text style={{ color: palette.textMuted, marginBottom: 6, fontFamily: "Inter_500Medium" }}>{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={palette.textMuted}
        style={{
          backgroundColor: palette.card,
          color: palette.text,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderColor: error ? palette.danger : palette.border,
          borderWidth: 1,
          fontFamily: "Inter_400Regular",
        }}
        {...p}
      />
      {error ? <Text style={{ color: palette.danger, marginTop: 6, fontFamily: "Inter_400Regular" }}>{error}</Text> : null}
    </View>
  );
});


