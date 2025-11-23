import ExtraDetails from "@/components/apartment/extraApartmentDetails";
import { GooglePlacesAutocomplete } from "@/components/home/googlePlacesCustomAPI";
import CategorySelector from "@/components/uploadApartment/categorySelector";
import { type Apartment } from "@/context/ApartmentsContext";
import { labelToIcon } from "@/utils/labelIcons";
import { labelTranslations } from "@/utils/labelTranslations";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  apartment: Apartment;
  onClose: () => void;
  onSave: (apartment: Apartment) => void;
};

const getTypeName = (type: number): string => {
  switch (type) {
    case 0:
      return "השכרה";
    case 1:
      return "שותפים";
    case 2:
      return "סאבלט";
    default:
      return "לא ידוע";
  }
};

function locationToAddress(loc: string | any): string {
  try {
    if (typeof loc === "string") {
      const parsed = JSON.parse(loc);
      return parsed?.address || loc;
    }
    if (loc && typeof loc === "object") {
      return loc.address || "מיקום לא זמין";
    }
    return "מיקום לא זמין";
  } catch {
    if (typeof loc === "string") {
      const m = loc.match(/"address"\s*:\s*"([^"]+)"/);
      return m ? m[1] : loc;
    }
    return "מיקום לא זמין";
  }
}

