import React from "react";
import { View, Text, TextInput } from "react-native";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  multiline = false,
  numberOfLines = 1,
}: Props) {
  return (
    <View style={{ width: "100%", marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: "top" }]}
        placeholder={placeholder ?? ""}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        textAlign="right"
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}