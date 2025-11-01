import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Share,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
//import LikeButton from "@/components/apartment/likeButton";
import OpenHouseButton from "@/components/apartment/openHouseButton";
import SearchBar from "@/components/home/searchBar";
import ApartmentGallery from "@/components/apartment/apartmentGallery";
//import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import ApartmentDetails, {
  type Apartment,
} from "@/components/apartment/apartmentDetails";
//import { userInfoContext } from "../contex/userInfoContext";

// Types
type Location = {
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

/* type UserInfoContext = {
  loginUserId?: number | string | null;
}; */

// Extended apartment type with additional fields used in this component
type ExtendedApartment = Apartment & {
  LikeCount?: number;
  NumOfLikes?: number;
  GardenBalcony?: boolean;
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const hexToRgba = (hex: string, alpha: number = 0.5): string => {
  let cleanHex = hex.replace("#", "");

  // Handle short hex (#fff → #ffffff)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Ensure valid hex length
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid HEX color: ${hex}`);
  }

  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function ApartmentComponent(props: ApartmentProps) {
  const [width, setWidth] = useState(0);
  const allApartments: ExtendedApartment[] = [
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
      Location: '{"address": "Dizengoff 100, Tel Aviv"}',
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
      Location: '{"address": "Ben Gurion Blvd 15, Herzliya"}',
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
      Location: '{"address": "HaNeviim 22, Jerusalem"}',
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
      Location: '{"address": "Hertzl 12, Ramat Gan"}',
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

  // Note: userInfoContext is commented out, so we'll handle it as optional
  /*   const userInfoContext = null as UserInfoContext | null;
   */ /*   const { loginUserId } = (userInfoContext || {}) as UserInfoContext; */
  const loginUserId = 0; // dev only
  const [previewSearchApt, setPreviewSearchApt] =
    useState<ExtendedApartment[]>(allApartments);
  const [showApartmentDetails, setShowApartmentDetails] =
    useState<boolean>(false);
  const [selectedApartment, setSelectedApartment] =
    useState<ExtendedApartment | null>(null);
  const router = useRouter();
  const [index, setIndex] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 10000]);
  const [filtersJson, setFiltersJson] = useState<FiltersJson>({
    entryDate: null,
    exitDate: null,
    gender: null,
    filters: [],
    icons: [],
  });

  /* useEffect(() => {
    const sortedApts = [...allApartments].sort((a, b) => {
      const aHasImages = Array.isArray(a.Images) && a.Images.length > 0;
      const bHasImages = Array.isArray(b.Images) && b.Images.length > 0;

      // First: sort by whether they have images (true first), then by LikeCount
      if (aHasImages && !bHasImages) return -1;
      if (!aHasImages && bHasImages) return 1;

      // If both have or both don't have images, sort by LikeCount descending
      return (b.LikeCount || 0) - (a.LikeCount || 0);
    });

    setPreviewSearchApt(sortedApts);
  }, [allApartments]); */

  const handleShareApartment = async (
    apt: ExtendedApartment
  ): Promise<void> => {
    const locationText =
      typeof apt.Location === "string"
        ? apt.Location.replace(/^{"address":\s*"([^"]+)"}$/, "$1")
        : apt.Location || "מיקום לא זמין";
    const message = `דירה שווה שמצאתי באפליקציה:\n\nמיקום: ${locationText}\nמחיר: ${apt.Price} ש"ח\n\n${apt.Description}`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getBorderColor = (type: number): string => {
    switch (type) {
      case 0:
        return "#F0C27B";
      case 1:
        return "#F4B982";
      case 2:
        return "#E3965A";
      default:
        return "#ddd";
    }
  };
  

  const getTypeName = (type: number): string => {
    switch (type) {
      case 0:
        return "Rental";
      case 1:
        return "Roommates";
      case 2:
        return "Sublet";
      default:
        return "Unknown";
    }
  };

  const renderApartments = (): React.ReactNode => {
    if (previewSearchApt.length === 0) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <Text style={{ fontSize: 18, color: "#333" }}>לא נמצאו דירות...</Text>
        </View>
      );
    }

    return previewSearchApt.map((apt) => (
      <View
        key={apt.ApartmentID}
        style={[
          styles.card,
          { shadowColor: getBorderColor(apt.ApartmentType) },
        ]}
      >
        <View
          style={[
            styles.typeLabel,
            { backgroundColor: hexToRgba(getBorderColor(apt.ApartmentType)) },
          ]}
        >
          <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "UserProfile" as any,
              params: { userId: apt.Creator_ID },
            })
          }
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
        <View
          style={styles.cardContent}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setWidth(width);
          }}
        >
          <ApartmentGallery images={apt.Images} width={width} />

          <TouchableOpacity
            onPress={() => {
              setSelectedApartment(apt);
              setShowApartmentDetails(true);
            }}
          >
            <View style={styles.details}>
              <Text style={styles.title}>
                {typeof apt.Location === "string"
                  ? apt.Location.replace(/^{"address":\s*"([^"]+)"}$/, "$1")
                  : apt.Location}
              </Text>
              <Text style={styles.description}>{apt.Description}</Text>
              <Text style={styles.price}>{apt.Price} ש"ח</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!props.hideIcons && (
          <View style={styles.iconRow}>
            <TouchableOpacity>
              {/*   <LikeButton
                apartmentId={apt.ApartmentID}
                numOfLikes={apt.LikeCount || apt.NumOfLikes || 0}
                isLikedByUser={apt.IsLikedByUser === true || apt.IsLikedByUser === 1}
              /> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShareApartment(apt)}>
              <MaterialCommunityIcons
                name="share-outline"
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            <OpenHouseButton
              apartmentId={apt.ApartmentID}
              userId={loginUserId ?? 0}
              location={typeof apt.Location === "string" ? apt.Location : ""}
              userOwnerId={apt.UserID ?? apt.Creator_ID ?? 0}
            />
          </View>
        )}
      </View>
    ));
  };

  const SearchApartments = (filters?: FiltersJson): void => {
    if (!Array.isArray(allApartments)) return;

    const newAptArr = (allApartments || []).filter((apt): boolean => {
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
          aptLocationObj = JSON.parse(apt.Location) as {
            address?: string;
            latitude?: number | null;
            longitude?: number | null;
          };
        } catch (e) {
          console.warn("Invalid JSON in apt.Location:", apt.Location);
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

      let matchesFilters = true;

      if (filters) {
        if (filters.entryDate && filters.exitDate) {
          const entry = new Date(filters.entryDate);
          const exit = new Date(filters.exitDate);
          const aptEntry = apt.EntryDate ? new Date(apt.EntryDate) : null;
          const aptExit = apt.ExitDate ? new Date(apt.ExitDate) : null;

          const isAvailable =
            (!aptEntry || aptEntry <= entry) && (!aptExit || aptExit >= exit);

          if (!isAvailable) return false;
        }

        const gender = filters.gender;
        if (gender && gender !== "אין העדפה") {
          const genderCode = gender === "רק גברים" ? "Male" : "Female";
          if (apt.ApartmentType === 1 && apt.Roommates) {
            const roommates = apt.Roommates.split("||");
            const allMatch = roommates.every((r) =>
              r.includes(`Gender: ${genderCode}`)
            );
            if (!allMatch) return false;
          }
        }

        const generalFilters = filters.filters || [];
        for (const f of generalFilters) {
          if (f === "מאפשרים חיות מחמד" && apt.AllowPet === false) return false;
          if (f === "מותר לעשן" && apt.AllowSmoking === false) return false;
          if (f === "חצר / מרפסת" && apt.GardenBalcony === false) return false;
          if (
            f === "חניה" &&
            (!apt.ParkingSpace ||
              (typeof apt.ParkingSpace === "number"
                ? apt.ParkingSpace
                : parseInt(String(apt.ParkingSpace))) <= 0)
          )
            return false;
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
            } catch (e) {
              continue;
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
            for (const icon of icons) {
              if (!labelValues.includes(icon)) return false;
            }
          } catch (e) {
            return false;
          }
        }
      }

      return matchesType && matchesPrice && matchesLocation && matchesFilters;
    });

    setPreviewSearchApt(newAptArr);
    setIndex(false);
  };

  function normalizeString(str: string | undefined | null): string {
    if (!str) return "";
    return str.replace(/[\s\-–"׳"]/g, "").toLowerCase();
  }

  function extractCityFromAddress(address: string): string {
    if (!address) return "";
    const parts = address.split(",");
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
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
    const R = 6371; // radius of Earth in km
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

  return (
    <>
    <View style={{top: 50}}>
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
        showAllApartments={() => {
          setPreviewSearchApt(allApartments);
        }}
      />
      <ScrollView>
        <View style={styles.container}>{renderApartments()}</View>
      </ScrollView>

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
 card: {
    alignSelf: "center",
    width: windowWidth - 40,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    borderWidth: 3,
    borderColor: "#fff",

    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardContent: {
    // Container for apartment content
  },
  details: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "right",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "right",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    textTransform: "uppercase",
  },
  typeLabel: {
    position: "absolute",
    zIndex: 2,
    top: 12,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: "flex-start",
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
