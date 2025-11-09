import React from "react";
import { View, Text, Switch } from "react-native";
import LabeledInput from "@/components/uploadApartment/ui/labeledInput";
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  apartmentType: number | null;
  contractLength: string; setContractLength: (s: string) => void;
  extensionPossible: boolean; setExtensionPossible: (b: boolean) => void;
  numberOfRoommates: string; setNumberOfRoommates: (s: string) => void;
  canCancelWithoutPenalty: boolean; setCanCancelWithoutPenalty: (b: boolean) => void;
  isWholeProperty: boolean; setIsWholeProperty: (b: boolean) => void;
};

export default function TypeSpecificFields({
  apartmentType,
  contractLength, setContractLength,
  extensionPossible, setExtensionPossible,
  numberOfRoommates, setNumberOfRoommates,
  canCancelWithoutPenalty, setCanCancelWithoutPenalty,
  isWholeProperty, setIsWholeProperty,
}: Props) {
  if (apartmentType === 0) {
    return (
      <View style={{ width: "100%" }}>
        <SectionTitle>פרטי השכרה</SectionTitle>
        <LabeledInput
          label="משך חוזה (חודשים)"
          value={contractLength}
          onChangeText={setContractLength}
          keyboardType="numeric"
          placeholder="לדוגמה: 12"
        />
        <View style={[styles.toggleChip, { justifyContent: "space-between" }]}>
          <Text>אפשרות להארכה</Text>
          <Switch value={extensionPossible} onValueChange={setExtensionPossible} />
        </View>
      </View>
    );
  }
  if (apartmentType === 1) {
    return (
      <View style={{ width: "100%" }}>
        <SectionTitle>פרטי שותפים</SectionTitle>
        <LabeledInput
          label="מספר שותפים"
          value={numberOfRoommates}
          onChangeText={setNumberOfRoommates}
          keyboardType="numeric"
          placeholder="לדוגמה: 2"
        />
      </View>
    );
  }
  if (apartmentType === 2) {
    return (
      <View style={{ width: "100%" }}>
        <SectionTitle>פרטי סאבלט</SectionTitle>
        <View style={[styles.toggleChip, { justifyContent: "space-between" }]}>
          <Text>ביטול ללא קנס</Text>
          <Switch value={canCancelWithoutPenalty} onValueChange={setCanCancelWithoutPenalty} />
        </View>
        <View style={[styles.toggleChip, { justifyContent: "space-between" }]}>
          <Text>כל הדירה</Text>
          <Switch value={isWholeProperty} onValueChange={setIsWholeProperty} />
        </View>
      </View>
    );
  }
  return null;
}
