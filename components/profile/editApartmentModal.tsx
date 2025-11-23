import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "@/components/home/googlePlacesCustomAPI";
import { type Apartment } from "@/context/ApartmentsContext";
import {
  BooleansRow,
  CategorySelector,
  DatesRow,
  ImagePickerRow,
  LabeledInput,
  ProgressIndicator,
  PropertyTypeGrid,
  SectionTitle,
  TypeSpecificFields,
} from "@/components/uploadApartment/";
import { uploadFormStyles } from "@/components/uploadApartment/";

type Props = {
  visible: boolean;
  apartment: Apartment;
  onClose: () => void;
  onSave: (apartment: Apartment) => void;
};

const STEP_LABELS = ["סוג דירה", "תמונות", "פרטים"];

export default function EditApartmentModal({ visible, apartment, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [apartmentType, setApartmentType] = useState<number | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [floor, setFloor] = useState("");
  const [parkingSpace, setParkingSpace] = useState("");
  const [contractLength, setContractLength] = useState("");
  const [numberOfRoommates, setNumberOfRoommates] = useState("");
  const [canCancelWithoutPenalty, setCanCancelWithoutPenalty] = useState(false);
  const [isWholeProperty, setIsWholeProperty] = useState(false);
  const [allowPet, setAllowPet] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [gardenBalcony, setGardenBalcony] = useState(false);
  const [extensionPossible, setExtensionPossible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);
  const [propertyTypeID, setPropertyTypeID] = useState<number | null>(null);

  // Parse location from apartment
  const parseLocation = (loc: string): any => {
    try {
      if (typeof loc === "string") {
        const parsed = JSON.parse(loc);
        return parsed;
      }
      return loc;
    } catch {
      return { address: loc };
    }
  };

  // Pre-fill form when apartment changes
  useEffect(() => {
    if (apartment && visible) {
      setApartmentType(apartment.ApartmentType);
      setLocation(parseLocation(apartment.Location));
      setPrice(String(apartment.Price));
      setRooms(String(apartment.AmountOfRooms));
      setDescription(apartment.Description || "");
      setParkingSpace(String(apartment.ParkingSpace || 0));
      setAllowPet(apartment.AllowPet);
      setAllowSmoking(apartment.AllowSmoking);
      setGardenBalcony(false); // Not in apartment type, but keeping for form
      setExtensionPossible(apartment.Rental_ExtensionPossible || false);
      setCanCancelWithoutPenalty(apartment.Sublet_CanCancelWithoutPenalty || false);
      setIsWholeProperty(apartment.Sublet_IsWholeProperty || false);
      setContractLength(String(apartment.Rental_ContractLength || ""));
      setNumberOfRoommates(String(apartment.Shared_NumberOfRoommates || ""));
      setImages(apartment.Images || []);
      setEntryDate(apartment.EntryDate ? apartment.EntryDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setExitDate(apartment.ExitDate ? apartment.ExitDate.split("T")[0] : "");
      setPropertyTypeID(null); // Property type not in apartment type
    }
  }, [apartment, visible]);

  // Validation
  const step0Valid = useMemo(() => apartmentType !== null, [apartmentType]);
  const step1Valid = useMemo(() => true, []); // Images optional
  const step2Valid = useMemo(() => {
    return location?.address && price && rooms;
  }, [location, price, rooms]);

  const canProceedToNextStep = useMemo(() => {
    if (step === 0) return step0Valid;
    if (step === 1) return step1Valid;
    return false;
  }, [step, step0Valid, step1Valid]);

  const canSubmit = useMemo(() => {
    return step2Valid && apartmentType !== null;
  }, [step2Valid, apartmentType]);

  const handleNext = () => {
    if (step < 2 && canProceedToNextStep) {
      setStep((step + 1) as 0 | 1 | 2);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as 0 | 1 | 2);
    }
  };

  const handleSave = async () => {
    if (!canSubmit) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות הנדרשים");
      return;
    }

    setIsSaving(true);

    try {
      // Build updated apartment object
      const updated: Apartment = {
        ...apartment,
        ApartmentType: apartmentType as 0 | 1 | 2,
        Location: JSON.stringify(location),
        Price: Number(price),
        AmountOfRooms: Number(rooms),
        Description: description,
        ParkingSpace: parkingSpace ? Number(parkingSpace) : 0,
        AllowPet: allowPet,
        AllowSmoking: allowSmoking,
        EntryDate: entryDate ? `${entryDate}T00:00:00` : apartment.EntryDate,
        ExitDate: exitDate ? `${exitDate}T00:00:00` : apartment.ExitDate,
        Images: images,
        Rental_ContractLength: apartmentType === 0 ? (contractLength ? Number(contractLength) : null) : null,
        Rental_ExtensionPossible: apartmentType === 0 ? extensionPossible : false,
        Shared_NumberOfRoommates: apartmentType === 1 ? (numberOfRoommates ? Number(numberOfRoommates) : null) : null,
        Sublet_CanCancelWithoutPenalty: apartmentType === 2 ? canCancelWithoutPenalty : false,
        Sublet_IsWholeProperty: apartmentType === 2 ? isWholeProperty : false,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      onSave(updated);
      onClose();
    } catch (error) {
      Alert.alert("שגיאה", "אירעה שגיאה בעת שמירת השינויים");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={uploadFormStyles.stepContainer}>
            <View style={uploadFormStyles.stepHeader}>
              <Text style={uploadFormStyles.stepTitle}>סוג דירה</Text>
              <Text style={uploadFormStyles.stepDescription}>בחר את סוג הדירה</Text>
            </View>
            <CategorySelector apartmentType={apartmentType} setApartmentType={setApartmentType} />
          </View>
        );

      case 1:
        return (
          <View style={uploadFormStyles.stepContainer}>
            <View style={uploadFormStyles.stepHeader}>
              <Text style={uploadFormStyles.stepTitle}>תמונות</Text>
              <Text style={uploadFormStyles.stepDescription}>עדכן את תמונות הדירה (אופציונלי)</Text>
            </View>
            <ImagePickerRow images={images} setImages={setImages} />
          </View>
        );

      case 2:
        return (
          <ScrollView
            style={uploadFormStyles.stepContainer}
            contentContainerStyle={uploadFormStyles.stepContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={uploadFormStyles.stepHeader}>
              <Text style={uploadFormStyles.stepTitle}>פרטי הדירה</Text>
              <Text style={uploadFormStyles.stepDescription}>עדכן את פרטי הדירה</Text>
            </View>

            <View style={{ width: "100%", marginTop: 16 }}>
              <SectionTitle>מיקום</SectionTitle>
              <GooglePlacesAutocomplete
                onFail={(error: any) => {
                  console.error("Autocomplete ERROR:", error);
                  Alert.alert("שגיאה", "אירעה שגיאה בעת חיפוש הכתובת");
                }}
                textInputProps={{
                  autoCorrect: false,
                  defaultValue: location?.address || "",
                }}
                placeholder={"הקלד מיקום..."}
                fetchDetails={true}
                onPress={(_data: any, details: any = null) => {
                  if (!details || !details.geometry?.location) {
                    Alert.alert("שגיאה", "פרטי מיקום לא זמינים כרגע");
                    return;
                  }
                  const fullAddress = {
                    address: details.formatted_address || "",
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    types: details.types || [],
                  };
                  setLocation(fullAddress);
                }}
                isRowScrollable={false}
                query={{
                  key: "AIzaSyCGucSUapSIUa_ykXy0K8tl6XR-ITXRj3o",
                  language: "he",
                  components: "country:il",
                }}
                enablePoweredByContainer={false}
                styles={{ textInput: uploadFormStyles.placesInput, listView: uploadFormStyles.placesListView }}
              />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
              <SectionTitle>פרטים בסיסיים</SectionTitle>
              <LabeledInput
                label="מחיר (לחודש) *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="לדוגמה: 5200"
              />
              <LabeledInput
                label="חדרים *"
                value={rooms}
                onChangeText={setRooms}
                keyboardType="numeric"
                placeholder="לדוגמה: 3"
              />
              <LabeledInput
                label="קומה"
                value={floor}
                onChangeText={setFloor}
                keyboardType="numeric"
                placeholder="לדוגמה: 2"
              />
              <LabeledInput
                label="חניה"
                value={parkingSpace}
                onChangeText={setParkingSpace}
                keyboardType="numeric"
                placeholder="מספר מקומות חניה"
              />
              <LabeledInput
                label="תיאור"
                value={description}
                onChangeText={setDescription}
                placeholder="כתוב תיאור קצר וברור..."
                multiline
                numberOfLines={4}
              />
            </View>

            <PropertyTypeGrid propertyTypeID={propertyTypeID} setPropertyTypeID={setPropertyTypeID} />

            <DatesRow
              entryDate={entryDate}
              exitDate={exitDate}
              setEntryDate={setEntryDate}
              setExitDate={setExitDate}
              showEntryPicker={showEntryPicker}
              setShowEntryPicker={setShowEntryPicker}
              showExitPicker={showExitPicker}
              setShowExitPicker={setShowExitPicker}
            />

            <BooleansRow
              allowPet={allowPet}
              setAllowPet={setAllowPet}
              allowSmoking={allowSmoking}
              setAllowSmoking={setAllowSmoking}
              gardenBalcony={gardenBalcony}
              setGardenBalcony={setGardenBalcony}
            />

            <TypeSpecificFields
              apartmentType={apartmentType}
              contractLength={contractLength}
              setContractLength={setContractLength}
              extensionPossible={extensionPossible}
              setExtensionPossible={setExtensionPossible}
              numberOfRoommates={numberOfRoommates}
              setNumberOfRoommates={setNumberOfRoommates}
              canCancelWithoutPenalty={canCancelWithoutPenalty}
              setCanCancelWithoutPenalty={setCanCancelWithoutPenalty}
              isWholeProperty={isWholeProperty}
              setIsWholeProperty={setIsWholeProperty}
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[modalStyles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>עריכת דירה</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>{renderStepContent()}</View>

          {/* Bottom Navigation Bar */}
          <View style={modalStyles.bottomBar}>
            {step > 0 && (
              <TouchableOpacity style={modalStyles.secondaryBtn} onPress={handleBack}>
                <Text style={modalStyles.secondaryBtnText}>חזרה</Text>
              </TouchableOpacity>
            )}
            {step < 2 ? (
              <TouchableOpacity
                style={[
                  modalStyles.primaryBtn,
                  { opacity: canProceedToNextStep ? 1 : 0.5, flex: step === 0 ? 1 : undefined },
                ]}
                onPress={handleNext}
                disabled={!canProceedToNextStep}
              >
                <Text style={modalStyles.primaryBtnText}>המשך</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[modalStyles.primaryBtn, { opacity: canSubmit && !isSaving ? 1 : 0.5 }]}
                onPress={handleSave}
                disabled={!canSubmit || isSaving}
              >
                <Text style={modalStyles.primaryBtnText}>
                  {isSaving ? "שומר..." : "שמור שינויים"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Indicator */}
          <View style={[modalStyles.progressContainer, { paddingBottom: insets.bottom }]}>
            <ProgressIndicator currentStep={step} totalSteps={3} stepLabels={STEP_LABELS} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  bottomBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#E3965A",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryBtnText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    backgroundColor: "#fff",
  },
});

