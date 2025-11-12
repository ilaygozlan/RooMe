import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  friendsCount: number;
  apartmentsCount: number;
  openHousesCount: number;
  onOpenFriends(): void;
  onOpenOpenHouses(): void;
};

export const CountersRow: React.FC<Props> = ({
  friendsCount,
  apartmentsCount,
  openHousesCount,
  onOpenFriends,
  onOpenOpenHouses,
}) => {
  const rtl = I18nManager.isRTL;
  return (
    <View style={[styles.countersRow, rtl && { flexDirection: "row-reverse" }]}>
      <TouchableOpacity 
        style={[styles.counterCard, styles.counterCardActive]} 
        onPress={onOpenFriends}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Feather name="users" size={20} color="#E3965A" />
        </View>
        <Text style={styles.counterNumber}>{friendsCount}</Text>
        <Text style={styles.counterLabel}>חברים</Text>
      </TouchableOpacity>
      <View style={styles.counterCard}>
        <View style={[styles.iconContainer, styles.iconContainerInactive]}>
          <Feather name="home" size={20} color="#94A3B8" />
        </View>
        <Text style={[styles.counterNumber, styles.counterNumberInactive]}>{apartmentsCount}</Text>
        <Text style={styles.counterLabel}>הדירות שלי</Text>
      </View>
      <TouchableOpacity
        style={[styles.counterCard, styles.counterCardActive]}
        onPress={onOpenOpenHouses}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Feather name="calendar" size={20} color="#E3965A" />
        </View>
        <Text style={styles.counterNumber}>{openHousesCount}</Text>
        <Text style={styles.counterLabel}>בתים פתוחים</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  countersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  counterCard: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  counterCardActive: {
    backgroundColor: "#FFF8F2",
    borderColor: "#FFE3D1",
    ...Platform.select({
      ios: {
        shadowColor: "#E3965A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainerInactive: {
    backgroundColor: "#F1F5F9",
  },
  counterNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E3965A",
    marginBottom: 4,
  },
  counterNumberInactive: {
    color: "#64748B",
  },
  counterLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
});
