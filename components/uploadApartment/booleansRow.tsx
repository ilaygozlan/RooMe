import React from "react";
import { View } from "react-native";
import ToggleChip from "@/components/uploadApartment/ui/toggleChip";
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  allowPet: boolean; setAllowPet: (b: boolean) => void;
  allowSmoking: boolean; setAllowSmoking: (b: boolean) => void;
  gardenBalcony: boolean; setGardenBalcony: (b: boolean) => void;
};

export default function BooleansRow({
  allowPet, setAllowPet,
  allowSmoking, setAllowSmoking,
  gardenBalcony, setGardenBalcony,
}: Props) {
  return (
    <View style={{ width: "100%" }}>
      <SectionTitle>העדפות</SectionTitle>
      <View style={styles.booleanRow}>
        <ToggleChip
          label="חיות"
          value={allowPet}
          onValueChange={setAllowPet}
          icon={<MaterialIcons name="pets" size={22} color={allowPet ? "#E3965A" : "#777"} />}
        />
        <ToggleChip
          label="עישון"
          value={allowSmoking}
          onValueChange={setAllowSmoking}
          icon={<MaterialIcons name="smoking-rooms" size={22} color={allowSmoking ? "#E3965A" : "#777"} />}
        />
        <ToggleChip
          label="מרפסת/גן"
          value={gardenBalcony}
          onValueChange={setGardenBalcony}
          icon={<FontAwesome5 name="tree" size={20} color={gardenBalcony ? "#E3965A" : "#777"} />}
        />
      </View>
    </View>
  );
}