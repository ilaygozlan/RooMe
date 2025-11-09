import React from "react";
import { View, Text, Switch } from "react-native";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  label: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

export default function ToggleChip({ label, icon, value, onValueChange }: Props) {
  return (
    <View style={styles.toggleChip}>
      {icon}
      <Text style={{ marginHorizontal: 8 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}