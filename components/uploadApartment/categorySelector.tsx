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
      <View style={styles.typeRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setApartmentType(cat.id)}
            style={[styles.typeOption, apartmentType === cat.id && styles.selectedType]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                apartmentType === cat.id && styles.iconContainerActive,
              ]}
            >
              <AntDesign
                name={cat.icon}
                size={28}
                color={apartmentType === cat.id ? "#E3965A" : "#999"}
              />
            </View>
            <Text
              style={[
                styles.typeText,
                apartmentType === cat.id && styles.typeTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}