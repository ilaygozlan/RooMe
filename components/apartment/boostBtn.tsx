// components/BoostButton.tsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { TouchableOpacity, Alert, StyleSheet, View, Text, Animated, Easing, Platform } from "react-native";
import Svg, { Defs, Mask, G, Path, Rect } from "react-native-svg";
/* import API from "../../config";
import { userInfoContext } from "../contex/userInfoContext";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext"; */

/**
 * @component BoostButton
 * @description Replaces Like button with a "Boost" mechanic.
 * Visual: hollow up-arrow that fills bottom→top in ROOME orange, then brief glow.
 *
 * Props:
 * - apartmentId: number
 * - numOfBoosts: number (initial)
 * - isBoostedByUser: boolean (initial)
 *
 * Backend (adjust routes if needed):
 *  POST   User/BoostApartment/{userId}/{apartmentId}
 *  DELETE User/RemoveBoostApartment/{userId}/{apartmentId}
 *
 * Notes:
 * - Uses react-native-svg for a crisp hollow arrow.
 * - Animated fill via mask + Animated values.
 * - On boost: fill animates up and ends with a short orange glow.
 */

type Props = {
  apartmentId: number;
  numOfBoosts: number;
  isBoostedByUser: boolean;
};

const ORANGE = "#E3965A";         // ROOME brand orange
const GRAY = "#9CA3AF";           // neutral stroke/fill
const SIZE = 28;                  // icon visual size (width/height in px)
const VIEWBOX = 100;              // SVG viewBox size (0..100)
const STROKE_W = 8;               // arrow outline thickness

