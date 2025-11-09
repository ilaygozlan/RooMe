import React from "react";
import { Text } from "react-native";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}