export default function EditApartmentDetailsForm({ visible, apartment, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const scrollViewRef = useRef<ScrollView>(null);
  const galleryScrollRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Form state
  const [apartmentType, setApartmentType] = useState<number | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [parkingSpace, setParkingSpace] = useState("");
  const [contractLength, setContractLength] = useState("");
  const [numberOfRoommates, setNumberOfRoommates] = useState("");
  const [canCancelWithoutPenalty, setCanCancelWithoutPenalty] = useState(false);
  const [isWholeProperty, setIsWholeProperty] = useState(false);
  const [allowPet, setAllowPet] = useState(false);
  const [allowSmoking, setAllowSmoking] = useState(false);
  const [extensionPossible, setExtensionPossible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [propertyTypeID, setPropertyTypeID] = useState<number | null>(null);
  const [isEditingField, setIsEditingField] = useState<string | null>(null);

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
      setExtensionPossible(apartment.Rental_ExtensionPossible || false);
      setCanCancelWithoutPenalty(apartment.Sublet_CanCancelWithoutPenalty || false);
      setIsWholeProperty(apartment.Sublet_IsWholeProperty || false);
      setContractLength(String(apartment.Rental_ContractLength || ""));
      setNumberOfRoommates(String(apartment.Shared_NumberOfRoommates || ""));
      setImages(apartment.Images || []);
      setEntryDate(apartment.EntryDate ? apartment.EntryDate.split("T")[0] : "");
      setExitDate(apartment.ExitDate ? apartment.ExitDate.split("T")[0] : "");
      setPropertyTypeID(null);
      setCurrentImageIndex(0);
    }
  }, [apartment, visible]);

  const locationData = useMemo(() => {
    if (location) return location;
    try {
      const locationStr = apartment?.Location?.trim();
      if (locationStr?.startsWith("{") && locationStr?.endsWith("}")) {
        return JSON.parse(locationStr);
      }
      return null;
    } catch {
      return null;
    }
  }, [location, apartment]);

  const mapRegion: Region | null =
    locationData?.latitude && locationData?.longitude
      ? {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : null;

  const resolvedAddress = locationData?.address || locationToAddress(apartment.Location) || "כתובת לא זמינה";

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(images.filter((u) => u !== uriToRemove));
  };

  const handleSave = async () => {
    if (!location?.address || !price || !rooms) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות הנדרשים");
      return;
    }

    setIsSaving(true);

    try {
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

      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(updated);
      Alert.alert("הצלחה", "הדירה עודכנה בהצלחה", [
        { text: "אישור", onPress: onClose },
      ]);
    } catch (error) {
      Alert.alert("שגיאה", "אירעה שגיאה בעת שמירת השינויים");
    } finally {
      setIsSaving(false);
    }
  };

  const getApartmentLabels = (): string[] => {
    if (!apartment.LabelsJson) return [];
    try {
      let fixedJson = apartment.LabelsJson.trim();
      if (!fixedJson.startsWith("[")) {
        fixedJson = `[${fixedJson}]`;
      }
      const parsed = JSON.parse(fixedJson) as Array<{ value?: string } | string>;
      return parsed
        .map((item) =>
          typeof item === "string"
            ? item.toLowerCase()
            : item.value?.toLowerCase()
        )
        .filter((v): v is string => !!v && !!labelToIcon[v]);
    } catch (e) {
      return [];
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.headerMeta}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{getTypeName(apartmentType ?? apartment.ApartmentType)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>{isSaving ? "שומר..." : "שמור"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gallery with Edit */}
            <View style={styles.galleryWrap}>
              {images.length > 0 ? (
                <>
                  <ScrollView
                    ref={galleryScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={[styles.galleryScroll, { width: (containerWidth || width) - 32 }]}
                    onScroll={(event) => {
                      const offsetX = event.nativeEvent.contentOffset.x;
                      const imageWidth = (containerWidth || width) - 32;
                      const index = Math.round(offsetX / imageWidth);
                      setCurrentImageIndex(Math.min(index, images.length - 1));
                    }}
                    scrollEventThrottle={16}
                  >
                    {images.map((img, idx) => (
                      <View key={idx} style={[styles.galleryImageContainer, { width: (containerWidth || width) - 32 }]}>
                        <Image source={{ uri: img }} style={styles.galleryImage} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removeImage(img)}
                        >
                          <MaterialIcons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  
                  {/* Dot Indicators */}
                  {images.length > 1 && (
                    <View style={styles.dotsContainer}>
                      {images.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.dot,
                            currentImageIndex === idx && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                  
                  {/* Add Photos Button - Bottom Center */}
                  <TouchableOpacity style={styles.addPhotosButton} onPress={handleImagePick}>
                    <MaterialIcons name="add-photo-alternate" size={20} color="#fff" />
                    <Text style={styles.addPhotosButtonText}>הוסף תמונות</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyGallery}>
                  <MaterialIcons name="photo-library" size={64} color="#CBD5E1" />
                  <Text style={styles.emptyGalleryText}>אין תמונות</Text>
                  <TouchableOpacity style={styles.addPhotosButtonEmpty} onPress={handleImagePick}>
                    <MaterialIcons name="add-photo-alternate" size={24} color="#fff" />
                    <Text style={styles.addPhotosButtonText}>הוסף תמונות</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.overlayRow}>
                <TouchableOpacity
                  style={styles.pricePill}
                  onPress={() => setIsEditingField("price")}
                >
                  <MaterialIcons name="attach-money" size={18} color="#0F172A" />
                  {isEditingField === "price" ? (
                    <TextInput
                      style={styles.inlineInput}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      onBlur={() => setIsEditingField(null)}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.pricePillText}>{price} ש"ח</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roomsPill}
                  onPress={() => setIsEditingField("rooms")}
                >
                  <MaterialIcons name="meeting-room" size={18} color="#0F172A" />
                  {isEditingField === "rooms" ? (
                    <TextInput
                      style={styles.inlineInput}
                      value={rooms}
                      onChangeText={setRooms}
                      keyboardType="numeric"
                      onBlur={() => setIsEditingField(null)}
                      autoFocus
                    />
                  ) : (
                    <Text style={styles.roomsPillText}>{rooms} חדרים</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Description - Editable */}
            <View style={styles.titleCard}>
              <View style={styles.editableSection}>
                <Text style={styles.sectionLabel}>תיאור הדירה</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="כתוב תיאור קצר וברור..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Apartment Type Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>סוג דירה</Text>
              <CategorySelector apartmentType={apartmentType} setApartmentType={setApartmentType} />
            </View>

            {/* Location & Map */}
            <View style={styles.card}>
              <View style={styles.locationHeader}>
                <MaterialIcons name="location-on" size={24} color="#E3965A" />
                <Text style={styles.cardTitle}>מיקום הדירה</Text>
              </View>
              
              {/* Current Location Display */}
              <View style={styles.currentLocationCard}>
                <View style={styles.locationInfo}>
                  <MaterialIcons name="place" size={20} color="#E3965A" />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.currentLocationLabel}>מיקום נוכחי</Text>
                    <Text style={styles.currentLocationAddress}>{resolvedAddress}</Text>
                    {locationData?.latitude && locationData?.longitude && (
                      <Text style={styles.coordinatesText}>
                        {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Map */}
              {mapRegion && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={mapRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: mapRegion.latitude,
                        longitude: mapRegion.longitude,
                      }}
                      pinColor="#E3965A"
                    />
                  </MapView>
                  <View style={styles.mapOverlay}>
                    <View style={styles.mapAddressCard}>
                      <Text style={styles.mapAddressTitle}>
                        {resolvedAddress.split(",")[0]}
                      </Text>
                      <Text style={styles.mapAddressSub}>
                        {resolvedAddress}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Location Edit Section */}
              <View style={styles.locationEditSection}>
                <Text style={styles.sectionLabel}>עדכן מיקום</Text>
                <GooglePlacesAutocomplete
                  {...({
                    textInputProps: {
                      autoCorrect: false,
                      placeholder: "חפש כתובת חדשה...",
                      style: styles.locationSearchInput,
                    },
                    placeholder: "חפש כתובת חדשה...",
                    fetchDetails: true,
                    onPress: (_data: any, details: any = null) => {
                      if (!details || !details.geometry?.location) return;
                      const fullAddress = {
                        address: details.formatted_address || "",
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        types: details.types || [],
                      };
                      setLocation(fullAddress);
                    },
                    isRowScrollable: false,
                    query: {
                      key: "AIzaSyCGucSUapSIUa_ykXy0K8tl6XR-ITXRj3o",
                      language: "he",
                      components: "country:il",
                    },
                    enablePoweredByContainer: false,
                    styles: {
                      textInput: styles.placesInputEdit,
                      listView: styles.placesListView,
                    },
                  } as any)}
                />
              </View>
            </View>

            {/* Quick Facts - Editable */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>עובדות מהירות</Text>
              <View style={styles.grid}>
                <EditableInfoItem
                  icon="event-available"
                  label="כניסה"
                  value={entryDate}
                  onEdit={(val) => setEntryDate(val)}
                  type="date"
                />
                <EditableInfoItem
                  icon="event-busy"
                  label="יציאה"
                  value={exitDate}
                  onEdit={(val) => setExitDate(val)}
                  type="date"
                />
                <EditableInfoItem
                  icon="local-parking"
                  label="חניה"
                  value={parkingSpace}
                  onEdit={(val) => setParkingSpace(val)}
                  type="number"
                />
                <View style={styles.infoCell}>
                  <MaterialIcons name="pets" size={18} color={allowPet ? "#E3965A" : "#CBD5E1"} />
                  <View style={{ flex: 1, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.infoLabel}>חיות מחמד</Text>
                    <Switch value={allowPet} onValueChange={setAllowPet} trackColor={{ false: "#E2E8F0", true: "#FFE3D1" }} thumbColor={allowPet ? "#E3965A" : "#94A3B8"} />
                  </View>
                </View>
                <View style={styles.infoCell}>
                  <MaterialIcons name="smoking-rooms" size={18} color={allowSmoking ? "#E3965A" : "#CBD5E1"} />
                  <View style={{ flex: 1, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.infoLabel}>עישון</Text>
                    <Switch value={allowSmoking} onValueChange={setAllowSmoking} trackColor={{ false: "#E2E8F0", true: "#FFE3D1" }} thumbColor={allowSmoking ? "#E3965A" : "#94A3B8"} />
                  </View>
                </View>
                <View style={styles.infoCell}>
                  <MaterialIcons name="home-work" size={18} color="#E3965A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>סוג דירה</Text>
                    <Text style={styles.infoValue}>{getTypeName(apartmentType ?? apartment.ApartmentType)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Labels */}
            {getApartmentLabels().length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>מאפייני דירה</Text>
                <View style={styles.labelsWrap}>
                  {getApartmentLabels().map((label, idx) => (
                    <View key={`${label}-${idx}`} style={styles.pill}>
                      {React.cloneElement(labelToIcon[label], {
                        size: 18,
                        color: "#E3965A",
                      } as any)}
                      <Text style={styles.pillText}>{labelTranslations[label] || label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Type Specific Fields */}
            {apartmentType === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>פרטי השכרה</Text>
                <EditableInfoItem
                  icon="event"
                  label="משך חוזה (חודשים)"
                  value={contractLength}
                  onEdit={(val) => setContractLength(val)}
                  type="number"
                />
                <View style={styles.infoCell}>
                  <MaterialIcons name="extension" size={18} color={extensionPossible ? "#E3965A" : "#CBD5E1"} />
                  <View style={{ flex: 1, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.infoLabel}>אפשרות להארכה</Text>
                    <Switch value={extensionPossible} onValueChange={setExtensionPossible} trackColor={{ false: "#E2E8F0", true: "#FFE3D1" }} thumbColor={extensionPossible ? "#E3965A" : "#94A3B8"} />
                  </View>
                </View>
              </View>
            )}

            {apartmentType === 1 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>פרטי שותפים</Text>
                <EditableInfoItem
                  icon="people"
                  label="מספר שותפים"
                  value={numberOfRoommates}
                  onEdit={(val) => setNumberOfRoommates(val)}
                  type="number"
                />
              </View>
            )}

            {apartmentType === 2 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>פרטי סאבלט</Text>
                <View style={styles.infoCell}>
                  <MaterialIcons name="cancel" size={18} color={canCancelWithoutPenalty ? "#E3965A" : "#CBD5E1"} />
                  <View style={{ flex: 1, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.infoLabel}>ביטול ללא קנס</Text>
                    <Switch value={canCancelWithoutPenalty} onValueChange={setCanCancelWithoutPenalty} trackColor={{ false: "#E2E8F0", true: "#FFE3D1" }} thumbColor={canCancelWithoutPenalty ? "#E3965A" : "#94A3B8"} />
                  </View>
                </View>
                <View style={styles.infoCell}>
                  <MaterialIcons name="home" size={18} color={isWholeProperty ? "#E3965A" : "#CBD5E1"} />
                  <View style={{ flex: 1, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.infoLabel}>כל הדירה</Text>
                    <Switch value={isWholeProperty} onValueChange={setIsWholeProperty} trackColor={{ false: "#E2E8F0", true: "#FFE3D1" }} thumbColor={isWholeProperty ? "#E3965A" : "#94A3B8"} />
                  </View>
                </View>
              </View>
            )}

            {/* Extra Details */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>פרטים נוספים</Text>
              <ExtraDetails
                apt={
                  {
                    ...apartment,
                    ApartmentType: apartmentType ?? apartment.ApartmentType,
                    Rental_ContractLength: apartmentType === 0 ? (contractLength ? Number(contractLength) : null) : null,
                    Shared_NumberOfRoommates: apartmentType === 1 ? (numberOfRoommates ? Number(numberOfRoommates) : null) : null,
                  } as any
                }
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Editable Info Item Component
function EditableInfoItem({
  icon,
  label,
  value,
  onEdit,
  type = "text",
}: {
  icon: string;
  label: string;
  value: string;
  onEdit: (val: string) => void;
  type?: "text" | "number" | "date";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onEdit(tempValue);
    setIsEditing(false);
  };

  return (
    <View style={styles.infoCell}>
      <MaterialIcons name={icon as any} size={18} color={value ? "#E3965A" : "#CBD5E1"} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.infoInput}
            value={tempValue}
            onChangeText={setTempValue}
            keyboardType={type === "number" ? "numeric" : type === "date" ? "default" : "default"}
            onBlur={handleSave}
            autoFocus
            placeholder={type === "date" ? "YYYY-MM-DD" : ""}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={[styles.infoValue, !value && styles.infoValueEmpty]}>
              {value || "לחץ לעריכה"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF3EA",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  typeBadgeText: {
    color: "#C56E36",
    fontWeight: "700",
    fontSize: 12,
  },
  saveButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E3965A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  galleryWrap: {
    position: "relative",
    marginBottom: 12,
  },
  emptyGallery: {
    height: 250,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyGalleryText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  galleryScroll: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
  },
  galleryImageContainer: {
    position: "relative",
    height: 250,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 68, 68, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dotsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  activeDot: {
    backgroundColor: "#E3965A",
    width: 24,
  },
  addPhotosButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(227, 150, 90, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addPhotosButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  addPhotosButtonEmpty: {
    marginTop: 24,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3965A",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#E3965A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  overlayRow: {
    position: "absolute",
    bottom: 10,
    right: 10,
    left: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  pricePill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pricePillText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 14,
  },
  roomsPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roomsPillText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  inlineInput: {
    minWidth: 60,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  titleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  editableSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    textAlign: "right",
  },
  addressInput: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  placesInput: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  placesListView: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
  },
  descriptionInput: {
    fontSize: 14.5,
    color: "#475569",
    lineHeight: 22,
    textAlign: "right",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCell: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2,
  },
  infoValueEmpty: {
    color: "#CBD5E1",
    fontStyle: "italic",
  },
  infoInput: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E3965A",
    paddingVertical: 2,
  },
  labelsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFF8F2",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  pillText: {
    color: "#7C3E18",
    fontSize: 12.5,
    fontWeight: "700",
  },
  locationHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  currentLocationCard: {
    backgroundColor: "#FFF8F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFE3D1",
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  currentLocationLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#C56E36",
    marginBottom: 4,
    textAlign: "right",
  },
  currentLocationAddress: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
    fontFamily: "monospace",
  },
  locationEditSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  locationSearchInput: {
    fontSize: 14,
    color: "#0F172A",
    textAlign: "right",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  placesInputEdit: {
    fontSize: 14,
    color: "#0F172A",
    textAlign: "right",
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    left: 10,
  },
  mapAddressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapAddressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 4,
  },
  mapAddressSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
  },
});

