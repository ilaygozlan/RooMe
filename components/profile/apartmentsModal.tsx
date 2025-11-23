import { type Apartment } from "@/context/ApartmentsContext";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditApartmentModal from "./editApartmentModal";

type Props = {
  visible: boolean;
  apartments: Apartment[];
  userId: number | string;
  onClose(): void;
  onSelect?(apartment: Apartment): void;
  onUpdate?: (apartment: Apartment) => void;
  onEdit?: (apartment: Apartment) => void;
};

// Mock data for user's apartments
const getMockUserApartments = (userId: number | string): Apartment[] => {
  const userIdNum = Number(userId);
  return [
    {
      ApartmentID: 201,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=101",
        "https://picsum.photos/800/600?random=102",
        "https://picsum.photos/800/600?random=103",
      ],
      ApartmentType: 0,
      Location: '{"address": "רחוב רוטשילד 15, תל אביב", "latitude": 32.064, "longitude": 34.774}',
      Price: 4500,
      Description: "דירה מרווחת ומשופצת בקומה 3, עם מרפסת גדולה ונוף לים. קרוב לכל השירותים.",
      AmountOfRooms: 3,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-01T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"balcony"},{"value":"elevator"},{"value":"air conditioner"}]',
      NumOfLikes: 12,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 202,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=201",
        "https://picsum.photos/800/600?random=202",
      ],
      ApartmentType: 1,
      Location: '{"address": "רחוב בן יהודה 42, תל אביב", "latitude": 32.080, "longitude": 34.771}',
      Price: 3200,
      Description: "חדר בדיור משותף, דירה נקייה ומסודרת עם שותפים נעימים. קרוב לאוניברסיטה.",
      AmountOfRooms: 4,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-11-20T00:00:00",
      ExitDate: "2026-06-30T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: 3,
      Roommates: "Name:David|Gender:Male|Job:Student|BirthDate:1999-03-15|Image:https://i.pravatar.cc/100?img=15||Name:Sarah|Gender:Female|Job:Teacher|BirthDate:1998-07-22|Image:https://i.pravatar.cc/100?img=20",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"fridge"},{"value":"washing machine"}]',
      NumOfLikes: 8,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 203,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=301",
        "https://picsum.photos/800/600?random=302",
        "https://picsum.photos/800/600?random=303",
        "https://picsum.photos/800/600?random=304",
      ],
      ApartmentType: 2,
      Location: '{"address": "רחוב דיזנגוף 100, תל אביב", "latitude": 32.086, "longitude": 34.774}',
      Price: 5500,
      Description: "סבלט לדירה יוקרתית במרכז העיר. דירה מעוצבת עם כל הציוד הנדרש.",
      AmountOfRooms: 2,
      AllowPet: true,
      AllowSmoking: true,
      ParkingSpace: 1,
      EntryDate: "2025-12-15T00:00:00",
      ExitDate: "2026-03-15T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"balcony"},{"value":"elevator"},{"value":"fridge"},{"value":"air conditioner"},{"value":"washing machine"}]',
      NumOfLikes: 15,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 204,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=401",
        "https://picsum.photos/800/600?random=402",
        "https://picsum.photos/800/600?random=403",
        "https://picsum.photos/800/600?random=404",
        "https://picsum.photos/800/600?random=405",
      ],
      ApartmentType: 0,
      Location: '{"address": "רחוב נחום גולדמן 8, רמת גן", "latitude": 32.085, "longitude": 34.802}',
      Price: 6800,
      Description: "דירת פנטהאוז מרווחת בקומה 12, עם נוף פנורמי לעיר. דירה מעוצבת עם מטבח מאובזר וסלון גדול. קרוב לפארק ולמרכזי קניות.",
      AmountOfRooms: 4,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 2,
      EntryDate: "2026-01-01T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 24,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"balcony"},{"value":"elevator"},{"value":"fridge"},{"value":"air conditioner"},{"value":"washing machine"},{"value":"dishwasher"}]',
      NumOfLikes: 23,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 205,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=501",
        "https://picsum.photos/800/600?random=502",
      ],
      ApartmentType: 1,
      Location: '{"address": "רחוב הרצל 25, חיפה", "latitude": 32.819, "longitude": 34.999}',
      Price: 2800,
      Description: "חדר נעים בדיור משותף עם שותפים שקטים ונעימים. הדירה נקייה ומסודרת, קרובה לאוניברסיטה ולחוף הים.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-10T00:00:00",
      ExitDate: null,
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: 2,
      Roommates: "Name:Tom|Gender:Male|Job:Engineer|BirthDate:1997-11-20|Image:https://i.pravatar.cc/100?img=25||Name:Lisa|Gender:Female|Job:Doctor|BirthDate:1996-04-12|Image:https://i.pravatar.cc/100?img=30",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"fridge"},{"value":"washing machine"},{"value":"air conditioner"}]',
      NumOfLikes: 6,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 206,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=601",
        "https://picsum.photos/800/600?random=602",
        "https://picsum.photos/800/600?random=603",
      ],
      ApartmentType: 2,
      Location: '{"address": "רחוב ויצמן 50, ירושלים", "latitude": 31.768, "longitude": 35.214}',
      Price: 4200,
      Description: "סבלט לדירה יפה ונוחה בירושלים. דירה מעוצבת עם כל הציוד, קרובה לאוניברסיטה העברית ולמרכז העיר.",
      AmountOfRooms: 2.5,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2026-02-01T00:00:00",
      ExitDate: "2026-08-31T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"balcony"},{"value":"fridge"},{"value":"air conditioner"},{"value":"washing machine"}]',
      NumOfLikes: 11,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 207,
      Creator_ID: userIdNum,
      Creator_FullName: "You",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=1",
      Images: [
        "https://picsum.photos/800/600?random=701",
        "https://picsum.photos/800/600?random=702",
        "https://picsum.photos/800/600?random=703",
        "https://picsum.photos/800/600?random=704",
      ],
      ApartmentType: 0,
      Location: '{"address": "רחוב אלנבי 120, תל אביב", "latitude": 32.070, "longitude": 34.775}',
      Price: 5200,
      Description: "דירה יפה ומשופצת בקומה 5, עם מרפסת גדולה. מיקום מעולה במרכז העיר, קרוב לכל השירותים והתחבורה הציבורית.",
      AmountOfRooms: 3.5,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-20T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 18,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"balcony"},{"value":"elevator"},{"value":"fridge"},{"value":"air conditioner"},{"value":"washing machine"},{"value":"dishwasher"}]',
      NumOfLikes: 18,
      IsLikedByUser: false,
    },
  ];
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

