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
import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import ApartmentReview from "./components/apartmentReview";
import ApartmentGallery from "./components/ApartmentGallery";
import API from "../config";

// ------------------ Types ------------------

// Roommate parsed structure (Hebrew keys as in original UI)
type RoommateDetails = {
  ["שם"]?: string;
  ["מגדר"]?: string;
  ["עיסוק"]?: string;
  ["תאריך לידה"]?: string;
  ["תמונה"]?: string;
  ["תיאור"]?: string;
};

// Labels JSON item shape (as stored in DB)
type LabelItem = { value?: string } | string;

// Core apartment shape (covering all used fields)
export interface Apartment {
  ApartmentID: number | string;
  UserID?: number | string;
  Creator_ID?: number | string;
  Creator_FullName?: string;
  Creator_ProfilePicture?: string | null;

  Images?: string[]; // For ApartmentGallery

  ApartmentType: 0 | 1 | 2; // 0=Rent, 1=Shared, 2=Sublet

  // Common fields
  Location?: string; // Sometimes JSON string with { address }
  Price?: number | string;
  Description?: string;
  AmountOfRooms?: number | string;
  AllowPet?: boolean;
  AllowSmoking?: boolean;
  ParkingSpace?: number | string;
  EntryDate?: string; // ISO
  ExitDate?: string | null; // ISO or null

  // Rent
  Rental_ContractLength?: number | string;
  Rental_ExtensionPossible?: boolean;

  // Shared (roommates)
  Shared_NumberOfRoommates?: number | string;
  Roommates?: string; // encoded with "||" and "|"

  // Sublet
  Sublet_CanCancelWithoutPenalty?: boolean;
  Sublet_IsWholeProperty?: boolean;

  // Labels
  LabelsJson?: string;
}

type Props = {
  apt: Apartment;
  onClose: () => void;
};

// ------------------ Constants ------------------

const { width } = Dimensions.get("window");

// Icon map: english label -> icon element
const labelToIcon: Record<string, JSX.Element> = {
  couch: <FontAwesome5 name="couch" size={24} />,
  sofa: <FontAwesome5 name="couch" size={24} />,
  armchair: <MaterialCommunityIcons name="seat" size={24} />,
  chair: <MaterialIcons name="chair" size={24} />,
  table: <MaterialIcons name="table-restaurant" size={24} />,
  "coffee table": <MaterialCommunityIcons name="coffee" size={24} />,
  "dining table": <MaterialIcons name="table-restaurant" size={24} />,
  desk: <MaterialCommunityIcons name="desk" size={24} />,
  bed: <FontAwesome5 name="bed" size={24} />,
  "bunk bed": <MaterialCommunityIcons name="bunk-bed" size={24} />,
  mattress: <MaterialCommunityIcons name="bed-king" size={24} />,
  dresser: <MaterialCommunityIcons name="dresser" size={24} />,
  wardrobe: <MaterialCommunityIcons name="wardrobe" size={24} />,
  tv: <MaterialIcons name="tv" size={24} />,
  television: <MaterialIcons name="tv" size={24} />,
  lamp: <MaterialIcons name="emoji-objects" size={24} />,
  chandelier: <MaterialCommunityIcons name="chandelier" size={24} />,
  "light fixture": <MaterialCommunityIcons name="ceiling-light" size={24} />,
  bookshelf: <MaterialCommunityIcons name="bookshelf" size={24} />,
  mirror: <MaterialCommunityIcons name="mirror" size={24} />,
  rug: <MaterialCommunityIcons name="rug" size={24} />,
  curtain: <MaterialCommunityIcons name="curtains" size={24} />,
  blinds: <MaterialCommunityIcons name="blinds" size={24} />,
  balcony: <MaterialCommunityIcons name="balcony" size={24} />,
  "patio furniture": <MaterialCommunityIcons name="table-chair" size={24} />,
  "outdoor chair": <MaterialIcons name="chair-alt" size={24} />,
  "outdoor table": <MaterialIcons name="table-restaurant" size={24} />,
  "bar stool": <MaterialCommunityIcons name="stool" size={24} />,
  vanity: <MaterialCommunityIcons name="vanity-light" size={24} />,
  ottoman: <MaterialCommunityIcons name="stool-outline" size={24} />,
  "bean bag": <MaterialCommunityIcons name="stool" size={24} />,
  sideboard: <MaterialCommunityIcons name="sofa-outline" size={24} />,
  "console table": <MaterialCommunityIcons name="table-furniture" size={24} />,
  "shoe rack": <MaterialCommunityIcons name="shoe-formal" size={24} />,
  "air conditioner": <MaterialCommunityIcons name="air-conditioner" size={24} />,
  shower: <MaterialIcons name="shower" size={24} />,
  "washing machine": <MaterialCommunityIcons name="washing-machine" size={24} />,
  dryer: <MaterialCommunityIcons name="tumble-dryer" size={24} />,
  "swimming pool": <MaterialCommunityIcons name="pool" size={24} />,
  garden: <MaterialCommunityIcons name="flower" size={24} />,
  yard: <MaterialCommunityIcons name="grass" size={24} />,
  elevator: <MaterialCommunityIcons name="elevator" size={24} />,
  parking: <MaterialIcons name="local-parking" size={24} />,
  garage: <MaterialCommunityIcons name="garage" size={24} />,
  dishwasher: <MaterialCommunityIcons name="dishwasher" size={24} />,
  microwave: <MaterialCommunityIcons name="microwave" size={24} />,
  oven: <MaterialCommunityIcons name="stove" size={24} />,
  fridge: <MaterialCommunityIcons name="fridge-outline" size={24} />,
  refrigerator: <MaterialCommunityIcons name="fridge-outline" size={24} />,
  stove: <MaterialCommunityIcons name="stove" size={24} />,
  "security camera": <MaterialCommunityIcons name="security" size={24} />,
  intercom: <MaterialCommunityIcons name="home-account" size={24} />,
  jacuzzi: <MaterialCommunityIcons name="hot-tub" size={24} />,
};

