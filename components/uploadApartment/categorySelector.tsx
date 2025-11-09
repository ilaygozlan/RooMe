import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

const categories = [
  { id: 0, name: "השכרה", icon: "home" as const },
  { id: 1, name: "שותפים", icon: "team" as const },
  { id: 2, name: "סאבלט", icon: "swap" as const },
];

export default function CategorySelector({
  apartmentType,
  setApartmentType,
}: {
  apartmentType: number | null;
  setApartmentType: (id: number) => void;
}) {
  return (
    <View style={{ width: "100%" }}>
      <SectionTitle>בחר סוג דירה</SectionTitle>
      <View style={styles.typeRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setApartmentType(cat.id)}
            style={[styles.typeOption, apartmentType === cat.id && styles.selectedType]}
          >
            <AntDesign
              name={cat.icon}
              size={22}
              color={apartmentType === cat.id ? "#E3965A" : "#888"}
              style={{ marginBottom: 4 }}
            />
            <Text>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}