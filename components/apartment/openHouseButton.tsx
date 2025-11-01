import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
//import * as Calendar from "expo-calendar";
import API from "../config";
//import { sendPushNotification } from "./pushNatification";

// -------- Types --------
type Props = {
  apartmentId: number | string;
  userId: number | string;
  /** כתובת להצגה בכרטיס (אם ה-API מחזיר מיקום באייטם ישי עדיפות אליו) */
  location: string;
  /** בעל הדירה */
  userOwnerId: number | string;
};

/** שרת מחזיר לעיתים שמות שדות לא עקביים – מכסים את כולם */
type OpenHouseApiItem = {
  OpenHouseID: number;
  Date: string; // ISO
  StartTime: string; // "HH:mm" או "HH:mm:ss"
  EndTime: string;
  Location?: string; // לעיתים JSON-string עם { address }
  // קיבולת/רשומים – מופיעים בשמות שונים:
  AmountOfPeople?: number;
  amountOfPeoples?: number; // גרסה אחרת
  TotalRegistrations?: number;
  confirmedPeoples?: number; // לעיתים
  // האם המשתמש רשום
  IsRegistered?: boolean;
  // יתכנו שדות נוספים שלא קריטיים כאן
  [k: string]: any;
};

type NormalizedOpenHouse = {
  OpenHouseID: number;
  Date: string; // ISO
  StartTime: string;
  EndTime: string;
  LocationAddress?: string; // מחרוזת נקייה לכתובת
  AmountOfPeople: number;
  TotalRegistrations: number;
  IsRegistered: boolean;
  raw: OpenHouseApiItem;
};

// -------- Helpers --------
const parseLocationAddress = (loc?: string): string | undefined => {
  if (!loc) return undefined;
  const trimmed = loc.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const obj = JSON.parse(trimmed) as { address?: string };
      return obj.address ?? undefined;
    } catch {
      return undefined;
    }
  }
  // אם זה כבר כתובת טקסטואלית
  return trimmed;
};

const normalizeOpenHouse = (item: OpenHouseApiItem): NormalizedOpenHouse => {
  const AmountOfPeople =
    item.AmountOfPeople ??
    item.amountOfPeoples ??
    0;

  const TotalRegistrations =
    item.TotalRegistrations ??
    item.confirmedPeoples ??
    0;

  return {
    OpenHouseID: item.OpenHouseID,
    Date: item.Date,
    StartTime: item.StartTime,
    EndTime: item.EndTime,
    LocationAddress: parseLocationAddress(item.Location),
    AmountOfPeople,
    TotalRegistrations,
    IsRegistered: !!item.IsRegistered,
    raw: item,
  };
};

const toLocalDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("he-IL");

