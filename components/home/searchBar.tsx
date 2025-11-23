import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { GooglePlacesAutocomplete } from "@/components/home/googlePlacesCustomAPI";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { AntDesign, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ENV } from "../../src/config/env";

// ---------- Types ----------
type PriceRange = [number, number];

interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
  types?: string[];
}

interface FiltersJson {
  entryDate?: string;
  exitDate?: string;
  gender?: string; // one of genderOptions (Hebrew)
  filters?: string[]; // roommateFilters
  icons?: string[]; // ids/labels selected
}

interface SearchBarProps {
  selectedType: number | null;
  setSelectedType: (type: number | null) => void;

  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (loc: SelectedLocation | null) => void;

  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;

  SearchApartments: (filters?: Partial<FiltersJson>) => void;

  filtersJson?: FiltersJson;
  setFiltersJson?: (f: FiltersJson) => void;

  index: boolean; // true = "has results" mode (refresh icon shows)
  setIndex: (val: boolean) => void;

  showAllApartments: () => void;
  
  onScroll?: () => void; // Callback when scroll happens to reset expanded state
}

// ---------- Constants ----------
const colors = {
  primary: "#E3965A",
  background: "#FDEAD7",
} as const;

const genderOptions = ["אין העדפה", "רק גברים", "רק נשים"] as const;

const roommateFilters = [
  "מאפשרים חיות מחמד",
  "חניה",
  "ביטול ללא קנס",
  "מיזוג אוויר",
  "חצר / מרפסת",
  "מותר לעשן",
  "מרוהטת",
] as const;

const categories = [
  { id: 0, name: "השכרה", icon: "home" as const },
  { id: 1, name: "שותפים", icon: "team" as const },
  { id: 2, name: "סאבלט", icon: "swap" as const },
];

