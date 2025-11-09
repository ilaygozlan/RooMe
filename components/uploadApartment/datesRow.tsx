import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
/* import CustomDateTimePicker from "../../components/CustomDateTimePicker";  */
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

type Props = {
  entryDate: string;
  exitDate: string;
  setEntryDate: (s: string) => void;
  setExitDate: (s: string) => void;
  showEntryPicker: boolean;
  setShowEntryPicker: (b: boolean) => void;
  showExitPicker: boolean;
  setShowExitPicker: (b: boolean) => void;
};

export default function DatesRow({
  entryDate,
  exitDate,
  setEntryDate,
  setExitDate,
  showEntryPicker,
  setShowEntryPicker,
  showExitPicker,
  setShowExitPicker,
}: Props) {
  const handleEntryDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(entryDate);
    setShowEntryPicker(false);
    const entryString = currentDate.toISOString().split("T")[0];
    setEntryDate(entryString);

    const exitAsDate = new Date(exitDate);
    if (exitAsDate <= currentDate) {
      const newExit = new Date(currentDate.getTime() + 86400000);
      setExitDate(newExit.toISOString().split("T")[0]);
    }
  };

  const handleExitDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(exitDate);
    const entry = new Date(entryDate);
    if (currentDate > entry) {
      setExitDate(currentDate.toISOString().split("T")[0]);
    } else {
      Alert.alert("שגיאה", "תאריך יציאה חייב להיות אחרי תאריך כניסה");
    }
    setShowExitPicker(false);
  };

  return (
    <View style={{ width: "100%" }}>
      <SectionTitle>תאריכים</SectionTitle>

      <TouchableOpacity onPress={() => setShowEntryPicker(true)} style={styles.input}>
        <Text>תאריך כניסה: {entryDate}</Text>
      </TouchableOpacity>
  {/*     {showEntryPicker && (
        <CustomDateTimePicker value={new Date(entryDate)} mode="date" minimumDate={new Date()} onChange={handleEntryDateChange} />
      )} */}

      <TouchableOpacity onPress={() => setShowExitPicker(true)} style={[styles.input, { marginTop: 12 }]}>
        <Text>תאריך יציאה: {exitDate}</Text>
      </TouchableOpacity>
    {/*   {showExitPicker && (
        <CustomDateTimePicker
          value={new Date(exitDate)}
          mode="date"
          minimumDate={new Date(new Date(entryDate).getTime() + 86400000)}
          onChange={handleExitDateChange}
        />
      )} */}
    </View>
  );
}
