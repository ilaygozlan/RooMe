
import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ActiveApartmentContext } from "./contex/ActiveApartmentContext";
import HouseLoading from "./components/LoadingHouseSign";
import ApartmentDetails from "./ApartmentDetails";

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

export default function Map(): React.JSX.Element {
  // If your context is typed, remove the `as` cast:
  const { mapLocationAllApt, allApartments } =
    useContext(ActiveApartmentContext) as ActiveApartmentContextType;

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
          Alert.alert("הודעה", "שירותי המיקום כבויים. הפעל אותם בהגדרות המכשיר");
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
          />
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
              <ApartmentDetails
                key={String(selectedApartment.ApartmentID)}
                apt={selectedApartment}
                onClose={() => setSelectedApartment(null)}
              />
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
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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