const labelTranslations: Record<string, string> = {
  couch: "ספה",
  sofa: "ספה",
  armchair: "כורסה",
  chair: "כיסא",
  bench: "ספסל",
  table: "שולחן",
  "coffee table": "שולחן קפה",
  "dining table": "שולחן אוכל",
  desk: "שולחן כתיבה",
  nightstand: "שידה ליד המיטה",
  bed: "מיטה",
  "bunk bed": "מיטת קומותיים",
  mattress: "מזרן",
  dresser: "שידה",
  wardrobe: "ארון בגדים",
  closet: "ארון",
  tv: "טלוויזיה",
  television: "טלוויזיה",
  "tv stand": "שידת טלוויזיה",
  "entertainment unit": "מערכת בידור",
  lamp: "מנורה",
  chandelier: "נברשת",
  "light fixture": "גוף תאורה",
  bookshelf: "כוורת ספרים",
  bookcase: "כוורת ספרים",
  shelf: "מדף",
  cabinet: "ארונית",
  drawer: "מגירה",
  mirror: "מראה",
  rug: "שטיח",
  carpet: "שטיח",
  curtain: "וילון",
  blinds: "תריסים",
  balcony: "מרפסת",
  "patio furniture": "ריהוט חוץ",
  "outdoor chair": "כיסא חוץ",
  "outdoor table": "שולחן חוץ",
  "bar stool": "שרפרף בר",
  vanity: "שידת איפור",
  ottoman: "הדום",
  "bean bag": "פוף",
  recliner: "כורסה נפתחת",
  sideboard: "שידת צד",
  "console table": "קונסולה",
  "shoe rack": "מתקן לנעליים",
  "air conditioner": "מזגן",
  ac: "מזגן",
  shower: "מקלחת",
  "washing machine": "מכונת כביסה",
  dryer: "מייבש כביסה",
  "swimming pool": "בריכה",
  pool: "בריכה",
  garden: "גן",
  yard: "חצר",
  terrace: "טרסה",
  elevator: "מעלית",
  parking: "חניה",
  garage: "מוסך",
  dishwasher: "מדיח כלים",
  microwave: "מיקרוגל",
  oven: "תנור אפייה",
  fridge: "מקרר",
  refrigerator: "מקרר",
  stove: "כיריים",
  "security camera": "מצלמת אבטחה",
  intercom: "אינטרקום",
  jacuzzi: "ג׳קוזי",
};

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
        if (!apt.UserID) return;
        const res = await fetch(`${API}User/GetUserById/${apt.UserID}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUserInfo();
  }, [apt.UserID]);

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

  // Parse roommates encoded string to a structured list
  const parseRoommates = (info?: string): RoommateDetails[] => {
    if (!info) return [];
    const roommateStrings = info
      .split("||")
      .map((r) => r.trim())
      .filter(Boolean);

    return roommateStrings.map((rm) => {
      const parts = rm.split("|").map((p) => p.trim());
      const details: RoommateDetails = {};
      parts.forEach((part) => {
        const [key, raw] = part.split(":");
        const value = raw?.trim();
        if (!key || !value) return;
        if (value === "N/A" || value.toLowerCase() === "null") return;

        switch (key.trim()) {
          case "Name":
            details["שם"] = value;
            break;
          case "Gender":
            details["מגדר"] = value;
            break;
          case "Job":
            details["עיסוק"] = value;
            break;
          case "BirthDate":
            details["תאריך לידה"] = value;
            break;
          case "Image":
            details["תמונה"] = value;
            break;
          case "Description":
            details["תיאור"] = value;
            break;
          default:
            break;
        }
      });
      return details;
    });
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

  const renderExtraDetails = () => {
    switch (apt.ApartmentType) {
      case 0:
        return (
          <>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                משך חוזה: {apt.Rental_ContractLength} חודשים
              </Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="sync" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                הארכה אפשרית: {apt.Rental_ExtensionPossible ? "כן" : "לא"}
              </Text>
            </View>
          </>
        );
      case 1: {
        const roommates = parseRoommates(apt.Roommates);
        return (
          <>
            <View style={styles.detailRow}>
              <FontAwesome5 name="users" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                מס' שותפים: {apt.Shared_NumberOfRoommates}
              </Text>
            </View>

            {roommates.length > 0 && (
              <View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  ref={carouselRef}
                  inverted
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  {roommates.map((rm, index) => (
                    <View key={index} style={styles.roommateCard}>
                      {rm["תמונה"] && (
                        <Image
                          source={{ uri: rm["תמונה"] }}
                          style={styles.roommateImage}
                          resizeMode="cover"
                        />
                      )}
                      <Text style={styles.roommateHeader}>
                        🧑‍🤝‍🧑 שותף {index + 1}
                      </Text>
                      {Object.entries(rm).map(
                        ([label, value]) =>
                          label !== "תמונה" && (
                            <Text key={label} style={styles.roommateDetail}>
                              • {label}: {value}
                            </Text>
                          )
                      )}
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.paginationContainer}>
                  {roommates.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const dotWidth = scrollX.interpolate({
                      inputRange,
                      outputRange: [8, 16, 8],
                      extrapolate: "clamp",
                    });
                    const dotColor = scrollX.interpolate({
                      inputRange,
                      outputRange: ["#ccc", "#E3965A", "#ccc"],
                      extrapolate: "clamp",
                    });

                    return (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          {
                            width: dotWidth as unknown as number,
                            // Animated color is fine at runtime; TS needs a cast for style type
                            backgroundColor: dotColor as unknown as string,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </>
        );
      }
      case 2:
        return (
          <>
            <View style={styles.detailRow}>
              <MaterialIcons name="cancel" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                ביטול ללא קנס: {apt.Sublet_CanCancelWithoutPenalty ? "כן" : "לא"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="home" size={18} color="#E3965A" />
              <Text style={styles.detail}>
                נכס שלם: {apt.Sublet_IsWholeProperty ? "כן" : "לא"}
              </Text>
            </View>
          </>
        );
      default:
        return null;
    }
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
              onPress={() => {
                router.push({
                  pathname: "UserProfile",
                  params: { userId: apt.Creator_ID as any },
                });
                onClose();
              }}
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
            <Text style={styles.price}>{apt.Price} ש&quats;ח</Text>
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

            {renderExtraDetails()}

            <ApartmentReview apartmentId={apt.ApartmentID} />
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
