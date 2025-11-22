import ApartmentGallery from "@/components/apartment/apartmentGallery";
import ExtraDetails from "@/components/apartment/extraApartmentDetails";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../config";

import { useTheme } from "@/lib/ui/ThemeProvider";
import { labelToIcon } from "@/utils/labelIcons";
import { labelTranslations } from "@/utils/labelTranslations";
import { fetchNearbyPlaces, getDefaultAmenities, type NearbyPlace } from "@/utils/nearbyPlaces";
// ------------------ Types ------------------

type LabelItem = { value?: string } | string;

export type Apartment = {
  ApartmentID: number;
  Creator_ID: number;
  Creator_FullName: string;
  Creator_ProfilePicture: string;
  Images: string[];
  ApartmentType: 0 | 1 | 2; // 0=rental, 1=shared, 2=sublet
  Location: string;
  Price: number;
  Description: string;
  AmountOfRooms: number;
  AllowPet: boolean;
  AllowSmoking: boolean;
  ParkingSpace: number;
  EntryDate: string;
  ExitDate: string | null;
  Rental_ContractLength: number | null;
  Rental_ExtensionPossible: boolean;
  Shared_NumberOfRoommates: number | null;
  Roommates: string;
  Sublet_CanCancelWithoutPenalty: boolean;
  Sublet_IsWholeProperty: boolean;
  LabelsJson: string;
  NumOfLikes: number;
  IsLikedByUser: boolean;
};

type Props = {
  apt: Apartment;
  onClose: () => void;
};

// ------------------ Constants ------------------

const { width } = Dimensions.get("window");

// ------------------ Component ------------------

