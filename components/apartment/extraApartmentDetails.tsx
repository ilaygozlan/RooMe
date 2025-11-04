// components/apartment/ExtraDetails.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// -------- Types you can adapt to your project --------
export type Apartment = {
  ApartmentType: 0 | 1 | 2; // 0: rental, 1: shared, 2: sublet
  // Rental
  Rental_ContractLength?: number;
  Rental_ExtensionPossible?: boolean;

  // Shared
  Shared_NumberOfRoommates?: number;
  // can be JSON string or already parsed array
  Roommates?: string | Array<Record<string, string>>;

  // Sublet
  Sublet_CanCancelWithoutPenalty?: boolean;
  Sublet_IsWholeProperty?: boolean;
};

// Roommate parsed structure (Hebrew keys as in original UI)
type RoommateDetails = {
  ["שם"]?: string;
  ["מגדר"]?: string;
  ["עיסוק"]?: string;
  ["תאריך לידה"]?: string;
  ["תמונה"]?: string;
  ["תיאור"]?: string;
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


const { width } = Dimensions.get("window");

// -------- Component --------
export default function ExtraDetails({ apt }: { apt: Apartment }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView>(null);


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

  return <View style={styles.container}>{renderExtraDetails()}</View>;
}

// -------- Styles (scoped to this component) --------
const styles = StyleSheet.create({
  container: {
    gap: 8,
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
    paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
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
});
