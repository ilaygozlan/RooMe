import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

export async function normalizeFileForFormData(uri: string) {
  try {
    if (Platform.OS === "android" && uri.startsWith("content://")) {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return uri;
      return info.uri;
    }
    return uri;
  } catch {
    return uri;
  }
}

export function massageApartmentForList(
  apartmentData: any,
  newApartmentId: number,
  loginUserId: number,
  userProfile: any,
  hasImages: boolean,
  imageLinks: string[] = []
) {
  return {
    ...apartmentData,
    ApartmentID: newApartmentId,
    UserID: loginUserId,
    Images: hasImages ? imageLinks.join(",") : "",
    Price: String(apartmentData.price ?? apartmentData.Price ?? ""),
    Description: apartmentData.description ?? "",
    Location: (() => {
      try {
        const parsed = JSON.parse(apartmentData.location);
        return parsed.address ?? "מיקום לא זמין";
      } catch {
        return "מיקום לא זמין";
      }
    })(),
    ApartmentType: apartmentData.apartmentType,
    IsLikedByUser: false,
    Creator_ID: loginUserId,
    Creator_FullName: userProfile?.fullName ?? "",
    Creator_ProfilePicture: userProfile?.profilePicture ?? "",
    Creator_Token: "",
  };
}