export default function ApartmentDetails({ apt, onClose }: Props) {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView | null>(null);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(width);
  const [nearbyAmenities, setNearbyAmenities] = useState<NearbyPlace[]>(
    getDefaultAmenities()
  );
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const aptLocation = JSON.parse(apt?.Location?.trim());

  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);

  useEffect(() => {
    async function load() {
      setLoadingAmenities(true);
      const res = await fetchNearbyPlaces(
        aptLocation.latitude,
        aptLocation.longitude,
        "AIzaSyCGucSUapSIUa_ykXy0K8tl6XR-ITXRj3o"
      );
      setNearbyPlaces(res);
      if (res.length === 0 || res === undefined) {
        setLoadingAmenities(true);
      } else {
        setLoadingAmenities(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    console.log("APT CHANGED:", apt.ApartmentID);
  }, [apt.ApartmentID]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!apt.Creator_ID) return;
        const res = await fetch(`${API}User/GetUserById/${apt.Creator_ID}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUserInfo();
  }, [apt.Creator_ID]);

  useEffect(() => {
    // Keep original auto-advance logic for “Shared” apartments
    const interval = setInterval(() => {
      if (carouselRef.current && apt.ApartmentType === 1 && apt.Roommates) {
        // NOTE: parseRoommates is assumed to exist in your codebase as before.
        // We keep the call here to preserve original logic.
        // @ts-ignore
        const roommates = parseRoommates(apt.Roommates);
        if (!roommates || roommates.length === 0) return;
        const nextIndex = (activeSlide + 1) % roommates.length;
        carouselRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setActiveSlide(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide, apt.ApartmentType, apt.Roommates]);

  // Parse location data first (before useEffect that uses it)
  const locationData = (() => {
    try {
      const locationStr = apt?.Location?.trim();
      if (locationStr?.startsWith("{") && locationStr?.endsWith("}")) {
        const parsed = JSON.parse(locationStr) as {
          address?: string;
          latitude?: number;
          longitude?: number;
        };
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn("שגיאה בפענוח מיקום:", err);
      return null;
    }
  })();

  const getTypeName = (type: Apartment["ApartmentType"]): string => {
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

  const getApartmentLabels = (): string[] => {
    if (!apt.LabelsJson) return [];
    try {
      let fixedJson = apt.LabelsJson.trim();
      if (!fixedJson.startsWith("[")) {
        fixedJson = `[${fixedJson}]`;
      }
      const parsed = JSON.parse(fixedJson) as LabelItem[];
      return parsed
        .map((item) =>
          typeof item === "string"
            ? item.toLowerCase()
            : item.value?.toLowerCase()
        )
        .filter((v): v is string => !!v && !!labelToIcon[v]);
    } catch (e) {
      console.error("Error parsing LabelsJson:", e);
      return [];
    }
  };

  const renderApartmentLabels = () => {
    const labels = getApartmentLabels();
    if (labels.length === 0) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>מאפייני דירה</Text>
        <View style={styles.labelsWrap}>
          {labels.map((label, idx) => (
            <View key={`${label}-${idx}`} style={styles.pill}>
              {React.cloneElement(labelToIcon[label], {
                size: 18,
                color: "#E3965A",
              } as any)}
              <Text style={styles.pillText}>
                {labelTranslations[label] || label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const resolvedAddress = (() => {
    try {
      return locationData?.address || apt?.Location?.trim() || "כתובת לא זמינה";
    } catch (err) {
      console.warn("שגיאה בפענוח כתובת:", err);
      return "כתובת לא זמינה";
    }
  })();

  const mapRegion: Region | null =
    locationData?.latitude && locationData?.longitude
      ? {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : null;

  const handleViewLargerMap = () => {
    if (locationData?.latitude && locationData?.longitude) {
      // Open in Google Maps
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationData.latitude},${locationData.longitude}`;
      Linking.openURL(googleMapsUrl).catch((err) => {
        console.error("Error opening Google Maps:", err);
        // Fallback to native maps
        const url = Platform.select({
          ios: `maps://maps.apple.com/?q=${locationData.latitude},${locationData.longitude}`,
          android: `geo:${locationData.latitude},${locationData.longitude}?q=${locationData.latitude},${locationData.longitude}`,
        });
        if (url) {
          Linking.openURL(url).catch((e) =>
            console.error("Error opening maps:", e)
          );
        }
      });
    }
  };

  return (
    <View>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View
            style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.iconBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.headerMeta}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {getTypeName(apt.ApartmentType)}
                  </Text>
                </View>
                <View style={styles.likeRow}>
                  <MaterialIcons
                    name={apt.IsLikedByUser ? "favorite" : "favorite-border"}
                    size={18}
                    color={apt.IsLikedByUser ? "#E3965A" : "#94A3B8"}
                  />
                  <Text style={styles.likeText}>{apt.NumOfLikes || 0}</Text>
                </View>
              </View>
            </View>

            {/* Gallery with overlay header */}
            <View style={styles.galleryWrap}>
              <ApartmentGallery
                images={apt.Images || []}
                width={(containerWidth || width) - 32}
              />
              <View style={styles.overlayRow}>
                <View style={styles.pricePill}>
                  <MaterialIcons
                    name="attach-money"
                    size={18}
                    color="#0F172A"
                  />
                  <Text style={styles.pricePillText}>{apt.Price} ש"ח</Text>
                </View>
                <View style={styles.roomsPill}>
                  <MaterialIcons
                    name="meeting-room"
                    size={18}
                    color="#0F172A"
                  />
                  <Text style={styles.roomsPillText}>
                    {apt.AmountOfRooms} חדרים
                  </Text>
                </View>
              </View>
            </View>

            {/* Title & Address */}
            <View style={styles.titleCard}>
              <Text style={styles.address}>{resolvedAddress}</Text>
              {!!apt.Description && (
                <Text style={styles.desc} numberOfLines={4}>
                  {apt.Description}
                </Text>
              )}
            </View>

            {/* Location & Map */}
            {mapRegion && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>מיקום וסביבה</Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={mapRegion}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: mapRegion.latitude,
                        longitude: mapRegion.longitude,
                      }}
                      pinColor="#E3965A"
                    />
                  </MapView>
                  <View style={styles.mapOverlay}>
                    <View style={styles.mapAddressCard}>
                      <Text style={styles.mapAddressTitle}>
                        {resolvedAddress.split(",")[0]}
                      </Text>
                      <Text style={styles.mapAddressSub}>
                        {resolvedAddress}
                      </Text>
                      <TouchableOpacity
                        onPress={handleViewLargerMap}
                        style={styles.mapLink}
                      >
                        <Text style={styles.mapLinkText}>צפה במפה גדולה</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Nearby Amenities */}
                <View style={styles.amenitiesContainer}>
                  {loadingAmenities ? (
                    <Text
                      style={[styles.loadingText, { color: palette.textMuted }]}
                    >
                      טוען מידע על הסביבה...
                    </Text>
                  ) : (
                    nearbyPlaces.map((amenity) => (
                      <NearbyAmenity
                        key={amenity.type}
                        icon={amenity.icon}
                        label={amenity.label}
                        time={`${amenity.walkingTime} הליכה`}
                      />
                    ))
                  )}
                </View>
              </View>
            )}

            {/* Quick facts grid */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>עובדות מהירות</Text>
              <View style={styles.grid}>
                <InfoItem
                  icon="event-available"
                  label="כניסה"
                  value={apt.EntryDate?.split("T")[0] || "—"}
                />
                {apt.ExitDate ? (
                  <InfoItem
                    icon="event-busy"
                    label="יציאה"
                    value={apt.ExitDate?.split("T")[0] || "—"}
                  />
                ) : (
                  <InfoItem icon="event-busy" label="יציאה" value="—" />
                )}
                <InfoItem
                  icon="pets"
                  label="חיות מחמד"
                  value={apt.AllowPet ? "מותר" : "אסור"}
                  dim={!apt.AllowPet}
                />
                <InfoItem
                  icon="smoking-rooms"
                  label="עישון"
                  value={apt.AllowSmoking ? "מותר" : "אסור"}
                  dim={!apt.AllowSmoking}
                />
                <InfoItem
                  icon="local-parking"
                  label="חניה"
                  value={String(apt.ParkingSpace || 0)}
                  dim={Number(apt.ParkingSpace) <= 0}
                />
                <InfoItem
                  icon="home-work"
                  label="סוג דירה"
                  value={getTypeName(apt.ApartmentType)}
                />
              </View>
            </View>

            {/* Labels (pills) */}
            {renderApartmentLabels()}

            {/* Uploader */}
            <TouchableOpacity /* keep original optional navigation commented if needed */
            /* onPress={() => {
                router.push({
                  pathname: "UserProfile",
                  params: { userId: apt.Creator_ID as any },
                });
                onClose();
              }} */
            >
              <View style={styles.uploaderCard}>
                <Image
                  source={{
                    uri:
                      apt.Creator_ProfilePicture ||
                      "https://example.com/default-profile.png",
                  }}
                  style={styles.uploaderAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploaderName}>
                    {apt.Creator_FullName}
                  </Text>
                  <Text style={styles.uploaderSub}>
                    מעלה המודעה · מזהה #{apt.ApartmentID}
                  </Text>
                </View>
                <MaterialIcons name="chevron-left" size={22} color="#94A3B8" />
              </View>
            </TouchableOpacity>

            {/* Extra details (kept intact) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>פרטים נוספים</Text>
              <ExtraDetails
                apt={
                  {
                    ...apt,
                    Rental_ContractLength:
                      apt.Rental_ContractLength ?? undefined,
                    Shared_NumberOfRoommates:
                      apt.Shared_NumberOfRoommates ?? undefined,
                  } as any
                }
              />
            </View>

            <View style={{ height: 24 }} />
          </View>
        }
      />
    </View>
  );
}

/** ---------- Nearby Amenity Component ---------- */
function NearbyAmenity({
  icon,
  label,
  time,
}: {
  icon: string;
  label: string;
  time: string;
}) {
  const getIcon = () => {
    switch (icon) {
      case "school":
        return <Ionicons name="school" size={20} color="#E3965A" />;
      case "cart":
        return <Ionicons name="cart" size={20} color="#E3965A" />;
      case "beer":
        return <Ionicons name="beer" size={20} color="#E3965A" />;
      case "barbell":
        return <Ionicons name="barbell" size={20} color="#E3965A" />;
      default:
        return <Ionicons name="location" size={20} color="#E3965A" />;
    }
  };

  return (
    <View style={styles.amenityItem}>
      {getIcon()}
      <View style={styles.amenityTextContainer}>
        <Text style={styles.amenityLabel}>{label}</Text>
        <Text style={styles.amenityTime}>{time}</Text>
      </View>
    </View>
  );
}

/** ---------- Small presentational sub-component to keep main JSX clean ---------- */
function InfoItem({
  icon,
  label,
  value,
  dim,
}: {
  icon:
    | "event-available"
    | "event-busy"
    | "pets"
    | "smoking-rooms"
    | "local-parking"
    | "home-work";
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <View style={[styles.infoCell, dim && styles.infoCellDim]}>
      <MaterialIcons
        name={icon}
        size={18}
        color={dim ? "#CBD5E1" : "#E3965A"}
        style={{ marginLeft: 6 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ------------------ Styles ------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#F5F7FA",
  },

  /* Header */
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFF3EA",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  typeBadgeText: {
    color: "#C56E36",
    fontWeight: "700",
    fontSize: 12,
  },
  likeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  likeText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Gallery + Overlays */
  galleryWrap: {
    position: "relative",
    marginBottom: 12,
  },
  overlayRow: {
    position: "absolute",
    bottom: 10,
    right: 10,
    left: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  pricePill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pricePillText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 14,
  },
  roomsPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roomsPillText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Title / Address */
  titleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  address: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  desc: {
    marginTop: 8,
    color: "#475569",
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: "right",
  },

  /* Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 10,
  },

  /* Quick facts grid */
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCell: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  infoCellDim: {
    opacity: 0.7,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
  },

  /* Labels pills */
  labelsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFF8F2",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  pillText: {
    color: "#7C3E18",
    fontSize: 12.5,
    fontWeight: "700",
  },

  /* Uploader */
  uploaderCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  uploaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  uploaderName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  uploaderSub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },

  /* Map Section */
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    left: 10,
  },
  mapAddressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapAddressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 4,
  },
  mapAddressSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
    marginBottom: 8,
  },
  mapLink: {
    alignSelf: "flex-start",
  },
  mapLinkText: {
    fontSize: 13,
    color: "#E3965A",
    fontWeight: "600",
    textAlign: "right",
  },

  /* Nearby Amenities */
  amenitiesContainer: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF8F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE3D1",
  },
  amenityTextContainer: {
    flex: 1,
  },
  amenityLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    marginBottom: 2,
  },
  amenityTime: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
  },
});