// -------- Component --------
export default function OpenHouseButton({
  apartmentId,
  userId,
  location,
  userOwnerId,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [openHouses, setOpenHouses] = useState<NormalizedOpenHouse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modalVisible) void fetchOpenHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  const fetchOpenHouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}OpenHouse/GetOpenHousesByApartment/${apartmentId}/${userId}`
      );

      if (res.status === 404) {
        setOpenHouses([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch open houses");

      const data = (await res.json()) as OpenHouseApiItem[] | OpenHouseApiItem;
      const arr: OpenHouseApiItem[] = Array.isArray(data) ? data : [data];
      const normalized = arr.map(normalizeOpenHouse);
      setOpenHouses(normalized);
    } catch (err: any) {
      console.error("Error fetching open houses:", err?.message ?? err);
      setOpenHouses([]);
    } finally {
      setLoading(false);
    }
  }, [apartmentId, userId]);

  // ---- Calendar flow ----
  const offerToSyncWithCalendar = (oh: NormalizedOpenHouse) => {
    Alert.alert(
      "נרשמת בהצלחה לבית פתוח",
      "האם תרצה להוסיף את הסיור ליומן שלך?",
      [
        { text: "לא תודה", style: "cancel" },
        {
          text: "כן, הוסף ליומן",
          onPress: () => void addToCalendar(oh),
        },
      ]
    );
  };

  const addToCalendar = async (oh: NormalizedOpenHouse) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("הרשאה נדרשת", "יש לאשר גישה ליומן כדי להוסיף את האירוע");
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => (cal as any).isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("שגיאה", "לא נמצא יומן ברירת מחדל");
        return;
      }

      const dateOnly = oh.Date.split("T")[0]; // ISO YYYY-MM-DD
      const startDate = new Date(`${dateOnly}T${oh.StartTime}`);
      const endDate = new Date(`${dateOnly}T${oh.EndTime}`);

      const address =
        oh.LocationAddress ?? location ?? "בית פתוח (ללא כתובת זמינה)";

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `בית פתוח - ${address}`,
        startDate,
        endDate,
        timeZone: "Asia/Jerusalem",
        location: address,
        notes: `בית פתוח שנרשמת אליו. מספר משתתפים: ${oh.TotalRegistrations}/${oh.AmountOfPeople}`,
        alarms: [{ relativeOffset: -60 }], // תזכורת שעה לפני
      });

      if (eventId) {
        Alert.alert("הצלחה", "האירוע נוסף ליומן בהצלחה!");
      }
    } catch (err) {
      console.error("Error adding to calendar:", err);
      Alert.alert("שגיאה", "שגיאה בהוספת האירוע ליומן");
    }
  };

  // ---- Actions ----
  const registerForOpenHouse = async (oh: NormalizedOpenHouse) => {
    if (String(userOwnerId) === String(userId)) {
      Alert.alert("שגיאה", "לא ניתן להירשם לבית פתוח שלך");
      return;
    }
    try {
      const res = await fetch(`${API}OpenHouse/RegisterForOpenHouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openHouseID: oh.OpenHouseID,
          userID: userId,
          confirmed: 0,
        }),
      });

      if (res.ok) {
        offerToSyncWithCalendar(oh);

        // הבא טוקן התראות של בעל הדירה ושלח התראה
        const tokenRes = await fetch(`${API}User/GetPushToken/${userOwnerId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (tokenRes.ok) {
          const result = (await tokenRes.json()) as { pushToken?: string };
          const ownerPushToken = result.pushToken;
          if (ownerPushToken) {
            await sendPushNotification(ownerPushToken);
          } else {
            console.warn("No push token for owner");
          }
        } else {
          console.error("Failed to fetch owner push token");
        }

        await fetchOpenHouses();
      } else if (res.status === 409) {
        Alert.alert("כבר נרשמת לבית הפתוח", "כבר קיימת הרשמה פעילה.");
      } else {
        Alert.alert("שגיאה", "שגיאה בהרשמה לבית פתוח");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("שגיאת רשת", "שגיאה בהתחברות לשרת");
    }
  };

  const cancelRegistration = async (openHouseId: number) => {
    try {
      const res = await fetch(
        `${API}OpenHouse/DeleteRegistration/${openHouseId}/${userId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        Alert.alert("ההרשמה בוטלה", "ביטלת את ההרשמה לסיור.");
        await fetchOpenHouses();
      } else {
        Alert.alert("שגיאה", "לא ניתן לבטל את ההרשמה.");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      Alert.alert("שגיאת תקשורת", "לא ניתן להתחבר לשרת.");
    }
  };

  // ---- Renderers ----
  const renderItem = ({ item }: { item: NormalizedOpenHouse }) => {
    const isFull = item.TotalRegistrations >= item.AmountOfPeople;
    const address = item.LocationAddress ?? location;

    return (
      <View style={styles.openHouseItem}>
        <Text style={styles.openHouseText}>
          {toLocalDateLabel(item.Date)} - {item.StartTime} - {item.EndTime}
        </Text>
        <Text style={styles.openHouseLocation}>{address}</Text>
        <Text style={styles.openHouseLocation}>
          נרשמו: {item.TotalRegistrations} / {item.AmountOfPeople}
        </Text>

        {item.IsRegistered ? (
          <>
            <Text style={styles.statusConfirmed}>✔ רשום לסיור</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelRegistration(item.OpenHouseID)}
            >
              <Text style={styles.cancelText}>בטל רישום</Text>
            </TouchableOpacity>
          </>
        ) : isFull ? (
          <Text style={styles.fullMessage}>הסיור מלא</Text>
        ) : (
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => registerForOpenHouse(item)}
          >
            <Text style={styles.registerText}>להרשמה</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="calendar-outline" size={24} color="gray" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🏡 סיורים בדירה</Text>

            {loading ? (
              <ActivityIndicator size="small" />
            ) : openHouses.length > 0 ? (
              <FlatList
                data={openHouses}
                keyExtractor={(it) => String(it.OpenHouseID)}
                renderItem={renderItem}
                contentContainerStyle={{ gap: 8 }}
              />
            ) : (
              <Text style={styles.noOpenHouses}>אין סיורים זמינים</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// === styles ===
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContainer: {
    width: 350,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  openHouseItem: {
    backgroundColor: "#F4B982",
    padding: 10,
    borderRadius: 8,
  },
  openHouseText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  openHouseLocation: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  registerButton: {
    backgroundColor: "#E3965A",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  registerText: {
    color: "white",
    fontWeight: "bold",
  },
  noOpenHouses: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  statusConfirmed: {
    color: "green",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  fullMessage: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
});
