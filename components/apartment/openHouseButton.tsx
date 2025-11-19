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

// -------- Mock Config --------

// Toggle this to false when backend is ready
const USE_MOCK_OPEN_HOUSES = true;

/** Mock data in the SAME shape the API would return */
const MOCK_OPEN_HOUSES_API: OpenHouseApiItem[] = [
  {
    OpenHouseID: 1,
    Date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // מחר
    StartTime: "18:00",
    EndTime: "19:00",
    Location: JSON.stringify({ address: "דיזנגוף 100, תל אביב" }),
    AmountOfPeople: 5,
    TotalRegistrations: 2,
    IsRegistered: false,
  },
  {
    OpenHouseID: 2,
    Date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // עוד 3 ימים
    StartTime: "20:30",
    EndTime: "21:15",
    Location: JSON.stringify({ address: "בן יהודה 50, תל אביב" }),
    AmountOfPeople: 8,
    TotalRegistrations: 8, // מלא
    IsRegistered: false,
  },
  {
    OpenHouseID: 3,
    Date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // עוד 5 ימים
    StartTime: "10:00",
    EndTime: "11:00",
    Location: "אבן גבירול 120, תל אביב", // כתובת פשוטה
    AmountOfPeople: 4,
    TotalRegistrations: 1,
    IsRegistered: true, // המשתמש "רשום" לסיור הזה
  },
];

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
  const AmountOfPeople = item.AmountOfPeople ?? item.amountOfPeoples ?? 0;

  const TotalRegistrations =
    item.TotalRegistrations ?? item.confirmedPeoples ?? 0;

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

      // ---------- MOCK PATH ----------
      if (USE_MOCK_OPEN_HOUSES) {
        const normalized = MOCK_OPEN_HOUSES_API.map(normalizeOpenHouse);
        setOpenHouses(normalized);
        return;
      }
      // ---------- REAL API PATH (מקורי) ----------

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

    const statusLabel = item.IsRegistered
      ? "רשום לסיור"
      : isFull
      ? "הסיור מלא"
      : "פנוי";

    const statusStyle = item.IsRegistered
      ? styles.statusChipRegistered
      : isFull
      ? styles.statusChipFull
      : styles.statusChipAvailable;

    return (
      <View style={styles.openHouseCard}>
        {/* Header: date + time + status chip */}
        <View style={styles.cardHeader}>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={18}
              style={styles.rowIcon}
            />
            <View style={styles.dateTimeRow}>
              <Text style={styles.timeText}>
                {item.StartTime} - {item.EndTime}
              </Text>
              <Text style={styles.dateText}>{toLocalDateLabel(item.Date)}</Text>
            </View>
          </View>

          <View style={[styles.statusChipBase, statusStyle]}>
            <Text style={styles.statusChipText}>{statusLabel}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={18}
            style={styles.rowIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {address}
          </Text>
        </View>

        {/* Capacity */}
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="account-multiple-outline"
            size={18}
            style={styles.rowIcon}
          />
          <Text style={styles.capacityText}>
            נרשמו:{" "}
            <Text style={styles.capacityStrong}>{item.TotalRegistrations}</Text>{" "}
            / {item.AmountOfPeople}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {item.IsRegistered && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>אתה רשום לסיור הזה</Text>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                style={styles.infoPillIcon}
              />
            </View>
          )}

          {item.IsRegistered ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => cancelRegistration(item.OpenHouseID)}
            >
              <Text style={styles.secondaryButtonText}>בטל רישום</Text>
            </TouchableOpacity>
          ) : isFull ? (
            <View style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>הסיור מלא</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => registerForOpenHouse(item)}
            >
              <Text style={styles.primaryButtonText}>להרשמה</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View>
      {/* Trigger button – RTL pill with icon + label */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.triggerButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons
          name="calendar-outline"
          size={18}
          color="#FF8A3D"
        />
        <Text style={styles.triggerButtonText}>סיור בדירה</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialCommunityIcons
                  name="home-search-outline"
                  size={22}
                  color="#111827"
                />
                <Text style={styles.modalTitle}>סיורים בדירה</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeIconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FF8A3D" />
                <Text style={styles.loadingText}>טוען סיורים...</Text>
              </View>
            ) : openHouses.length > 0 ? (
              <FlatList
                data={openHouses}
                keyExtractor={(it) => String(it.OpenHouseID)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-remove-outline"
                  size={32}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyTitle}>אין סיורים זמינים</Text>
                <Text style={styles.emptySubtitle}>
                  ברגע שבעל הדירה יפתח בית פתוח – תוכל לראות אותו כאן ולהירשם.
                </Text>
              </View>
            )}

            {/* Footer action */}
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.footerButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// === styles ===
const styles = StyleSheet.create({
  // ---- Trigger ----
  triggerButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFF5EC",
    borderWidth: 1,
    borderColor: "#FFD0A3",
  },
  triggerButtonText: {
    marginRight: 6,
    fontSize: 13,
    color: "#FF8A3D",
    fontWeight: "600",
    textAlign: "right",
  },

  // ---- Modal ----
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  modalContainer: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    paddingEnd: 5,
  },
  modalTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
    textAlign: "right",
  },
  closeIconButton: {
    padding: 6,
    borderRadius: 999,
  },

  // ---- List / content ----
  listContent: {
    paddingVertical: 8,
    paddingBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
  },

  footerButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFF1E5",
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF8A3D",
    textAlign: "center",
  },

  // ---- Card ----
  openHouseCard: {
    backgroundColor: "#FFF7F0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFE1C2",
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  rowIcon: {
    marginLeft: 6,
    color: "#6B7280",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
    paddingStart: 15,
  },
  timeText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
  },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
    textAlign: "right",
  },
  capacityText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "right",
  },
  capacityStrong: {
    fontWeight: "600",
    color: "#111827",
  },

  // ---- Status chip ----
  statusChipBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  statusChipRegistered: {
    backgroundColor: "#DCFCE7",
  },
  statusChipFull: {
    backgroundColor: "#FEE2E2",
  },
  statusChipAvailable: {
    backgroundColor: "#FFEDE0",
  },

  // ---- Actions ----
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  infoPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF1E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
    flexShrink: 1,
  },
  infoPillIcon: {
    marginLeft: 4,
    color: "#16A34A",
  },
  infoPillText: {
    fontSize: 11,
    color: "#374151",
    textAlign: "right",
  },

  primaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FF8A3D",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },

  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFCAA0",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#FF8A3D",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },

  disabledButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  disabledButtonText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
});
