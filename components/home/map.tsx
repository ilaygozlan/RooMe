import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

//import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import HouseLoading from "@/components/ui/loadingHouseSign";
//import ApartmentDetails from "./ApartmentDetails";

// ---- Types ----
interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface MapApartment {
  ApartmentID: string | number;
  Location?: string | null; // JSON string with { latitude, longitude }
  Price?: number | null;
  Description?: string | null;
  // ...you may add more fields as needed
}

interface Apartment extends MapApartment {
  // Full apartment model (extend as needed)
  [key: string]: unknown;
}

interface ActiveApartmentContextType {
  mapLocationAllApt: MapApartment[];
  allApartments: Apartment[];
}

type ExtendedApartment = Apartment & {
  LikeCount?: number;
  NumOfLikes?: number;
  GardenBalcony?: boolean;
};

export default function Map(): React.JSX.Element {
  // If your context is typed, remove the `as` cast:
  /*   const { mapLocationAllApt, allApartments } =
    useContext(ActiveApartmentContext) as ActiveApartmentContextType; */
  const allApartments: ExtendedApartment[] = [];
const mapLocationAllApt: ExtendedApartment[] = [
  {
    ApartmentID: 101,
    Creator_ID: 1,
    Creator_FullName: "Daniel Cohen",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=12",
    Images: [
      "https://picsum.photos/800/400?random=1",
      "https://picsum.photos/800/400?random=2",
    ],
    ApartmentType: 1, // 0=rental, 1=shared, 2=sublet
    Location:
      '{"address": "Dizengoff 100, Tel Aviv, Israel", "latitude": 32.0853, "longitude": 34.7818}',
    Price: 5200,
    Description:
      "Modern apartment in the city center, fully furnished with balcony and elevator.",
    AmountOfRooms: 3,
    AllowPet: true,
    AllowSmoking: false,
    ParkingSpace: 1,
    EntryDate: "2025-11-15T00:00:00",
    ExitDate: null,
    Rental_ContractLength: 12,
    Rental_ExtensionPossible: true,
    Shared_NumberOfRoommates: 2,
    Roommates:
      "Name:Noa|Gender:Female|Job:Designer|BirthDate:1998-09-01|Image:https://i.pravatar.cc/100?img=45||Name:Omer|Gender:Male|Job:Engineer|BirthDate:1997-05-10|Image:https://i.pravatar.cc/100?img=32",
    Sublet_CanCancelWithoutPenalty: false,
    Sublet_IsWholeProperty: false,
    LabelsJson:
      '[{"value":"balcony"},{"value":"fridge"},{"value":"air conditioner"},{"value":"elevator"}]',
    NumOfLikes: 5,
    IsLikedByUser: false,
  },
  {
    ApartmentID: 102,
    Creator_ID: 2,
    Creator_FullName: "Yael Levy",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=30",
    Images: [
      "https://picsum.photos/800/400?random=3",
      "https://picsum.photos/800/400?random=4",
    ],
    ApartmentType: 0,
    Location:
      '{"address": "Ben Gurion Blvd 15, Herzliya, Israel", "latitude": 32.1624, "longitude": 34.8447}',
    Price: 7500,
    Description:
      "Spacious 4-room apartment near the beach, with private parking and garden.",
    AmountOfRooms: 4,
    AllowPet: false,
    AllowSmoking: true,
    ParkingSpace: 2,
    EntryDate: "2025-12-01T00:00:00",
    ExitDate: null,
    Rental_ContractLength: 24,
    Rental_ExtensionPossible: false,
    Shared_NumberOfRoommates: null,
    Roommates: "",
    Sublet_CanCancelWithoutPenalty: false,
    Sublet_IsWholeProperty: false,
    LabelsJson:
      '[{"value":"garden"},{"value":"parking"},{"value":"oven"},{"value":"dishwasher"}]',
    NumOfLikes: 12,
    IsLikedByUser: true,
  },
  {
    ApartmentID: 103,
    Creator_ID: 3,
    Creator_FullName: "Nadav Ben Ari",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=58",
    Images: [
      "https://picsum.photos/800/400?random=5",
      "https://picsum.photos/800/400?random=6",
    ],
    ApartmentType: 2,
    Location:
      '{"address": "HaNeviim 22, Jerusalem, Israel", "latitude": 31.7784, "longitude": 35.2066}',
    Price: 4200,
    Description:
      "Short-term sublet for 3 months in a cozy 2-room apartment near city center.",
    AmountOfRooms: 2,
    AllowPet: false,
    AllowSmoking: false,
    ParkingSpace: 0,
    EntryDate: "2025-11-10T00:00:00",
    ExitDate: "2026-02-10T00:00:00",
    Rental_ContractLength: null,
    Rental_ExtensionPossible: false,
    Shared_NumberOfRoommates: null,
    Roommates: "",
    Sublet_CanCancelWithoutPenalty: true,
    Sublet_IsWholeProperty: true,
    LabelsJson:
      '[{"value":"fridge"},{"value":"microwave"},{"value":"oven"},{"value":"tv"}]',
    NumOfLikes: 3,
    IsLikedByUser: false,
  },
  {
    ApartmentID: 104,
    Creator_ID: 4,
    Creator_FullName: "Lior Katz",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=70",
    Images: [
      "https://picsum.photos/800/400?random=7",
      "https://picsum.photos/800/400?random=8",
    ],
    ApartmentType: 1,
    Location:
      '{"address": "Herzl 12, Ramat Gan, Israel", "latitude": 32.0684, "longitude": 34.8248}',
    Price: 4800,
    Description:
      "Shared apartment close to university, suitable for students. Includes WiFi and AC.",
    AmountOfRooms: 3,
    AllowPet: true,
    AllowSmoking: true,
    ParkingSpace: 0,
    EntryDate: "2025-11-20T00:00:00",
    ExitDate: null,
    Rental_ContractLength: 12,
    Rental_ExtensionPossible: true,
    Shared_NumberOfRoommates: 1,
    Roommates:
      "Name:Eden|Gender:Female|Job:Student|BirthDate:2000-03-15|Image:https://i.pravatar.cc/100?img=47",
    Sublet_CanCancelWithoutPenalty: false,
    Sublet_IsWholeProperty: false,
    LabelsJson:
      '[{"value":"balcony"},{"value":"air conditioner"},{"value":"washing machine"},{"value":"lamp"}]',
    NumOfLikes: 8,
    IsLikedByUser: false,
  },
];

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );

  // ---- Effects ----
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("הודעה", "כדי להשתמש במפה, יש לאשר גישה למיקום");
          setLoading(false);
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert(
            "הודעה",
            "שירותי המיקום כבויים. הפעל אותם בהגדרות המכשיר"
          );
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (e) {
        console.warn("Location error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- Helpers ----
  const parseLocation = (loc?: string | null): GeoPoint | null => {
    if (!loc || typeof loc !== "string") return null;
    const trimmed = loc.trim();
    if (!trimmed.startsWith("{")) return null;

    try {
      const obj = JSON.parse(trimmed) as Partial<GeoPoint>;
      const { latitude, longitude } = obj;
      if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        return { latitude, longitude };
      }
      return null;
    } catch {
      return null;
    }
  };

const markers = useMemo(() => {
  return mapLocationAllApt
    .map((apt) => {
      const point = parseLocation(apt.Location);
      if (!point) return null;

      const selected = allApartments.find(
        (a) => a.ApartmentID === apt.ApartmentID
      );

      const title =
        typeof apt.Price === "number"
          ? `${apt.Price.toLocaleString("he-IL")} ₪`
          : "—";

      const description = apt.Description || "אין תיאור";

      return (
        <Marker
          key={String(apt.ApartmentID)}
          coordinate={point}
          title={title}
          description={description}
          onPress={() => setSelectedApartment(selected ?? null)}
        >
          {/* 🏠 Custom house icon instead of default pin */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 25,
              padding: 6,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 6,
            }}
          >
            <Ionicons name="home" size={28} color="#E3965A" />
          </View>
        </Marker>
      );
    })
    .filter(Boolean) as React.ReactElement[];
}, [mapLocationAllApt, allApartments]);

  // ---- Render ----
  if (loading || !region) {
    return <HouseLoading text="מעלה דירות על המפה" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <MapView style={styles.map} region={region}>
        {markers}
      </MapView>

      {selectedApartment && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedApartment(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/*    <ApartmentDetails
                key={String(selectedApartment.ApartmentID)}
                apt={selectedApartment}
                onClose={() => setSelectedApartment(null)}
              /> */}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 30,
    zIndex: 1000,
    backgroundColor: "rgba(253, 164, 47, 0.7)",
    padding: 10,
    borderRadius: 30,
  },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "right",
    color: "#333",
  },
  calloutDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "right",
  },
  calloutButton: {
    backgroundColor: "#5C67F2",
    paddingVertical: 8,
    borderRadius: 5,
  },
  calloutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
});

