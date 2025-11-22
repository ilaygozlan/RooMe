// components/apartment/apartmentCard.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import PhotoCollage from "@/components/apartment/PhotoCollage";
import BoostButton from "@/components/apartment/boostBtn";
import OpenHouseButton from "@/components/apartment/openHouseButton";
import SaveButton from "@/components/apartment/saveApartmentBtn";

import { type Apartment } from "@/context/ApartmentsContext";
import { ENV } from "@/src/config/env";

// ===== Types =====
type ApartmentCardProps = {
  apartment: Apartment;
  hideIcons?: boolean;
  onPress?: (apartment: Apartment) => void;
  onShare?: (apartment: Apartment) => void;
};

// ===== Utils =====
const windowWidth = Dimensions.get("window").width;

export const hexToRgba = (hex: string, alpha: number = 0.5): string => {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3)
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  if (cleanHex.length !== 6) throw new Error(`Invalid HEX color: ${hex}`);
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function locationToAddress(loc: string | any): string {
  if (typeof loc === "string") {
    const m = loc.match(/"address"\s*:\s*"([^"]+)"/);
    if (m) return m[1];
    return loc;
  }
  return loc?.address ?? "מיקום לא זמין";
}

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
      return "השכרה";
    case 1:
      return "דירת שותפים";
    case 2:
      return "סבלט";
    default:
      return "Unknown";
  }
};

/**
 * Normalize images prop to PhotoCollage format
 * Handles CSV strings, arrays, and converts relative URLs to absolute
 */
const normalizeImages = (
  images?: string[] | string
): Array<{ uri: string; id?: string }> => {
  if (!images) return [];

  const baseUrl = ENV.apiBaseUrl;
  const asArray: string[] =
    typeof images === "string"
      ? images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(images)
      ? images
      : [];

  return asArray
    .map((img, index) => {
      const trimmed = (img ?? "").trim();
      if (!trimmed) return null;

      // If already absolute https URL
      if (trimmed.startsWith("https")) {
        return { uri: trimmed, id: String(index) };
      }

      // Convert relative URL to absolute
      const needsSlash = trimmed.startsWith("/") ? "" : "/";
      return { uri: `${baseUrl}${needsSlash}${trimmed}`, id: String(index) };
    })
    .filter((img): img is { uri: string; id?: string } => img !== null);
};

// ===== Component =====
export default function ApartmentCard({
  apartment: apt,
  hideIcons = false,
  onPress,
  onShare,
}: ApartmentCardProps) {
  const router = useRouter();

  const handleCreatorPress = () => {
    const openUser = (globalThis as any)?.__openUserProfile__;
    if (typeof openUser === "function") {
      openUser(1); //creator id
    } else {
      router.push({
        pathname: "UserProfile" as any,
        params: { userId: apt.Creator_ID },
      });
    }
  };

  const handleShareApartment = async (apt: Apartment): Promise<void> => {
    if (onShare) {
      onShare(apt);
      return;
    }

    const message = `דירה שווה שמצאתי באפליקציה:\n\nמיקום: ${locationToAddress(
      apt.Location
    )}\nמחיר: ${apt.Price} ש"ח\n\n${apt.Description}`;
    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(apt);
    }
  };

  return (
    <View
      key={apt.ApartmentID}
      style={[styles.card, { shadowColor: getBorderColor(apt.ApartmentType) }]}
    >
      <View
        style={[
          styles.typeLabel,
          { backgroundColor: hexToRgba(getBorderColor(apt.ApartmentType)) },
        ]}
      >
        <Text style={styles.typeText}>{getTypeName(apt.ApartmentType)}</Text>
      </View>

      <TouchableOpacity onPress={handleCreatorPress}>
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

      <View style={styles.cardContent}>
        <PhotoCollage
          images={normalizeImages(apt.Images)}
          onImagePress={handleCardPress}
        />

        <TouchableOpacity onPress={handleCardPress}>
          <View style={styles.details}>
            <Text style={styles.title}>{locationToAddress(apt.Location)}</Text>
            <Text style={styles.description}>{apt.Description}</Text>
            <Text style={styles.price}>{apt.Price} ש"ח</Text>
          </View>
        </TouchableOpacity>
      </View>

      {!hideIcons && (
        <View style={styles.iconRow}>
          <BoostButton
            apartmentId={apt.ApartmentID}
            isBoostedByUser={/* apt.IsBoostedByUser */ false}
            numOfBoosts={/* apt.NumOfBoosts */ 0}
          />
          <TouchableOpacity onPress={() => handleShareApartment(apt)}>
            <MaterialCommunityIcons
              name="share-outline"
              size={26}
              color="gray"
            />
          </TouchableOpacity>
          <OpenHouseButton
            apartmentId={apt.ApartmentID}
            userId={0}
            location={typeof apt.Location === "string" ? apt.Location : ""}
            userOwnerId={apt.Creator_ID ?? 0}
          />
          <SaveButton
            apartmentId={apt.ApartmentID}
            isSavedByUser={/* apt.IsSavedByUser */ false} // boolean
            numOfSaves={/* apt.NumOfSaves ?? */ 0} // optional
            showCount={false}
            apartment={apt}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color:"#f97e20ff",
    fontWeight: "bold",
    fontSize: 17,
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
