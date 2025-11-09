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

type Props = {
  apartmentId: number;
  isSavedByUser: boolean;   // initial state
  numOfSaves?: number;      // optional counter
  showCount?: boolean;      // default: true
  disabled?: boolean;
  onToggleLocal?: (saved: boolean) => void; // callback after local toggle
};

const ORANGE = "#E3965A";
const GRAY = "gray";
const INK = "#4c4f52ff";
const SIZE = 23;

// בדיקות ללא API
const mockMode = true;

export default function SaveButtonIGIcon({
  apartmentId,
  isSavedByUser,
  numOfSaves = 0,
  showCount = true,
  disabled = false,
  onToggleLocal,
}: Props) {
  const [saved, setSaved] = useState(isSavedByUser);
  const [count, setCount] = useState(numOfSaves);

  // בזמן בדיקות לא דורכים על ה־state מה־props
  useEffect(() => { if (!mockMode) setSaved(isSavedByUser); }, [isSavedByUser]);
  useEffect(() => { if (!mockMode) setCount(numOfSaves); }, [numOfSaves]);

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

    // עדכון אופטימיסטי
    setSaved(toSaved);
    setCount((c) => c + (toSaved ? 1 : -1));
    onToggleLocal?.(toSaved);

    animatePop();
    if (toSaved) pulseGlow();

    if (!mockMode) {
      try {
        // await (toSaved ? saveApartment() : unsaveApartment());
      } catch {
        // revert על כישלון
        setSaved(!toSaved);
        setCount((c) => c + (toSaved ? -1 : 1));
      }
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
