import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value ?? ""}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 6,
  },
  infoLabelContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    minWidth: 110,
  },
  infoLabel: {
    fontSize: 15,
    color: "#7C83FD",
    fontWeight: "600",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    color: "#A1A7B3",
    fontWeight: "500",
    textAlign: "left",
    flex: 1,
  },
});
