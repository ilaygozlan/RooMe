import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

const propertyTypes = [
  { id: 1, name: "דירת גן" },
  { id: 2, name: "דירה" },
  { id: 3, name: "דופלקס" },
  { id: 4, name: "פרטר" },
  { id: 5, name: "וילה" },
  { id: 6, name: "דו משפחתי" },
  { id: 7, name: "יחידת דיור" },
  { id: 8, name: "פנטהאוז" },
  { id: 9, name: "לופט" },
  { id: 10, name: "קוטג׳" },
  { id: 11, name: "דירת סטודיו" },
  { id: 12, name: "דירת גג" },
  { id: 13, name: "דירה מחולקת" },
];

export default function PropertyTypeGrid({
  propertyTypeID,
  setPropertyTypeID,
}: {
  propertyTypeID: number | null;
  setPropertyTypeID: (id: number) => void;
}) {
  return (
    <View style={{ width: "100%" }}>
      <SectionTitle>סוג הנכס</SectionTitle>
      <View style={styles.propertyTypeList}>
        {propertyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setPropertyTypeID(type.id)}
            style={[styles.propertyTypeButton, propertyTypeID === type.id && styles.selectedPropertyType]}
          >
            <Text>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
