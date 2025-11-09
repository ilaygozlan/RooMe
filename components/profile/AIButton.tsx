import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export const AIButton: React.FC<{ onPress(): void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.aiButton} onPress={onPress}>
    <MaterialCommunityIcons name="robot" size={22} color="#fff" style={{ marginLeft: 10 }} />
    <Text style={styles.text}>{"\u202A"} למציאת שותפים AI{"\u202C"}</Text>
    <Feather name="chevron-left" size={22} color="#fff" style={{ marginRight: 10 }} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  aiButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3965A",
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 50,
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "bold", marginHorizontal: 10, textAlign: "right" },
});