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
  TouchableOpacity,
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
  // Helper function to calculate age from birth date
  const calculateAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    try {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
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


const { width } = Dimensions.get("window");

// -------- Component --------
export default function ExtraDetails({ apt }: { apt: Apartment }) {
  const [imageErrors, setImageErrors] = React.useState<Record<number, boolean>>({});


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
     {/*        <View style={styles.detailRow}>
              <FontAwesome5 name="users" size={16} color="#E3965A" />
              <Text style={styles.detail}>
                מס' שותפים: {apt.Shared_NumberOfRoommates}
              </Text>
            </View> */}

            {roommates.length > 0 && (
              <View style={styles.roommatesContainer}>
                <View style={styles.roommatesHeader}>
                  <FontAwesome5 name="user-friends" size={18} color="#E3965A" />
                  <Text style={styles.roommatesTitle}>
                    שותפים בדירה 
                  </Text>
                </View>
                
                <View style={styles.roommatesList}>
                  {roommates.map((rm, index) => {
                    const age = calculateAge(rm["תאריך לידה"]);
                    // Use mock photo if no image provided - using different avatars for variety
                    // Pravatar provides nice placeholder avatars
                    const imageUri = `https://i.pravatar.cc/300?img=${index + 12}`;  //rm["תמונה"] ||
                    const imageError = imageErrors[index];
                    
                    return (
                      <View key={index} style={styles.roommateCard}>
                        {/* Profile Image */}
                        <View style={styles.imageWrapper}>
                          {!imageError ? (
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.roommateImage}
                              resizeMode="cover"
                              onError={() => {
                                setImageErrors(prev => ({ ...prev, [index]: true }));
                              }}
                            />
                          ) : (
                            <View style={styles.placeholderImageContainer}>
                              <FontAwesome5 name="user" size={32} color="#E3965A" />
                            </View>
                          )}
                          <View style={styles.imageBadge}>
                            <Text style={styles.imageBadgeText}>{index + 1}</Text>
                          </View>
                        </View>

                        {/* Content Section */}
                        <View style={styles.cardContent}>
                          {/* Name and Basic Info */}
                          <View style={styles.nameSection}>
                            {rm["שם"] && (
                              <Text style={styles.roommateName} numberOfLines={1}>
                                {rm["שם"]}
                              </Text>
                            )}
                            <View style={styles.quickInfoRow}>
                              {rm["מגדר"] && (
                                <View style={styles.quickInfoItem}>
                                  <FontAwesome5 
                                    name={rm["מגדר"] === "זכר" ? "mars" : rm["מגדר"] === "נקבה" ? "venus" : "genderless"} 
                                    size={12} 
                                    color="#6C757D" 
                                    style={{ marginLeft: 4 }}
                                  />
                                  <Text style={styles.quickInfoText}>{rm["מגדר"]}</Text>
                                </View>
                              )}
                              {age !== null && (
                                <View style={styles.quickInfoItem}>
                                  <MaterialIcons name="cake" size={14} color="#6C757D" style={{ marginLeft: 4 }} />
                                  <Text style={styles.quickInfoText}>{age} שנים</Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Job/Occupation */}
                          {rm["עיסוק"] && (
                            <View style={styles.jobSection}>
                              <MaterialIcons name="work-outline" size={16} color="#E3965A" style={{ marginLeft: 6 }} />
                              <Text style={styles.jobText} numberOfLines={1}>
                                {rm["עיסוק"]}
                              </Text>
                            </View>
                          )}

                          {/* Description */}
                          {rm["תיאור"] && (
                            <Text style={styles.descriptionText} numberOfLines={2}>
                              {rm["תיאור"]}
                            </Text>
                          )}
                        </View>
                      </View>
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
  roommatesContainer: {
    marginTop: 16,
  },
  roommatesHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  roommatesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginRight: 8,
  },
  roommatesList: {
    // gap handled by marginBottom on cards
  },
  roommateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageWrapper: {
    position: "relative",
    marginLeft: 16,
  },
  roommateImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#F8F9FA",
    backgroundColor: "#F8F9FA",
  },
  placeholderImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  imageBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E3965A",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  nameSection: {
    marginBottom: 8,
  },
  roommateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 6,
    textAlign: "right",
  },
  quickInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  quickInfoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginLeft: 12,
  },
  quickInfoText: {
    fontSize: 13,
    color: "#6C757D",
    fontWeight: "500",
  },
  jobSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  jobText: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "500",
    maxWidth: 150,
  },
  descriptionText: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
    textAlign: "right",
    marginTop: 4,
  },
});
