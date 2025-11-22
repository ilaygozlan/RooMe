import React, { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useSavedApartments } from "@/context/SavedApartmentsContext";
import { useApartments, type Apartment } from "@/context/ApartmentsContext";

type Props = {
  apartmentId: number;
  isSavedByUser?: boolean;   // initial state (optional, will use context if available)
  numOfSaves?: number;      // optional counter
  showCount?: boolean;      // default: true
  disabled?: boolean;
  onToggleLocal?: (saved: boolean) => void; // callback after local toggle
  apartment?: Apartment; // optional apartment data for context
};

const ORANGE = "#E3965A";
const GRAY = "gray";
const INK = "#4c4f52ff";
const SIZE = 23;

export default function SaveButtonIGIcon({
  apartmentId,
  isSavedByUser: propIsSaved,
  numOfSaves = 0,
  showCount = true,
  disabled = false,
  onToggleLocal,
  apartment,
}: Props) {
  // Always use context (provider should be available, but has safe fallback)
  const savedApartmentsContext = useSavedApartments();

  const { entities } = useApartments();
  const apartmentData = apartment || entities[String(apartmentId)];

  // Determine saved state: context > props > false
  const contextIsSaved = savedApartmentsContext.isSaved(apartmentId);
  const initialSaved = savedApartmentsContext.savedApartmentIds.size > 0
    ? contextIsSaved
    : propIsSaved ?? false;

  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(numOfSaves);

  // Sync with context when it changes
  useEffect(() => {
    const contextSaved = savedApartmentsContext.isSaved(apartmentId);
    if (savedApartmentsContext.savedApartmentIds.size > 0 || contextSaved !== propIsSaved) {
      setSaved(contextSaved);
    } else if (propIsSaved !== undefined) {
      setSaved(propIsSaved);
    }
  }, [savedApartmentsContext.savedApartmentIds, apartmentId, propIsSaved, savedApartmentsContext]);

  useEffect(() => {
    if (numOfSaves !== undefined) {
      setCount(numOfSaves);
    }
  }, [numOfSaves]);

  // אנימציות קטנות: פופ + גלואו עדין
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const animatePop = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.0, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]);

  const pulseGlow = () => {
    glow.setValue(0);
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 100, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 420, useNativeDriver: false }),
    ]).start();
  };

  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });

  const onPress = async () => {
    if (disabled) return;
    const toSaved = !saved;

    // Optimistic update
    setSaved(toSaved);
    setCount((c) => c + (toSaved ? 1 : -1));
    onToggleLocal?.(toSaved);

    animatePop();
    if (toSaved) pulseGlow();

    // Use context to persist the change
    try {
      await savedApartmentsContext.toggleSaved(
        apartmentId,
        apartmentData
      );
    } catch (err) {
      // Revert on error
      setSaved(!toSaved);
      setCount((c) => c + (toSaved ? -1 : 1));
      console.error("Error toggling saved status:", err);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale }],
            shadowColor: ORANGE,
            shadowOpacity: Platform.OS === "ios" ? (shadowOpacity as any) : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: Platform.OS === "android" ? (saved ? 3 : 0) : 0,
          },
        ]}
      >
        
        {showCount && (
          <Text style={[styles.countText, { color: saved ? ORANGE : INK }]}>{count}</Text>
        )}

        {/* אייקון וקטורי רגיל */}
        <View style={{ width: SIZE, height: SIZE, justifyContent: "center", alignItems: "center" }}>
          <FontAwesome
            name={saved ? "bookmark" : "bookmark-o"}
            size={SIZE}
            color={saved ? ORANGE : GRAY}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 6 },
  countText: { fontSize: 14, fontWeight: "600" },
});
