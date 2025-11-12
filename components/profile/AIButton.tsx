import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, View } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const AIButton: React.FC<{ onPress(): void }> = ({ onPress }) => (
  <TouchableOpacity 
    style={styles.buttonContainer} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={["#E3965A", "#F4B982"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="robot" size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>מציאת שותפים</Text>
          <Text style={styles.subText}>בעזרת AI</Text>
        </View>
        <Feather name="chevron-left" size={24} color="#fff" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#E3965A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    borderRadius: 16,
    padding: 1,
  },
  content: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "flex-end",
    marginHorizontal: 16,
  },
  mainText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 2,
  },
  subText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
  },
});