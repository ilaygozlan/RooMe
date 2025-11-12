import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { InfoRow } from "./infoRow";

type Props = {
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthDate?: string | Date;
  ownPet?: boolean;
  smoke?: boolean;
  jobStatus?: string;
};

export const InfoCard: React.FC<Props> = ({
  email, phoneNumber, gender, birthDate, ownPet, smoke, jobStatus,
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>פרטים אישיים</Text>
    <View style={styles.divider} />
    <View style={styles.infoContainer}>
      <InfoRow icon={<FontAwesome5 name="envelope" size={18} color="#E3965A" />} label="אימייל" value={email} />
      <InfoRow icon={<FontAwesome5 name="phone" size={18} color="#E3965A" />} label="טלפון" value={phoneNumber || "לא צוין"} />
      <InfoRow
        icon={<FontAwesome5 name="venus-mars" size={18} color="#E3965A" />}
        label="מגדר"
        value={gender === "F" ? "נקבה" : gender === "M" ? "זכר" : "לא צוין"}
      />
      <InfoRow
        icon={<FontAwesome5 name="birthday-cake" size={18} color="#E3965A" />}
        label="תאריך לידה"
        value={birthDate ? new Date(birthDate).toLocaleDateString("he-IL") : "לא צוין"}
      />
      <InfoRow
        icon={<FontAwesome5 name="briefcase" size={18} color="#E3965A" />}
        label="סטטוס תעסוקה"
        value={jobStatus || "לא צוין"}
      />
    </View>
    <View style={styles.divider} />
    <Text style={styles.sectionTitle}>העדפות</Text>
    <View style={styles.preferencesContainer}>
      <InfoRow
        icon={<FontAwesome5 name="dog" size={18} color={ownPet ? "#10B981" : "#94A3B8"} />}
        label="חיית מחמד"
        value={ownPet ? "בעל חיית מחמד" : "אין חיה"}
      />
      <InfoRow
        icon={<FontAwesome5 name="smoking" size={18} color={smoke ? "#EF4444" : "#94A3B8"} />}
        label="עישון"
        value={smoke ? "מעשן" : "לא מעשן"}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  infoContainer: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    textAlign: "right",
    marginBottom: 12,
  },
  preferencesContainer: {
    gap: 4,
  },
});
