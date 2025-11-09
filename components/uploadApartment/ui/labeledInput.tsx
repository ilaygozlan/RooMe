import React from "react";
import { View, Text, TextInput } from "react-native";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
};

export default function LabeledInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
}: Props) {
  return (
    <View style={{ width: "100%", marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder ?? ""}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        textAlign="right"
      />
    </View>
  );
}