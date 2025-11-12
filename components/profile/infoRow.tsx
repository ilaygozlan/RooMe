import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelContainer}>
      <View style={styles.iconWrapper}>
        {icon}
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
      {value ?? "—"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 8,
  },
  infoLabelContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    textAlign: "left",
    flex: 1,
    marginLeft: 12,
  },
});
