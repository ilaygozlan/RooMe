import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import {  MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ExtraDetails from "@/components/apartment/extraApartmentDetails";

//import ApartmentReview from "@/components/apartment/apartmentReview";
import ApartmentGallery from "@/components/apartment/apartmentGallery";
import API from "../config";

import { labelToIcon } from "@/utils/labelIcons";
import { labelTranslations } from "@/utils/labelTranslations";

// ------------------ Types ------------------

// Labels JSON item shape (as stored in DB)
type LabelItem = { value?: string } | string;

// Core apartment shape (covering all used fields)
export type Apartment = {
  ApartmentID: number;
  Creator_ID: number;
  Creator_FullName: string;
  Creator_ProfilePicture: string;
  Images: string[];
  ApartmentType: 0 | 1 | 2; // 0=rental, 1=shared, 2=sublet
  Location: string; // stringified JSON { address: string }
  Price: number;
  Description: string;
  AmountOfRooms: number;
  AllowPet: boolean;
  AllowSmoking: boolean;
  ParkingSpace: number;
  EntryDate: string;
  ExitDate: string | null;
  Rental_ContractLength: number | null;
  Rental_ExtensionPossible: boolean;
  Shared_NumberOfRoommates: number | null;
  Roommates: string; // pipe-separated string
  Sublet_CanCancelWithoutPenalty: boolean;
  Sublet_IsWholeProperty: boolean;
  LabelsJson: string; // stringified array of { value: string }
  NumOfLikes: number;
  IsLikedByUser: boolean;
};

type Props = {
  apt: Apartment;
  onClose: () => void;
};

// ------------------ Constants ------------------

const { width } = Dimensions.get("window");

// ------------------ Component ------------------

export default function ApartmentDetails({ apt, onClose }: Props) {
  const router = useRouter();
  // Keep the access animation value typed
  const scrollX = useRef(new Animated.Value(0)).current;

  const carouselRef = useRef<ScrollView | null>(null);
  const navigation = useNavigation<any>(); // If you have typed stacks, replace 'any' with your stack type

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(width);

  useEffect(() => {
    console.log("APT CHANGED:", apt.ApartmentID);
  }, [apt.ApartmentID]);

  useEffect(() => {
    // Fetch uploader details if exists
    const fetchUserInfo = async () => {
      try {
        if (!apt.Creator_ID) return;
        const res = await fetch(`${API}User/GetUserById/${apt.Creator_ID}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUserInfo();
  }, [apt.Creator_ID]);

  useEffect(() => {
    // Auto-advance roommates carousel for "Shared" apartments
    const interval = setInterval(() => {
      if (carouselRef.current && apt.ApartmentType === 1 && apt.Roommates) {
        const roommates = parseRoommates(apt.Roommates);
        if (roommates.length === 0) return;
        const nextIndex = (activeSlide + 1) % roommates.length;
        carouselRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setActiveSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide, apt.ApartmentType, apt.Roommates]);

  // Map type id -> hebrew string
  const getTypeName = (type: Apartment["ApartmentType"]): string => {
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


  // Safely parse LabelsJson
  const getApartmentLabels = (): string[] => {
    if (!apt.LabelsJson) return [];
    try {
      let fixedJson = apt.LabelsJson.trim();
      if (!fixedJson.startsWith("[")) {
        fixedJson = `[${fixedJson}]`;
      }

      const parsed = JSON.parse(fixedJson) as LabelItem[];

      return parsed
        .map((item) =>
          typeof item === "string" ? item.toLowerCase() : item.value?.toLowerCase()
        )
        .filter((v): v is string => !!v && !!labelToIcon[v]);
    } catch (e) {
      console.error("Error parsing LabelsJson:", e);
      return [];
    }
  };

  const renderApartmentLabels = () => {
    const labels = getApartmentLabels();
    if (labels.length === 0) return null;

    return (
      <View style={styles.labelsContainer}>
        <Text style={styles.sectionTitle}>מאפייני דירה:</Text>
        <View style={styles.labelsGrid}>
          {labels.map((label, idx) => (
            <View key={`${label}-${idx}`} style={styles.labelItem}>
              {React.cloneElement(labelToIcon[label], {
                size: 24,
                color: "#E3965A",
              })}
              <Text style={styles.labelText}>
                {labelTranslations[label] || label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };


  const resolvedAddress = (() => {
    try {
      const locationStr = apt?.Location?.trim();
      if (locationStr?.startsWith("{") && locationStr?.endsWith("}")) {
        const parsed = JSON.parse(locationStr) as { address?: string };
        return parsed?.address || "כתובת לא זמינה";
      }
      return locationStr || "כתובת לא זמינה";
    } catch (err) {
      console.warn("שגיאה בפענוח כתובת:", err);
      return "כתובת לא זמינה";
    }
  })();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[]}
        renderItem={() => null} 
        ListHeaderComponent={
          <View
            style={styles.container}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#E3965A" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} />
            </View>

            <TouchableOpacity
            /*   onPress={() => {
                router.push({
                  pathname: "UserProfile",
                  params: { userId: apt.Creator_ID as any },
                });
                onClose();
              }} */
            >
              <View style={styles.creatorContainer}>
                <Image
                  source={{
                    uri:
                      apt.Creator_ProfilePicture ||
                      "https://example.com/default-profile.png",
                  }}
                  style={styles.creatorImage}
                />
                <Text style={styles.creatorName}>{apt.Creator_FullName}</Text>
              </View>
            </TouchableOpacity>

            <ApartmentGallery images={apt.Images || []} width={(containerWidth || width) - 40} />

            <Text style={styles.title}>{resolvedAddress}</Text>
            <Text style={styles.price}>{apt.Price} ש"ח</Text>
            <Text style={styles.description}>{apt.Description}</Text>

            {renderApartmentLabels()}

            <Text style={styles.sectionTitle}>
              סוג דירה: {getTypeName(apt.ApartmentType)}
            </Text>

            <View style={styles.detailRow}>
              <MaterialIcons name="meeting-room" size={18} color="#E3965A" />
              <Text style={styles.detail}>חדרים: {apt.AmountOfRooms}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="pets"
                size={18}
                color={apt.AllowPet ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>
                חיות מחמד: {apt.AllowPet ? "מותר" : "אסור"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="smoking-rooms"
                size={18}
                color={apt.AllowSmoking ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>
                עישון: {apt.AllowSmoking ? "מותר" : "אסור"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons
                name="local-parking"
                size={18}
                color={Number(apt.ParkingSpace) > 0 ? "#E3965A" : "#ccc"}
              />
              <Text style={styles.detail}>חניה: {apt.ParkingSpace}</Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="event-available" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                תאריך כניסה: {apt.EntryDate?.split("T")[0]}
              </Text>
            </View>

            {!!apt.ExitDate && (
              <View style={styles.detailRow}>
                <MaterialIcons name="event-busy" size={18} color="#E3965A" />
                <Text style={styles.detail}>
                  תאריך יציאה: {apt.ExitDate?.split("T")[0]}
                </Text>
              </View>
            )}

            <ExtraDetails apt={apt}/>

           {/*  <ApartmentReview apartmentId={apt.ApartmentID} /> */}
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ------------------ Styles ------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 0,
    top: 30,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    textAlign: "right",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    marginTop: 8,
    textAlign: "right",
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    lineHeight: 24,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    color: "#E3965A",
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  detail: {
    fontSize: 15,
    color: "#444",
    marginHorizontal: 10,
    flexShrink: 1,
    textAlign: "right",
  },
  roommateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
    alignItems: "center",
    marginTop: 20,
    width: width - 60,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  roommateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E3965A",
    marginBottom: 10,
  },
  roommateDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    textAlign: "right",
    alignSelf: "stretch",
  },
  roommateImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  uploaderContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  uploaderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 12,
  },
  uploaderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  labelsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  labelsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  labelItem: {
    width: "22%",
    alignItems: "center",
    marginVertical: 8,
    flexDirection: "column",
  },
  labelText: {
    fontSize: 12,
    color: "#444",
    marginTop: 4,
    textAlign: "center",
  },
  creatorContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    margin: 10,
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#E3965A",
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