export default function BoostButton(props: Props) {
  const [boosted, setBoosted] = useState<boolean>(props.isBoostedByUser);
  const [count, setCount] = useState<number>(props.numOfBoosts);
/*   const { loginUserId } = useContext(userInfoContext);

  const {
    allApartments,
    setAllApartments,
    triggerFavoritesRefresh,
  } = useContext(ActiveApartmentContext); */

  // Sync external changes
  useEffect(() => {
    setBoosted(props.isBoostedByUser);
  }, [props.isBoostedByUser]);

  useEffect(() => {
    setCount(props.numOfBoosts);
  }, [props.numOfBoosts]);

  /** Update apartment Boost flags in global context */
  const setApartmentBoostedByUser = (id: number) => {
    const updated = allApartments?.map((apt: any) =>
      apt.ApartmentID === id ? { ...apt, IsBoostedByUser: true } : apt
    );
    setAllApartments?.(updated);
    triggerFavoritesRefresh?.();
  };

  const setApartmentUnboostedByUser = (id: number) => {
    const updated = allApartments?.map((apt: any) =>
      apt.ApartmentID === id ? { ...apt, IsBoostedByUser: false } : apt
    );
    setAllApartments?.(updated);
    triggerFavoritesRefresh?.();
  };

  /** API */
  const boostApartment = async () => {
    const res = await fetch(
      API + `User/BoostApartment/${loginUserId}/${props.apartmentId}`,
      { method: "POST", headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error("Failed to boost apartment");
    setApartmentBoostedByUser(props.apartmentId);
  };

  const unboostApartment = async () => {
    const res = await fetch(
      API + `User/RemoveBoostApartment/${loginUserId}/${props.apartmentId}`,
      { method: "DELETE", headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error("Failed to unboost apartment");
    setApartmentUnboostedByUser(props.apartmentId);
  };

  /** --- Animation setup --- */
  // fillProgress: 0 → empty, 1 → full
  const fillProgress = useRef(new Animated.Value(boosted ? 1 : 0)).current;

  // brief glow after fill completes
  const glow = useRef(new Animated.Value(0)).current; // 0..1 → controls shadowOpacity/intensity

  // Animate fill up or down
  const animateFill = (toFull: boolean) => {
    Animated.timing(fillProgress, {
      toValue: toFull ? 1 : 0,
      duration: toFull ? 650 : 400,
      easing: toFull ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      useNativeDriver: false, // we animate SVG attributes (height/y), not transform
    }).start(({ finished }) => {
      if (finished && toFull) triggerGlow();
    });
  };

  // Glow: quick in-out highlight
  const triggerGlow = () => {
    glow.setValue(0);
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 650, useNativeDriver: false })
    ]).start();
  };

  /** Derived values for SVG rect clipping the fill */
  // We mask an orange rect; its height grows from 0→VIEWBOX, y from VIEWBOX→0 (bottom-up).
  const animatedFillHeight = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, VIEWBOX],
  });

  const animatedFillY = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [VIEWBOX, 0], // start below, move up as it fills
  });

  // Shadow/glow style
  const shadowIntensity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  /** Handle press */
  const onPress = () => {
    const toBoost = !boosted;
    setBoosted(toBoost);
    setCount((c) => c + (toBoost ? 1 : -1));
    animateFill(toBoost);

/*     // Fire & forget API; if fails, revert state
    (async () => {
      try {
        if (toBoost) await boostApartment();
        else await unboostApartment();
      } catch (err) {
        console.error("Boost API error:", err);
        Alert.alert("שגיאה", toBoost ? "לא ניתן לקדם את הדירה" : "שגיאה בהסרת קידום");
        // revert
        setBoosted(!toBoost);
        setCount((c) => c + (toBoost ? -1 : 1));
        animateFill(!toBoost);
      }
    })(); */
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.container,
          {
            // Subtle scaling when boosted (optional)
            transform: [{ translateY: 0 }],
            // Shadow glow (iOS) / elevation (Android)
            shadowColor: ORANGE,
            shadowOpacity: Platform.OS === "ios" ? (shadowIntensity as any) : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
            elevation: Platform.OS === "android" ? (boosted ? 4 : 0) : 0,
          },
        ]}
      >
        {/* Arrow icon with outline + masked fill */}
        <View style={{ width: SIZE, height: SIZE }}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
            <Defs>
              {/* Arrow mask: white areas of the mask reveal the orange fill */}
              <Mask id="arrowMask">
                <G fill="#ffffff">
                  {/* Arrow head (triangle) */}
                  <Path d="M50 6 L80 38 L20 38 Z" />
                  {/* Arrow shaft (rounded rect imitation by path) */}
                  <Path d={roundedRectPath(39, 35, 20, 40, 2)} />
                </G>
              </Mask>
            </Defs>

            {/* Outline (hollow arrow) */}
            <G>
              {/* head outline */}
              <Path
                d="M50 6 L80 38 L20 38 Z"
                fill={GRAY}
                stroke={boosted ? ORANGE : GRAY}
                strokeWidth={STROKE_W}
                strokeLinejoin="round"
              />
              {/* shaft outline */}
              <Path
                d={roundedRectPath(39, 35, 20, 40, 2)}
                fill={GRAY}
                stroke={boosted ? ORANGE : GRAY}
                strokeWidth={STROKE_W}
                strokeLinejoin="round"
              />
            </G>

            {/* Animated fill: orange rect masked by arrow shape */}
            <G mask="url(#arrowMask)">
              <AnimatedRect
                x={0}
                width={VIEWBOX}
                // @ts-ignore Animated props
                y={animatedFillY}
                // @ts-ignore Animated props
                height={animatedFillHeight}
                fill={ORANGE}
              />
            </G>
          </Svg>
        </View>

        <Text style={[styles.countText, { color: boosted ? ORANGE : "#6B7280" }]}>
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/** Helper: rounded-rect path string for the arrow shaft */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  // Clamp radius
  const rr = Math.min(r, w / 2, h / 2);
  // Path with rounded corners (clockwise)
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `Q${x + w},${y + h} ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `Q${x},${y + h} ${x},${y + h - rr}`,
    `V${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    "Z",
  ].join(" ");
}

/** Animated Rect for SVG */
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
