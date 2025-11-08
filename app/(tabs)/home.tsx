import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ApartmentCard from "@/components/apartment/apartmentCard";
import ApartmentDetails from "@/components/apartment/apartmentDetails";
import SearchBar from "@/components/home/searchBar";
import HouseLoading from "@/components/ui/loadingHouseSign";
import { useToast, toast } from "@/lib/ui/ToastAlertsProvider";

import { useApartments, type Apartment } from "@/context/ApartmentsContext";

// ===== Types =====
type LocationSuggest = {
  address: string;
  latitude?: number;
  longitude?: number;
  types?: string[];
};

type FiltersJson = {
  entryDate: string | null;
  exitDate: string | null;
  gender: string | null;
  filters: string[];
  icons: string[];
};

type ApartmentProps = {
  hideIcons?: boolean;
};

// ===== Utils =====

function hasGardenOrBalcony(apt: Apartment): boolean {
  try {
    const arr = JSON.parse(apt.LabelsJson || "[]") as Array<
      { value?: string } | string
    >;
    const vals = arr.map((x) =>
      (typeof x === "string" ? x : x.value || "")?.toLowerCase()
    );
    return vals.includes("garden") || vals.includes("balcony");
  } catch {
    return false;
  }
}

function normalizeString(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/[\s\-–"׳"]/g, "").toLowerCase();
}
function extractCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  if (parts.length >= 2) return parts[parts.length - 2].trim();
  return parts[0].trim();
}
function extractStreetFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  return parts[0].trim();
}
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ===== Component =====
export default function HomeScreen(props: ApartmentProps) {
  const { top } = useSafeAreaInsets();
  const lastScrollY = useRef(0);
  const searchBarTranslateY = useRef(new Animated.Value(0)).current;
  const { showToast } = useToast();
  const { home, loadHomeFirstPage, loadHomeNextPage, getApartmentsByIds } =
    useApartments();

  // --- Bootstrap חד-פעמי ---
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    loadHomeFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- מקור אמת לרשימת הבית ---
  const baseApartments = useMemo(
    () => getApartmentsByIds(home.ids),
    [home.ids, getApartmentsByIds]
  );

  // --- State תצוגה לסינון ---
  const [previewSearchApt, setPreviewSearchApt] = useState<Apartment[]>([]);
  const initializedRef = useRef(false);

  const [showApartmentDetails, setShowApartmentDetails] =
    useState<boolean>(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );

  const [index, setIndex] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggest | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 10000]);
  const [filtersJson, setFiltersJson] = useState<FiltersJson>({
    entryDate: null,
    exitDate: null,
    gender: null,
    filters: [],
    icons: [],
  });

  // אתחול התצוגה אחרי הגעת נתונים + עדכון כאשר baseApartments משתנה (טעינת עמודים נוספים)
  useEffect(() => {
    toast.success(showToast, "נשמר!", "הדירה הוספה לספריות שלך");
    if (!initializedRef.current && baseApartments.length > 0) {
      setPreviewSearchApt(baseApartments);
      console.log(baseApartments.length);
      initializedRef.current = true;
      // Reset scroll flag when initial data loads
      hasScrolledRef.current = false;
    } else if (initializedRef.current && index) {
      // אם אנחנו במצב "הצג הכל" (index=true), עדכן את previewSearchApt כאשר baseApartments גדל
      setPreviewSearchApt(baseApartments);
    }
  }, [baseApartments, index]);

  // --- סינון לוקאלי על בסיס baseApartments ---
  const SearchApartments = (filters?: FiltersJson): void => {
    if (!Array.isArray(baseApartments)) return;

    const newAptArr = baseApartments.filter((apt): boolean => {
      const matchesType =
        selectedType === null || apt.ApartmentType === selectedType;

      const aptPrice =
        typeof apt.Price === "string" ? parseInt(apt.Price) : apt.Price || 0;
      const matchesPrice =
        aptPrice >= priceRange[0] && aptPrice <= priceRange[1];

      let matchesLocation = true;
      let aptLocationObj: {
        address?: string;
        latitude?: number | null;
        longitude?: number | null;
      } = {};

      if (
        apt.Location &&
        typeof apt.Location === "string" &&
        apt.Location.trim().startsWith("{") &&
        apt.Location.trim().endsWith("}")
      ) {
        try {
          aptLocationObj = JSON.parse(apt.Location);
        } catch {
          // ignore
        }
      } else if (apt.Location) {
        aptLocationObj = {
          address: typeof apt.Location === "string" ? apt.Location : "",
          latitude: null,
          longitude: null,
        };
      }

      if (selectedLocation?.address) {
        const locationTypes = selectedLocation?.types || [];
        const city = extractCityFromAddress(selectedLocation.address);
        const street = extractStreetFromAddress(selectedLocation.address);

        if (locationTypes.includes("country")) {
          matchesLocation = true;
        } else if (locationTypes.includes("locality")) {
          const normalizedCity = normalizeString(city);
          matchesLocation =
            !!aptLocationObj.address &&
            normalizeString(aptLocationObj.address).includes(normalizedCity);
        } else if (locationTypes.includes("sublocality")) {
          const normalizedAddress = normalizeString(selectedLocation.address);
          const normalizedCity = normalizeString(city);
          matchesLocation =
            (!!aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(
                normalizedAddress
              )) ||
            (!!aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(normalizedCity));
        } else if (locationTypes.includes("street_address")) {
          const normalizedStreet = normalizeString(street);
          matchesLocation =
            (!!aptLocationObj.address &&
              normalizeString(aptLocationObj.address).includes(
                normalizedStreet
              )) ||
            (aptLocationObj.latitude != null &&
              aptLocationObj.longitude != null &&
              selectedLocation.latitude != null &&
              selectedLocation.longitude != null &&
              getDistance(
                selectedLocation.latitude,
                selectedLocation.longitude,
                aptLocationObj.latitude,
                aptLocationObj.longitude
              ) < 0.5);
        }
      }

      if (!filters) return matchesType && matchesPrice && matchesLocation;

      if (filters.entryDate && filters.exitDate) {
        const entry = new Date(filters.entryDate);
        const exit = new Date(filters.exitDate);
        const aptEntry = apt.EntryDate ? new Date(apt.EntryDate) : null;
        const aptExit = apt.ExitDate ? new Date(apt.ExitDate) : null;
        const isAvailable =
          (!aptEntry || aptEntry <= entry) && (!aptExit || aptExit >= exit);
        if (!isAvailable) return false;
      }

      if (filters.gender && filters.gender !== "אין העדפה") {
        const genderCode = filters.gender === "רק גברים" ? "Male" : "Female";
        if (apt.ApartmentType === 1 && apt.Roommates) {
          const roommates = apt.Roommates.split("||");
          const allMatch = roommates.every(
            (r) =>
              r.includes(`Gender:${genderCode}`) ||
              r.includes(`Gender: ${genderCode}`)
          );
          if (!allMatch) return false;
        }
      }

      const generalFilters = filters.filters || [];
      for (const f of generalFilters) {
        if (f === "מאפשרים חיות מחמד" && apt.AllowPet === false) return false;
        if (f === "מותר לעשן" && apt.AllowSmoking === false) return false;
        if (f === "חצר / מרפסת" && !hasGardenOrBalcony(apt)) return false;
        if (f === "חניה") {
          const n =
            typeof apt.ParkingSpace === "number"
              ? apt.ParkingSpace
              : parseInt(String(apt.ParkingSpace));
          if (!n || n <= 0) return false;
        }
        if (
          f === "ביטול ללא קנס" &&
          apt.Sublet_CanCancelWithoutPenalty !== true
        )
          return false;
        if (f === "מרוהטת") {
          try {
            const labels = JSON.parse(apt.LabelsJson || "[]") as Array<
              { value?: string } | string
            >;
            const labelValues = labels
              .map((l) => (typeof l === "string" ? l : l.value))
              .filter(Boolean);
            if (!labelValues.includes("couch")) return false;
          } catch {
            /* ignore */
          }
        }
      }

      const icons = filters.icons || [];
      if (icons.length > 0) {
        try {
          const labels = JSON.parse(apt.LabelsJson || "[]") as Array<
            { value?: string } | string
          >;
          const labelValues = labels
            .map((l) => (typeof l === "string" ? l : l.value))
            .filter(Boolean);
          for (const icon of icons)
            if (!labelValues.includes(icon)) return false;
        } catch {
          return false;
        }
      }

      return matchesType && matchesPrice && matchesLocation;
    });

    setPreviewSearchApt(newAptArr);
    setIndex(false);
  };

  // --- אנימציית חיפוש (הסתרה/הצגה) ---
  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;
      // Mark that user has scrolled
      if (currentScrollY > 0) {
        hasScrolledRef.current = true;
      }
      if (Math.abs(diff) < 5) return;
      if (diff > 0 && currentScrollY > 0) {
        Animated.timing(searchBarTranslateY, {
          toValue: -150,
          duration: 100,
          useNativeDriver: true,
        }).start();
      } else if (diff < -10) {
        Animated.timing(searchBarTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      lastScrollY.current = currentScrollY;
    },
    [searchBarTranslateY]
  );

  // --- FlatList: renderItem ---
  const renderItem = useCallback(
    ({ item: apt }: ListRenderItemInfo<Apartment>) => (
      <ApartmentCard
        apartment={apt}
        hideIcons={props.hideIcons}
        onPress={(apartment) => {
          setSelectedApartment(apartment);
          setShowApartmentDetails(true);
        }}
      />
    ),
    [props.hideIcons]
  );

  const keyExtractor = useCallback(
    (apt: Apartment) => String(apt.ApartmentID),
    []
  );

  // הגנות מפני onEndReached שנקרא תכופות
  const onEndReachedCalledDuringMomentum = useRef(false);
  const hasScrolledRef = useRef(false);
  const handleEndReached = useCallback(() => {
    if (onEndReachedCalledDuringMomentum.current) return;
    if (!home.hasMore || home.loading) return;
    // Prevent loading more until user has actually scrolled
    if (!hasScrolledRef.current) return;
    onEndReachedCalledDuringMomentum.current = true;
    loadHomeNextPage();
  }, [home.hasMore, home.loading, loadHomeNextPage]);

  // איפוס הדגל עם תחילת גלילה
  const onMomentumScrollBegin = useCallback(() => {
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.searchBarContainer,
          { top: top },
          { transform: [{ translateY: searchBarTranslateY }] },
        ]}
      >
        <SearchBar
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          SearchApartments={SearchApartments}
          filtersJson={filtersJson}
          setFiltersJson={setFiltersJson}
          index={index}
          setIndex={setIndex}
          showAllApartments={() => setPreviewSearchApt(baseApartments)}
        />
      </Animated.View>

      <FlatList
        data={previewSearchApt}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 145,
          paddingBottom: 24,
          backgroundColor: "#F0F0F0",
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        onMomentumScrollBegin={onMomentumScrollBegin}
        ListEmptyComponent={
          !home.loading && previewSearchApt.length === 0 ? (
            <View style={{ paddingTop: 180, alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: "#333" }}>
                לא נמצאו דירות...
              </Text>
            </View>
          ) : null
        }
        refreshing={home.loading && previewSearchApt.length === 0}
        onRefresh={() => {
          // רענון ראשי – נטען עמוד ראשון מחדש
          initializedRef.current = false;
          setPreviewSearchApt([]);
          hasScrolledRef.current = false;
          loadHomeFirstPage();
        }}
      />

      <Modal
        visible={showApartmentDetails}
        animationType="slide"
        onRequestClose={() => {
          setShowApartmentDetails(false);
          setSelectedApartment(null);
        }}
      >
        {selectedApartment && (
          <ApartmentDetails
            key={selectedApartment.ApartmentID}
            apt={selectedApartment}
            onClose={() => {
              setShowApartmentDetails(false);
              setSelectedApartment(null);
            }}
          />
        )}
      </Modal>
      {/* Loading overlay when fetching exttra apartments */}
      {home.loading && previewSearchApt.length > 0 ? (
        <View style={{ paddingVertical: 32, alignItems: "center" }}>
          <HouseLoading text="טוען דירות נוספות..." overlay={false} />
        </View>
      ) : null}

      {/* Loading overlay when first fetching apartments */}
      {home.loading && previewSearchApt.length === 0 && (
        <HouseLoading text="טוען דירות..." overlay={true} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "transparent" },
  searchBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
});
