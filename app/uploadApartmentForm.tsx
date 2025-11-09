import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import HouseLoading from "@/components/ui/loadingHouseSign";
/* import { userInfoContext } from "../contex/userInfoContext"; */
/* import { ActiveApartmentContext } from "../contex/ActiveApartmentContext"; */
/* import API from "../../config"; */
import { GooglePlacesAutocomplete } from "@/components/home/googlePlacesCustomAPI";
import {
  CategorySelector,
  ImagePickerRow,
  PropertyTypeGrid,
  DatesRow,
  BooleansRow,
  TypeSpecificFields,
  SectionTitle,
  LabeledInput,
  uploadFormStyles as styles,
} from "@/components/uploadApartment/";
import { normalizeFileForFormData, massageApartmentForList } from "@/utils/uploadHelpers";

export default function UploadApartmentForm() {
  const { allApartments, setAllApartments } = useContext(ActiveApartmentContext);
  const { loginUserId } = useContext(userInfoContext);

  const [step, setStep] = useState<0 | 1>(0);

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

  const step1Valid = useMemo(() => {
    return apartmentType !== null && location?.address && price && rooms;
  }, [apartmentType, location, price, rooms]);

  const allValid = useMemo(() => step1Valid, [step1Valid]);

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

  const handleSubmit = async () => {
    if (!allValid) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות המסומנים בשלב הראשון");
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
        Alert.alert("הצלחה", "הדירה פורסמה בהצלחה!");
        clearForm();
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
        Alert.alert("שגיאה", "הדירה פורסמה, אך העלאת התמונות נכשלה");
        setIsUploading(false);
        return;
      }

      const uploadResult = await uploadRes.text(); // "url1,url2,..."
      const imageLinks = uploadResult.split(",").filter(Boolean);
      const displayApt = massageApartmentForList(apartmentData, newApartmentId, loginUserId, userProfile, true, imageLinks);
      setAllApartments([...allApartments, displayApt]);

      Alert.alert("הצלחה", "הדירה והתמונות פורסמו בהצלחה!");
      clearForm();
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
      Alert.alert("שגיאה", "אירעה שגיאה בעת פרסום הדירה");
    }
  };

  if (isUploading) return <HouseLoading text="מעלה את הדירה והתמונות..." />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} style={{ flex: 1 }}>
        <View style={styles.progressHeader}>
          <Text style={styles.title}>העלאת דירה</Text>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarInner, { width: step === 0 ? "50%" : "100%" }]} />
          </View>
          <Text style={styles.progressText}>{step === 0 ? "שלב 1 מתוך 2" : "שלב 2 מתוך 2"}</Text>
        </View>

        <FlatList
          data={[0]}
          keyExtractor={() => "content"}
          renderItem={() => (
            <View style={styles.container}>
              {step === 0 ? (
                <>
                  <CategorySelector apartmentType={apartmentType} setApartmentType={setApartmentType} />
                  <ImagePickerRow images={images} setImages={setImages} />

                  <View style={{ width: "100%", marginTop: 8 }}>
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
                        key: "YOUR_GOOGLE_PLACES_KEY",
                        language: "he",
                        components: "country:il",
                      }}
                      enablePoweredByContainer={false}
                      styles={{ textInput: styles.placesInput, listView: styles.placesListView }}
                    />
                  </View>

                  <View style={{ width: "100%", marginTop: 8 }}>
                    <SectionTitle>פרטים בסיסיים</SectionTitle>
                    <LabeledInput label="מחיר (לחודש)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="לדוגמה: 5200" />
                    <LabeledInput label="חדרים" value={rooms} onChangeText={setRooms} keyboardType="numeric" placeholder="לדוגמה: 3" />
                    <LabeledInput label="קומה" value={floor} onChangeText={setFloor} keyboardType="numeric" placeholder="לדוגמה: 2" />
                    <LabeledInput label="חניה" value={parkingSpace} onChangeText={setParkingSpace} keyboardType="numeric" placeholder="מספר מקומות חניה" />
                    <LabeledInput label="תיאור" value={description} onChangeText={setDescription} placeholder="כתוב תיאור קצר וברור..." />
                  </View>

                  <PropertyTypeGrid propertyTypeID={propertyTypeID} setPropertyTypeID={setPropertyTypeID} />
                </>
              ) : (
                <>
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
                    allowPet={allowPet} setAllowPet={setAllowPet}
                    allowSmoking={allowSmoking} setAllowSmoking={setAllowSmoking}
                    gardenBalcony={gardenBalcony} setGardenBalcony={setGardenBalcony}
                  />

                  <TypeSpecificFields
                    apartmentType={apartmentType}
                    contractLength={contractLength} setContractLength={setContractLength}
                    extensionPossible={extensionPossible} setExtensionPossible={setExtensionPossible}
                    numberOfRoommates={numberOfRoommates} setNumberOfRoommates={setNumberOfRoommates}
                    canCancelWithoutPenalty={canCancelWithoutPenalty} setCanCancelWithoutPenalty={setCanCancelWithoutPenalty}
                    isWholeProperty={isWholeProperty} setIsWholeProperty={setIsWholeProperty}
                  />
                </>
              )}
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        <View style={styles.bottomBar}>
          {step === 1 ? (
            <>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(0)}>
                <Text style={styles.secondaryBtnText}>חזרה</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { opacity: allValid ? 1 : 0.5 }]} onPress={handleSubmit} disabled={!allValid}>
                <Text style={styles.primaryBtnText}>שיתוף הדירה</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={[styles.primaryBtn, { opacity: step1Valid ? 1 : 0.5 }]} onPress={() => setStep(1)} disabled={!step1Valid}>
                <Text style={styles.primaryBtnText}>המשך</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}