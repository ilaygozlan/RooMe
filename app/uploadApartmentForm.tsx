import { GooglePlacesAutocomplete } from "@/components/home/googlePlacesCustomAPI";
import HouseLoading from "@/components/ui/loadingHouseSign";
import {
    BooleansRow,
    CategorySelector,
    DatesRow,
    ImagePickerRow,
    LabeledInput,
    ProgressIndicator,
    PropertyTypeGrid,
    SectionTitle,
    uploadFormStyles as styles,
    TypeSpecificFields,
} from "@/components/uploadApartment/";
import { massageApartmentForList, normalizeFileForFormData } from "@/utils/uploadHelpers";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEP_LABELS = ["סוג דירה", "תמונות", "פרטים"];

export default function UploadApartmentForm() {
  const router = useRouter();
  /*   const { allApartments, setAllApartments } = useContext(ActiveApartmentContext);
  const { loginUserId } = useContext(userInfoContext); */

  //prod
  const allApartments: any[] = [];
  const loginUserId = 999;
  const API = "";

  const [step, setStep] = useState<0 | 1 | 2>(0);

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
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [exitDate, setExitDate] = useState(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);
  const [propertyTypeID, setPropertyTypeID] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetch(API + "User/GetUserById/" + loginUserId)
      .then((res) => {
        if (!res.ok) throw new Error("שגיאה בטעינת פרופיל");
        return res.json();
      })
      .then((data) => setUserProfile(data))
      .catch(() => {});
  }, [loginUserId]);

  // Validation for each step
  const step0Valid = useMemo(() => {
    return apartmentType !== null;
  }, [apartmentType]);

  const step1Valid = useMemo(() => {
    // Images are optional, so step 1 is always valid
    return true;
  }, []);

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

  const clearForm = () => {
    setApartmentType(null);
    setLocation(null);
    setPrice("");
    setRooms("");
    setDescription("");
    setFloor("");
    setParkingSpace("");
    setContractLength("");
    setNumberOfRoommates("");
    setImages([]);
    setAllowPet(false);
    setAllowSmoking(false);
    setGardenBalcony(false);
    setExtensionPossible(false);
    setCanCancelWithoutPenalty(false);
    setIsWholeProperty(false);
    setPropertyTypeID(null);
    setEntryDate(new Date().toISOString().split("T")[0]);
    setExitDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setStep(0);
  };

  const handleNext = () => {
    if (step < 2 && canProceedToNextStep) {
      setStep((step + 1) as 0 | 1 | 2);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((step - 1) as 0 | 1 | 2);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות הנדרשים");
      return;
    }
    setIsUploading(true);

    const commonFields: any = {
      id: 0,
      userID: loginUserId,
      price: Number(price),
      amountOfRooms: Number(rooms),
      location: JSON.stringify(location),
      allowPet,
      allowSmoking,
      gardenBalcony,
      parkingSpace: parkingSpace ? Number(parkingSpace) : 0,
      entryDate,
      exitDate,
      isActive: true,
      floor: floor ? Number(floor) : 0,
      apartmentType,
      description,
      propertyTypeID,
    };

    let apartmentData: any = {};
    let endpoint = "";

    if (apartmentType === 0) {
      apartmentData = { ...commonFields, contractLength: contractLength ? Number(contractLength) : 0, extensionPossible };
      endpoint = `${API}Apartment/AddRentalApartment`;
    } else if (apartmentType === 1) {
      apartmentData = { ...commonFields, numberOfRoommates: numberOfRoommates ? Number(numberOfRoommates) : 0 };
      endpoint = `${API}Apartment/AddSharedApartment`;
    } else if (apartmentType === 2) {
      apartmentData = { ...commonFields, canCancelWithoutPenalty, isWholeProperty };
      endpoint = `${API}Apartment/AddSubletApartment`;
    } else {
      setIsUploading(false);
      Alert.alert("שגיאה", "בחר סוג דירה");
      return;
    }

    try {
      const createRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apartmentData),
      });
      if (!createRes.ok) {
        setIsUploading(false);
        throw new Error("פרסום נכשל");
      }
      const newApartmentId = await createRes.json();

      // No images flow
      if (!images.length) {
        const displayApt = massageApartmentForList(apartmentData, newApartmentId, loginUserId, userProfile, false);
        setAllApartments([...allApartments, displayApt]);
        Alert.alert("הצלחה", "הדירה פורסמה בהצלחה!", [
          {
            text: "אישור",
            onPress: () => {
              clearForm();
              router.back();
            },
          },
        ]);
        setIsUploading(false);
        return;
      }

      // With images
      const formData = new FormData();
      for (const uri of images) {
        const fileUri = await normalizeFileForFormData(uri);
        const fileName = fileUri.split("/").pop() || `photo_${Date.now()}.jpg`;
        const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
        const mime = ext === "png" ? "image/png" : "image/jpeg";
        formData.append("files", { uri: fileUri, name: fileName, type: mime } as any);
      }

      const uploadRes = await fetch(`${API}UploadImageCpntroller/uploadApartmentImage/${newApartmentId}`, {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Upload error:", uploadRes.status, errorText);
        const displayApt = massageApartmentForList(apartmentData, newApartmentId, loginUserId, userProfile, false);
        setAllApartments([...allApartments, displayApt]);
        Alert.alert("שגיאה", "הדירה פורסמה, אך העלאת התמונות נכשלה", [
          {
            text: "אישור",
            onPress: () => {
              clearForm();
              router.back();
            },
          },
        ]);
        setIsUploading(false);
        return;
      }

      const uploadResult = await uploadRes.text(); // "url1,url2,..."
      const imageLinks = uploadResult.split(",").filter(Boolean);
      const displayApt = massageApartmentForList(apartmentData, newApartmentId, loginUserId, userProfile, true, imageLinks);
      setAllApartments([...allApartments, displayApt]);

      Alert.alert("הצלחה", "הדירה והתמונות פורסמו בהצלחה!", [
        {
          text: "אישור",
          onPress: () => {
            clearForm();
            router.back();
          },
        },
      ]);
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
      Alert.alert("שגיאה", "אירעה שגיאה בעת פרסום הדירה");
    }
  };

  if (isUploading) return <HouseLoading text="מעלה את הדירה והתמונות..." />;

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>בחר סוג דירה</Text>
              <Text style={styles.stepDescription}>מה סוג הדירה שברצונך לפרסם?</Text>
            </View>
            <CategorySelector apartmentType={apartmentType} setApartmentType={setApartmentType} />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>הוסף תמונות</Text>
              <Text style={styles.stepDescription}>תמונות עוזרות למשוך יותר תשומת לב (אופציונלי)</Text>
            </View>
            <ImagePickerRow images={images} setImages={setImages} />
          </View>
        );

      case 2:
        return (
          <ScrollView
            style={styles.stepContainer}
            contentContainerStyle={styles.stepContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>פרטי הדירה</Text>
              <Text style={styles.stepDescription}>מלא את הפרטים הבסיסיים על הדירה</Text>
            </View>

            <View style={{ width: "100%", marginTop: 16 }}>
              <SectionTitle>מיקום</SectionTitle>
              <GooglePlacesAutocomplete
                onFail={(error: any) => {
                  console.error("Autocomplete ERROR:", error);
                  Alert.alert("שגיאה", "אירעה שגיאה בעת חיפוש הכתובת");
                }}
                textInputProps={{ autoCorrect: false }}
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
                styles={{ textInput: styles.placesInput, listView: styles.placesListView }}
              />
            </View>

            <View style={{ width: "100%", marginTop: 24 }}>
              <SectionTitle>פרטים בסיסיים</SectionTitle>
              <LabeledInput label="מחיר (לחודש) *" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="לדוגמה: 5200" />
              <LabeledInput label="חדרים *" value={rooms} onChangeText={setRooms} keyboardType="numeric" placeholder="לדוגמה: 3" />
              <LabeledInput label="קומה" value={floor} onChangeText={setFloor} keyboardType="numeric" placeholder="לדוגמה: 2" />
              <LabeledInput label="חניה" value={parkingSpace} onChangeText={setParkingSpace} keyboardType="numeric" placeholder="מספר מקומות חניה" />
              <LabeledInput label="תיאור" value={description} onChangeText={setDescription} placeholder="כתוב תיאור קצר וברור..." multiline numberOfLines={4} />
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>העלאת דירה</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>{renderStepContent()}</View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomBar}>
          {step > 0 && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
              <Text style={styles.secondaryBtnText}>חזרה</Text>
            </TouchableOpacity>
          )}
          {step < 2 ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { opacity: canProceedToNextStep ? 1 : 0.5, flex: step === 0 ? 1 : undefined }]}
              onPress={handleNext}
              disabled={!canProceedToNextStep}
            >
              <Text style={styles.primaryBtnText}>המשך</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryBtn, { opacity: canSubmit ? 1 : 0.5 }]} onPress={handleSubmit} disabled={!canSubmit}>
              <Text style={styles.primaryBtnText}>פרסם דירה</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Indicator at Bottom */}
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff" }}>
          <ProgressIndicator currentStep={step} totalSteps={3} stepLabels={STEP_LABELS} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
