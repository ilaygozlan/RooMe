import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Apartment } from "@/context/ApartmentsContext";
import EditApartmentModal from "./editApartmentModal";

const windowWidth = Dimensions.get("window").width;
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 1;
const CARD_WIDTH = windowWidth - (CARD_MARGIN * 2) - 40; // Full width minus margins and padding

type Props = {
  userId: number | string;
  apartments: Apartment[];
  onUpdate?: (apartment: Apartment) => void;
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

export default function UserOwnedApartmentsGrid({ userId, apartments, onUpdate }: Props) {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  // Use mock data if no apartments provided
  const userApartments = useMemo(() => {
    if (apartments && apartments.length > 0) {
      return apartments.filter((apt) => apt.Creator_ID === Number(userId));
    }
    return getMockUserApartments(userId);
  }, [apartments, userId]);

  const handleEdit = (apartment: Apartment) => {
    setEditingApartment(apartment);
  };

  const handleView = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    // You can open apartment details here
    (globalThis as any).__openAptDetails__?.(apartment);
  };

  const handleDelete = (apartment: Apartment) => {
    Alert.alert(
      "מחיקת דירה",
      "האם אתה בטוח שברצונך למחוק את הדירה? פעולה זו לא ניתנת לביטול.",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק",
          style: "destructive",
          onPress: () => {
            // Handle delete logic here
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

  const renderApartmentCard = (item: Apartment) => {
    const locationData = locationToAddress(item.Location);
    const typeColor = getTypeColor(item.ApartmentType);
    const mainImage = item.Images && item.Images.length > 0 ? item.Images[0] : null;

    return (
      <View style={[styles.card, { borderLeftColor: typeColor, borderLeftWidth: 4 }]}>
        {/* Image */}
        <TouchableOpacity onPress={() => handleView(item)} activeOpacity={0.9}>
          <View style={styles.imageContainer}>
            {mainImage ? (
              <Image source={{ uri: mainImage }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <MaterialIcons name="home" size={40} color="#ccc" />
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeBadgeText}>{getTypeName(item.ApartmentType)}</Text>
            </View>
            {item.Images && item.Images.length > 1 && (
              <View style={styles.imageCountBadge}>
                <MaterialIcons name="photo-library" size={14} color="#fff" />
                <Text style={styles.imageCountText}>{item.Images.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.cardContent}>
          <TouchableOpacity onPress={() => handleView(item)} activeOpacity={0.7}>
            <Text style={styles.address} numberOfLines={1}>
              {locationData}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.Description || "ללא תיאור"}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{item.Price.toLocaleString()} ש"ח</Text>
              <View style={styles.roomsBadge}>
                <MaterialIcons name="meeting-room" size={14} color="#E3965A" />
                <Text style={styles.roomsText}>{item.AmountOfRooms}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="favorite" size={14} color="#E3965A" />
              <Text style={styles.statText}>{item.NumOfLikes || 0}</Text>
            </View>
            {item.ParkingSpace > 0 && (
              <View style={styles.statItem}>
                <MaterialIcons name="local-parking" size={14} color="#666" />
                <Text style={styles.statText}>{item.ParkingSpace}</Text>
              </View>
            )}
            {item.AllowPet && (
              <View style={styles.statItem}>
                <MaterialIcons name="pets" size={14} color="#666" />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(item)}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>ערוך</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleView(item)}
            >
              <MaterialIcons name="visibility" size={18} color="#E3965A" />
              <Text style={[styles.actionButtonText, { color: "#E3965A" }]}>צפה</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <MaterialIcons name="delete-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (userApartments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="home-outline" size={64} color="#E3965A" />
        <Text style={styles.emptyTitle}>אין דירות שפורסמו</Text>
        <Text style={styles.emptyText}>פרסם את הדירה הראשונה שלך כדי להתחיל</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>הדירות שלי</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{userApartments.length}</Text>
        </View>
      </View>

      <View style={styles.listContent}>
        {userApartments.map((item) => (
          <View key={`apt-${item.ApartmentID}`}>
            {renderApartmentCard(item)}
          </View>
        ))}
      </View>

      {/* Edit Modal */}
      {editingApartment && (
        <EditApartmentModal
          visible={!!editingApartment}
          apartment={editingApartment}
          onClose={() => setEditingApartment(null)}
          onSave={handleSaveEdit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  countBadge: {
    backgroundColor: "#E3965A",
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: CARD_MARGIN,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    fontSize: 11,
    fontWeight: "bold",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  imageCountText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
  },
  address: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textAlign: "right",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "right",
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E3965A",
  },
  roomsBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3EA",
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 6,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
    flex: 1,
  },
  editButton: {
    backgroundColor: "#E3965A",
  },
  viewButton: {
    backgroundColor: "#FFF3EA",
    borderWidth: 1,
    borderColor: "#E3965A",
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