// ---------- Component ----------
const SearchBar: React.FC<SearchBarProps> = ({
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  priceRange,
  setPriceRange,
  SearchApartments,
  filtersJson,
  setFiltersJson,
  index,
  setIndex,
  showAllApartments,
  onScroll,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>(
    selectedLocation?.address ?? ""
  );
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [showAdvancedFiltersComp, setShowAdvancedFiltersComp] =
    useState<boolean>(false);

  const router = useRouter();
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef | null>(null);
  const expandedRef = useRef(expanded);

  // Enable LayoutAnimation on Android
  if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  // Keep ref in sync with state
  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  useEffect(() => {
    setSearchInput(selectedLocation?.address ?? "");
  }, [expanded, selectedLocation]);

  // Store reset function in module-level variable for SearchHeader to access
  useEffect(() => {
    const resetExpanded = () => {
      if (expandedRef.current) {
        setExpanded(false);
      }
    };
    // Store reset function globally so SearchHeader can access it
    (SearchBar as any).__resetExpanded = resetExpanded;
    return () => {
      delete (SearchBar as any).__resetExpanded;
    };
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Row: Search bar + Map icon */}
      <View style={styles.searchRow}>
        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={toggleExpand}>
          {index ? (
            <Ionicons
              name="search"
              size={20}
              color="#000"
              style={styles.icon}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSelectedType(null);
                setSelectedLocation(null);
                setPriceRange([0, 20000]);
                setSearchInput("");
                SearchApartments();
                setExpanded(false);
                setIndex(true);
                showAllApartments();
              }}
            >
              <Ionicons
                name="refresh-outline"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.locationMain, { textAlign: "right" }]}>
              {selectedLocation || selectedType !== null
                ? `${selectedLocation?.address ?? ""}${
                    selectedLocation && selectedType !== null ? " • " : ""
                  }${
                    selectedType !== null ? categories[selectedType].name : ""
                  }`
                : "מה תרצה לחפש?"}
            </Text>
            <Text style={[styles.locationSub, { textAlign: "right" }]}>
              הוספת מיקום, תאריכים, טווח מחירים
            </Text>
          </View>
        </TouchableOpacity>

        {showAdvancedFilters && !index && (
          <TouchableOpacity
            style={styles.filterIconContainer}
            onPress={() => setShowAdvancedFiltersComp((prev) => !prev)}
          >
            <FontAwesome5 name="sliders-h" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Map icon */}
        <Link href="/map" asChild>
          <TouchableOpacity 
            style={styles.mapIconContainer}
            testID="mapButton"
          >
            <FontAwesome5 name="map-marked-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Advanced filters component placeholder (commented) */}
      {/*
      {showAdvancedFiltersComp && (
        <View style={{ marginTop: 10, width: "100%", height: "85%" }}>
          <SearchFilters
            SearchApartments={(filters) => {
              setFiltersJson?.(filters);
              SearchApartments(filters);
              setShowAdvancedFiltersComp(false);
            }}
            initialEntryDate={filtersJson?.entryDate ? new Date(filtersJson.entryDate) : null}
            initialExitDate={filtersJson?.exitDate ? new Date(filtersJson.exitDate) : null}
            initialGenderIndex={filtersJson?.gender ? genderOptions.indexOf(filtersJson.gender as any) : null}
            initialRoommateOptions={roommateFilters.map(
              (f) => filtersJson?.filters?.includes(f) || false
            )}
            initialSelectedIcons={filtersJson?.icons || []}
          />
        </View>
      )}
      */}

      {expanded && (
        <View style={styles.expandSection}>
          {/* Google Autocomplete */}
          <View style={{ zIndex: 2, width: "100%", margin: 0 }}>
            <Text style={[styles.label, { marginTop: 0 }]}>בחר מיקום:</Text>

            <GooglePlacesAutocomplete
              onFail={(error) => {
                console.error("Autocomplete ERROR:", error);
                Alert.alert("שגיאה", "אירעה שגיאה בעת חיפוש הכתובת");
              }}
              textInputProps={{
                onFocus: () => {},
                onBlur: () => {},
                autoCorrect: false,
              }}
              placeholder={selectedLocation?.address || "הקלד מיקום..."}
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (!details || !details.geometry?.location) {
                  console.warn("No location details available");
                  Alert.alert("שגיאה", "פרטי מיקום לא זמינים כרגע");
                  return;
                }

                const location = details.formatted_address || "";
                const lat = details.geometry.location.lat;
                const lng = details.geometry.location.lng;

                const fullAddress = {
                  address: location,
                  latitude: lat,
                  longitude: lng,
                  types: details.types || [],
                };
                console.log(fullAddress);
                setSelectedLocation(fullAddress);
              }}
              isRowScrollable={false}
              query={{
                key: "AIzaSyCGucSUapSIUa_ykXy0K8tl6XR-ITXRj3o",
                language: "he",
                components: "country:il",
              }}
              enablePoweredByContainer={false}
              styles={{
                textInput: {
                  height: 48,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  fontSize: 16,
                  marginBottom: 15,
                  textAlign: "right",
                  backgroundColor: "white",
                },
                listView: {
                  position: "absolute",
                  top: 50,
                  zIndex: 1000,
                  elevation: 5,
                  backgroundColor: "white",
                  width: "100%",
                },
              }}
            />
          </View>

          {/* Categories */}
          <Text style={[styles.label, { marginTop: 65 }]}>בחר קטגוריה:</Text>
          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBox,
                  selectedType === cat.id && styles.selectedCategory,
                ]}
                onPress={() =>
                  setSelectedType(selectedType === cat.id ? null : cat.id)
                }
              >
                <AntDesign
                  name={cat.icon}
                  size={28}
                  color={selectedType === cat.id ? colors.primary : "gray"}
                  style={{ marginBottom: 5 }}
                />
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price range */}
          <Text style={[styles.label, { marginTop: 25 }]}>
            בחר טווח מחירים:
          </Text>

          <MultiSlider
            values={priceRange}
            min={0}
            max={20000}
            step={100}
            onValuesChange={(values: number[]) =>
              setPriceRange([values[0] ?? 0, values[1] ?? 0])
            }
            selectedStyle={{ backgroundColor: colors.primary }}
            markerStyle={{ backgroundColor: colors.primary }}
            containerStyle={{ marginHorizontal: 10 }}
          />

          <View style={styles.priceDisplay}>
            <Text style={styles.priceText}>מינימום: {priceRange[0]} ₪</Text>
            <Text style={styles.priceText}>מקסימום: {priceRange[1]} ₪</Text>
          </View>

          {/* Search button */}
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => {
                console.log("מיקום שנבחר:", selectedLocation);
                console.log("סוג דירה שנבחר:", selectedType);
                console.log(
                  "טווח מחירים:",
                  `${priceRange[0]} - ${priceRange[1]} `
                );
                SearchApartments();
                setExpanded(false);
                setShowAdvancedFilters(true);
              }}
            >
              <Text style={styles.searchButtonText}>חיפוש</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    padding: 15,
    alignItems: "center",
    gap: 10,
  },
  searchRow: {
    flexDirection: "row-reverse",
    backgroundColor: "transparent",
    alignItems: "center",
    gap: 10,
    zIndex: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fefefe",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 15,
    zIndex: 2,
    // Shadow for floating effect
    shadowColor: "#E3965A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  locationMain: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  locationSub: {
    fontSize: 12,
    color: "gray",
  },
  expandSection: {
    marginTop: 10,
    maxHeight: 500,
    padding: 10,
    backgroundColor: "#fefefe",
    zIndex: 1,
    borderRadius: 15,
    width: "100%",
    // Shadow for floating effect
    shadowColor: "#E3965A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
    marginTop: 20,
  },
  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryBox: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10,
    width: 100,
    backgroundColor: "#f9f9f9",
  },
  selectedCategory: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchButtonContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3,
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  priceDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 10,
  },
  priceText: {
    fontSize: 14,
    color: "#555",
  },
  mapIconContainer: {
    backgroundColor: "rgba(227, 150, 90, 0.9)",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // Shadow for floating effect
    shadowColor: "#E3965A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterIconContainer: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // Shadow for floating effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SearchBar;