const getTypeColor = (type: number): string => {
  switch (type) {
    case 0:
      return "#F0C27B";
    case 1:
      return "#F4B982";
    case 2:
      return "#E3965A";
    default:
      return "#999";
  }
};

function locationToAddress(loc: string): string {
  try {
    if (typeof loc === "string") {
      const parsed = JSON.parse(loc);
      return parsed.address || loc;
    }
    return loc?.address || "מיקום לא זמין";
  } catch {
    const m = loc.match(/"address"\s*:\s*"([^"]+)"/);
    return m ? m[1] : loc;
  }
}

export const ApartmentsModal: React.FC<Props> = ({
  visible,
  apartments,
  userId,
  onClose,
  onSelect,
  onUpdate,
  onEdit,
}) => {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);

  // Use mock data if no apartments provided
  const userApartments = useMemo(() => {
    if (apartments && apartments.length > 0) {
      return apartments.filter((apt) => apt.Creator_ID === Number(userId));
    }
    return getMockUserApartments(userId);
  }, [apartments, userId]);

  const handleEdit = (apartment: Apartment, event: any) => {
    event?.stopPropagation();
    if (onEdit) {
      // Close apartments modal and open edit modal at parent level
      onClose();
      onEdit(apartment);
    } else {
      // Fallback: close apartments modal and show edit modal here
      onClose();
      setEditingApartment(apartment);
    }
  };

  const handleView = (apartment: Apartment) => {
    // Open edit form instead of details
    if (onEdit) {
      onClose();
      onEdit(apartment);
    } else if (onSelect) {
      onSelect(apartment);
    } else {
      (globalThis as any).__openAptDetails__?.(apartment);
    }
  };

  const handleDelete = (apartment: Apartment, event: any) => {
    event?.stopPropagation();
    Alert.alert(
      "מחיקת דירה",
      "האם אתה בטוח שברצונך למחוק את הדירה? פעולה זו לא ניתנת לביטול.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => {
            Alert.alert("נמחק", "הדירה נמחקה בהצלחה");
          },
        },
      ]
    );
  };

  const handleSaveEdit = (updated: Apartment) => {
    if (onUpdate) {
      onUpdate(updated);
    }
    setEditingApartment(null);
    Alert.alert("עודכן", "הדירה עודכנה בהצלחה");
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={["#E3965A", "#F4B982"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>הדירות שלי</Text>
            <Text style={styles.subtitle}>{userApartments.length} דירות</Text>
          </LinearGradient>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {userApartments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="home" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>אין דירות שפורסמו</Text>
              </View>
            ) : (
              userApartments.map((apt) => {
                const locationData = locationToAddress(apt.Location);
                const typeColor = getTypeColor(apt.ApartmentType);
                const mainImage = apt.Images && apt.Images.length > 0 ? apt.Images[0] : null;

                return (
                  <TouchableOpacity
                    key={apt.ApartmentID}
                    style={styles.apartmentCard}
                    onPress={() => handleView(apt)}
                    activeOpacity={0.7}
                  >
                    {/* Image */}
                    <View style={styles.imageContainer}>
                      {mainImage ? (
                        <Image source={{ uri: mainImage }} style={styles.image} />
                      ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                          <MaterialIcons name="home" size={32} color="#ccc" />
                        </View>
                      )}
                      <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                        <Text style={styles.typeBadgeText}>{getTypeName(apt.ApartmentType)}</Text>
                      </View>
                      {apt.Images && apt.Images.length > 1 && (
                        <View style={styles.imageCountBadge}>
                          <MaterialIcons name="photo-library" size={12} color="#fff" />
                          <Text style={styles.imageCountText}>{apt.Images.length}</Text>
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                      <Text style={styles.address} numberOfLines={1}>
                        {locationData}
                      </Text>
                      <Text style={styles.description} numberOfLines={2}>
                        {apt.Description || "ללא תיאור"}
                      </Text>
                      <View style={styles.infoRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.price}>{apt.Price.toLocaleString()} ש"ח</Text>
                        </View>
                        <View style={styles.roomsContainer}>
                          <MaterialIcons name="meeting-room" size={16} color="#E3965A" />
                          <Text style={styles.roomsText}>{apt.AmountOfRooms} חדרים</Text>
                        </View>
                      </View>
                      <View style={styles.statsRow}>
                        {apt.ParkingSpace > 0 && (
                          <View style={styles.statItem}>
                            <MaterialIcons name="local-parking" size={14} color="#666" />
                            <Text style={styles.statText}>{apt.ParkingSpace}</Text>
                          </View>
                        )}
                        {apt.AllowPet && (
                          <View style={styles.statItem}>
                            <MaterialIcons name="pets" size={14} color="#666" />
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => handleEdit(apt, e)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialIcons name="edit" size={20} color="#E3965A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => handleDelete(apt, e)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialIcons name="delete-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Modal - Only show if onEdit callback not provided */}
      {editingApartment && !onEdit && (
        <EditApartmentModal
          visible={!!editingApartment}
          apartment={editingApartment}
          onClose={() => setEditingApartment(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#E3965A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  apartmentCard: {
    flexDirection: "row-reverse",
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: 110,
    height: 110,
    position: "relative",
    top: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 16,
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  imageCountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  address: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "right",
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
    textAlign: "right",
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E3965A",
  },
  roomsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E3965A",
  },
  statsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: "#666",
  },
  actions: {
    flexDirection: "column",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 16,
    fontWeight: "500",
  },
});

