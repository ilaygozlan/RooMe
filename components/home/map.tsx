// app/(tabs)/Map.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import HouseLoading from "@/components/ui/loadingHouseSign";
import FloatingSearchFAB, { type Brokerage } from "@/components/home/FloatingSearchFAB";
import { useApartments, type Apartment } from "@/context/ApartmentsContext";
import ApartmentDetails from "@/components/apartment/apartmentDetails";

// ---- Types (מקומיים בלבד להצגה במפה) ----
interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ---- קומפוננטה ----
export default function Map(): React.JSX.Element {
  const router = useRouter();

  // ----- חיבור לקונטקסט -----
  const {
    map,                      // { ids, loading, ... }
    setMapBounds,             // (bounds) => void
    setMapFilters,            // (filters) => void
    refreshMap,               // () => Promise<void>
    getApartmentsByIds,       // (ids: string[]) => Apartment[]
  } = useApartments();

  // ----- מצב מסך -----
  const [region, setRegion] = useState<Region | null>(null);
  const [bootLoading, setBootLoading] = useState<boolean>(true);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  // ----- רפרנסים -----
  const mapRef = useRef<MapView>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----- עזרי מפה -----
  const initialRegion: Region = {
    latitude: 32.0853,      // TLV ברירת מחדל
    longitude: 34.7818,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  };

  const regionToBounds = (r: Region) => ({
    north: r.latitude + r.latitudeDelta / 2,
    south: r.latitude - r.latitudeDelta / 2,
    east:  r.longitude + r.longitudeDelta / 2,
    west:  r.longitude - r.longitudeDelta / 2,
  });

  // ----- קבלת מיקום משתמש + אתחול מפה -----
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("הודעה", "כדי להשתמש במפה, יש לאשר גישה למיקום");
          setRegion(initialRegion);
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert("הודעה", "שירותי המיקום כבויים. הפעל אותם בהגדרות המכשיר");
          setRegion(initialRegion);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } catch {
        setRegion(initialRegion);
      } finally {
        setBootLoading(false);
      }
    })();
  }, []);

  // ----- טעינת 50 הדירות הראשונות כאשר המפה מוכנה -----
  const onMapReady = useCallback(() => {
    if (!mapRef.current) return;

    const tryRefresh = (bounds: { north:number; south:number; east:number; west:number }) => {
      setMapBounds(bounds);
      // אם אין פילטרים, אתחל עם טווח מחיר ברירת מחדל
      // useEffect יטפל ב-refresh אוטומטית אחרי שהפילטרים וה-bounds יתעדכנו
      if (!map.filters || Object.keys(map.filters).length === 0) {
        setMapFilters({
          minPrice: 0,
          maxPrice: 30000,
        });
      }
      // refreshMap יקרא אוטומטית דרך useEffect כאשר גם bounds וגם filters מוגדרים
    };

    // מנסה להשיג גבולות מהמפה; אם אין—נופל לאיזור הראשוני
    // @ts-ignore: getMapBoundaries לא מוקלד תמיד
    if (mapRef.current.getMapBoundaries) {
      // @ts-ignore
      mapRef.current.getMapBoundaries()
        .then(({ northEast, southWest }) => {
          tryRefresh({
            north: northEast.latitude,
            east:  northEast.longitude,
            south: southWest.latitude,
            west:  southWest.longitude,
          });
        })
        .catch(() => {
          tryRefresh(regionToBounds(region ?? initialRegion));
        });
    } else {
      tryRefresh(regionToBounds(region ?? initialRegion));
    }
  }, [region, setMapBounds, setMapFilters, map.filters]);

  // ----- רענון אחרי גרירת מפה (debounce) -----
  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
    setMapBounds(regionToBounds(r));
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      refreshMap();
    }, 250);
  }, [setMapBounds, refreshMap]);

  // ----- רענון אוטומטי כאשר הפילטרים משתנים -----
  useEffect(() => {
    // רק אם יש bounds ויש פילטרים (כולל אתחול ראשוני)
    if (map.bounds && map.filters && Object.keys(map.filters).length > 0) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        refreshMap();
      }, 100);
    }
  }, [map.filters, map.bounds, refreshMap]);

  // ----- עזר: פיענוח קואורדינטות מתוך שדה Location -----
  const parseLocation = (loc?: string | null): GeoPoint | null => {
    if (!loc || typeof loc !== "string") return null;
    const trimmed = loc.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      const obj = JSON.parse(trimmed) as Partial<GeoPoint>;
      if (
        typeof obj.latitude === "number" &&
        typeof obj.longitude === "number" &&
        Number.isFinite(obj.latitude) &&
        Number.isFinite(obj.longitude)
      ) {
        return { latitude: obj.latitude, longitude: obj.longitude };
      }
      return null;
    } catch {
      return null;
    }
  };

  // ----- הבאת הדירות מהקונטקסט לפי map.ids -----
  const apartments: Apartment[] = useMemo(
    () => getApartmentsByIds(map.ids),
    [map.ids, getApartmentsByIds]
  );

  // ----- בניית מרקרים -----
  const markers = useMemo(() => {
    return apartments
      .map((apt) => {
        const point = parseLocation(apt.Location);
        if (!point) return null;

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
            onPress={() => setSelectedApartment(apt)}
          >
            {/* 🏠 אייקון מותאם במקום פין ברירת מחדל */}
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
  }, [apartments]);

  // ----- טיפול בסינון מה־FAB (מחבר ל־map.filters בקונטקסט) -----
  const handleApplyFilters = useCallback((filters: {
    minPrice: number;
    maxPrice: number;
    brokerage: Brokerage; // לא נתמך בקונטקסט כרגע – נתעלם, או תוכל למפות ל־features במידת הצורך
  }) => {
    const { minPrice, maxPrice } = filters;

    // מעדכן פילטרים גלובליים של המפה בקונטקסט (רק מחיר בשלב זה)
    setMapFilters({
      minPrice,
      maxPrice,
      // אם תרצה למפות "ברוקר" ל־features/LabelsJson בהמשך, תוכל להוסיף כאן:
      // features: filters.brokerage === "with" ? ["brokerage"] : filters.brokerage === "without" ? ["no_brokerage"] : []
    });

    // refreshMap יקרא אוטומטית דרך useEffect כאשר map.filters משתנה
  }, [setMapFilters]);

  // ----- מסכי טעינה -----
  if (bootLoading || !region) {
    return <HouseLoading text="מעלה דירות על המפה" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onMapReady={onMapReady}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers}
      </MapView>

      {/* אינדיקציית טעינה בעת רענון תוצאות מפה */}
      {map.loading && (
        <View style={{ position: "absolute", top: 12, alignSelf: "center" }}>
          <HouseLoading text="טוען דירות במפה..." overlay={false} />
        </View>
      )}

      {/* Floating Search FAB – מעדכן פילטרים בקונטקסט ומרענן */}
      <FloatingSearchFAB
        onApplyFilters={handleApplyFilters}
        minPriceBoundary={0}
        maxPriceBoundary={30000}
        initialFilters={{
          minPrice: map.filters?.minPrice ?? 0,
          maxPrice: map.filters?.maxPrice ?? 30000,
          brokerage: "any"
        }}
      />

      {selectedApartment && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedApartment(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            {/* חבר כאן את קומפוננטת הפרטים שלך */}
              
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
  backButton: {
    position: "absolute",
    top: 80,
    left: 30,
    zIndex: 1000,
    backgroundColor: "rgba(253, 164, 47, 0.7)",
    padding: 10,
    borderRadius: 30,
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
