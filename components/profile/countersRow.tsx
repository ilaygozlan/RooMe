import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";

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
      <TouchableOpacity style={[styles.counterCard, styles.counterCardActive]} onPress={onOpenFriends}>
        <Text style={styles.counterNumber}>{friendsCount}</Text>
        <Text style={styles.counterLabel}>חברים</Text>
      </TouchableOpacity>
      <View style={styles.counterCard}>
        <Text style={styles.counterNumber}>{apartmentsCount}</Text>
        <Text style={styles.counterLabel}>הדירות שלי</Text>
      </View>
      <TouchableOpacity
        style={[styles.counterCard, styles.counterCardActive]}
        onPress={onOpenOpenHouses}
      >
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
    width: "90%",
    alignSelf: "center",
    marginBottom: 18,
  },
  counterCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: "#F3F4F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  counterCardActive: { backgroundColor: "#E6E6FA" },
  counterNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E3965A",
    marginBottom: 2,
  },
  counterLabel: { fontSize: 13, color: "#A1A7B3", fontWeight: "500" },
});
