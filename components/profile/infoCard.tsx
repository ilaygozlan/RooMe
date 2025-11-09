import React from "react";
import { View, StyleSheet } from "react-native";
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
    <InfoRow icon={<FontAwesome5 name="envelope" size={18} color="#5C67F2" />} label="אימייל" value={email} />
    <InfoRow icon={<FontAwesome5 name="phone" size={18} color="#5C67F2" />} label="טלפון" value={phoneNumber} />
    <InfoRow
      icon={<FontAwesome5 name="venus-mars" size={18} color="#5C67F2" />}
      label="מגדר"
      value={gender === "F" ? "נקבה" : "זכר"}
    />
    <InfoRow
      icon={<FontAwesome5 name="birthday-cake" size={18} color="#5C67F2" />}
      label="תאריך לידה"
      value={birthDate ? new Date(birthDate).toLocaleDateString("he-IL") : ""}
    />
    <InfoRow
      icon={<FontAwesome5 name="dog" size={18} color="#5C67F2" />}
      label="חיית מחמד"
      value={ownPet ? "בעל חיית מחמד" : "אין חיה"}
    />
    <InfoRow
      icon={<FontAwesome5 name="smoking" size={18} color="#5C67F2" />}
      label="עישון"
      value={smoke ? "מעשן" : "לא מעשן"}
    />
    <InfoRow
      icon={<FontAwesome5 name="briefcase" size={18} color="#5C67F2" />}
      label="סטטוס"
      value={jobStatus}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginTop: 18,
    marginHorizontal: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});
