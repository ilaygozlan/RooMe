import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  label: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export default function ToggleChip({ label, icon, value, onValueChange }: Props) {
  return (
    <TouchableOpacity
      style={[styles.toggleChip, value && styles.selectedToggleChip]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.toggleChipText, value && styles.selectedToggleChipText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}