// components/BoostButton.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Svg, {
  G,
  Path,
  Circle,
  Rect,
  LinearGradient,
  Stop,
  Defs,
} from "react-native-svg";

type Props = {
  apartmentId: number;
  numOfBoosts: number;
  isBoostedByUser: boolean;
};

const ORANGE = "#E3965A"; // ROOME brand orange
const GRAY = "#9CA3AF";
const SIZE = 28; // icon size (px)
const VIEWBOX = 100; // SVG viewBox
const STROKE_W = 6; // outline width

export default function BoostButton(props: Props) {
  const [boosted, setBoosted] = useState<boolean>(props.isBoostedByUser);
  const [count, setCount] = useState<number>(props.numOfBoosts);

  /*   useEffect(() => setBoosted(props.isBoostedByUser), [props.isBoostedByUser]);
  useEffect(() => setCount(props.numOfBoosts), [props.numOfBoosts]); */

  // ---------- ✨ Flight animation (rocket) ----------
  const [inFlight, setInFlight] = useState(false); // ★ render animated copy only when needed
  const flyY = useRef(new Animated.Value(0)).current; // 0 → -flightHeight
  const flyRotate = useRef(new Animated.Value(0)).current; // 0..1 → 0..360deg
  const flyOpacity = useRef(new Animated.Value(0)).current; // 0..1

  const flameScale = useRef(new Animated.Value(0)).current;
  const flameOpacity = useRef(new Animated.Value(0)).current;
  // פליקר עדין (סקייל מחזורי בזמן ההמראה)
  const flamePulse = useRef(new Animated.Value(0)).current;

  // למעלה בקומפוננטה, הוסף רפרנס כדי שנוכל לעצור את הלופ של הפליקר:
  const flamePulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const launchRocket = () => {
    // reset values
    flyY.setValue(0);
    flyRotate.setValue(0);
    flyOpacity.setValue(1);

    flameScale.setValue(0);
    flameOpacity.setValue(0);
    flamePulse.setValue(0);

    setInFlight(true);

    // שלב 1: סיבוב ועלייה קלה (בלי להבה)
    Animated.parallel([
      Animated.timing(flyY, {
        toValue: -90,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(flyRotate, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // כאן מתחילים את הלהבה רק אחרי הסיבוב 👇
      flamePulse.setValue(0);
      flamePulseLoopRef.current = Animated.loop(
        Animated.timing(flamePulse, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      );
      flamePulseLoopRef.current.start();

      // שלב 2: הלהבה נכנסת + שיגור חזק למעלה במקביל
      Animated.parallel([
        Animated.sequence([
          Animated.timing(flameOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(flameScale, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(flyY, {
          toValue: -350, // ↑ אפשר להגדיל לשיגור גבוה יותר
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // שלב 3: כיבוי – הטיל והלהבה נעלמים
        Animated.parallel([
          Animated.timing(flyOpacity, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(flameOpacity, {
            toValue: -500,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          // ניקוי וסיום
          flamePulseLoopRef.current?.stop();
          setInFlight(false);
          flyY.setValue(0);
          flyRotate.setValue(0);
        });
      });
    });
  };

  const flamePulseScale = flamePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12], // פליקר קטן בלהבה
  });

  const onPress = () => {
    const toBoost = !boosted;
    setBoosted(toBoost);
    setCount((c) => c + (toBoost ? 1 : -1));

    if (toBoost) {
      // צבע כתום + שיגור
      launchRocket();
    }
    // במצב הורדת Boost לא מבצעים טיסה; אם תרצה — אפשר להוסיף "נחיתה" בעתיד.
  };

  // glow עדין אחרי Boost (שומר מהגרסה הקודמת)
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (boosted) {
      glow.setValue(0);
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 650,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [boosted]);

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  // ---------- SVG Rocket ----------
  // מינימליסטי, חד, עובד נהדר כ־28px:
  // גוף עיקרי, חרטום, חלון, כנפיים ושלהבת קלה.
  // 🔄 החלף את RocketSVG הישן בזה (שאר הקובץ ללא שינוי)
const RocketSVG = ({ boosted }: { boosted: boolean }) => (
  <Svg width="100%" height="100%" viewBox="0 0 100 120">
    <Defs>
      {/* ---- BODY GRADIENTS ---- */}
      <LinearGradient id="bodyNormal" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F2F2F2" />
        <Stop offset="45%" stopColor="#D9D9D9" />
        <Stop offset="55%" stopColor="#CFCFCF" />
        <Stop offset="100%" stopColor="#BFBFBF" />
      </LinearGradient>

      <LinearGradient id="bodyBoost" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFC084" />
        <Stop offset="45%" stopColor="#FF9A57" />
        <Stop offset="75%" stopColor="#E6792A" />
        <Stop offset="100%" stopColor="#C65F1A" />
      </LinearGradient>

      {/* ---- NOSE ---- */}
      <LinearGradient id="noseNormal" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#E6E6E6" />
        <Stop offset="100%" stopColor="#BDBDBD" />
      </LinearGradient>
      <LinearGradient id="noseBoost" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFD8B2" />
        <Stop offset="100%" stopColor="#E3965A" />
      </LinearGradient>

      {/* ---- WINDOW ---- */}
      <LinearGradient id="window" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#69B6FF" />
        <Stop offset="100%" stopColor="#2D84E6" />
      </LinearGradient>

      {/* ---- FINS ---- */}
      <LinearGradient id="finNormal" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FF6B6B" />
        <Stop offset="100%" stopColor="#E63946" />
      </LinearGradient>
      <LinearGradient id="finBoost" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFAB76" />
        <Stop offset="100%" stopColor="#E26C29" />
      </LinearGradient>
    </Defs>

    <G>
      {/* Nose cone */}
      <Path
        d="M50 5 C59 13 64 23 64 23 H36 C36 23 41 13 50 5 Z"
        fill={boosted ? "url(#noseBoost)" : "url(#noseNormal)"}
        stroke={boosted ? "#C65F1A" : "#9E9E9E"}
        strokeWidth="2.6"
      />

      {/* Body capsule — extended vertically */}
      <Path
        d="M36 23 Q50 21 64 23 V75 Q50 90 36 75 Z"
        fill={boosted ? "url(#bodyBoost)" : "url(#bodyNormal)"}
        stroke={boosted ? "#C65F1A" : "#9E9E9E"}
        strokeWidth="2.6"
      />

      {/* Window (adjusted slightly up for long body) */}
      <Circle cx="50" cy="38" r="9.5" fill="url(#window)" />
      <Circle cx="50" cy="38" r="12" stroke="#8FB5D9" strokeWidth="3" fill="none" />

      {/* Fins — adjusted to fit new elongated body */}
      <Path
        d="M36 60 L24 78 L38 78 Z"
        fill={boosted ? "url(#finBoost)" : "url(#finNormal)"}
        stroke={boosted ? "#C65F1A" : "#B7343C"}
        strokeWidth="2"
      />
      <Path
        d="M64 60 L76 78 L62 78 Z"
        fill={boosted ? "url(#finBoost)" : "url(#finNormal)"}
        stroke={boosted ? "#C65F1A" : "#B7343C"}
        strokeWidth="2"
      />

      {/* Nozzle */}
      <Path
        d="M44 75 L56 75 L52 82 Q50 84 48 82 Z"
        fill="#A6A6A6"
        stroke="#6E6E6E"
        strokeWidth="2"
      />
    </G>
  </Svg>
);



  // Rotations
  const rotateDeg = flyRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.container,
          {
            shadowColor: ORANGE,
            shadowOpacity: Platform.OS === "ios" ? (shadowOpacity as any) : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
            elevation: Platform.OS === "android" ? (boosted ? 4 : 0) : 0,
          },
        ]}
      >
        {/* Wrapper so we can absolutely-position the flying copy */}
        <View style={{ width: SIZE, height: SIZE, position: "relative" }}>
          {/* Base rocket (static) */}
          <View style={{ width: SIZE, height: SIZE }}>
           <RocketSVG boosted={boosted} />
          </View>

          {/* Flying copy (renders only during flight) */}
          {inFlight && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: SIZE,
                height: SIZE,
                transform: [{ translateY: flyY }, { rotate: rotateDeg }],
                opacity: flyOpacity,
              }}
            >
              {/* הטיל המעופף (כתום) */}
             <RocketSVG boosted={boosted} />

              {/* הלהבה – ממוקמת מתחת לטיל בתוך אותו קונטיינר, אז היא "טסה" איתו */}
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: SIZE / 2 - 8, // מרכז הלהבה תחת מרכז הטיל
                  top: SIZE - 2, // ממש מתחת לתחתית האייקון
                  width: 16,
                  height: 24,
                  opacity: flameOpacity,
                  transform: [
                    { scale: flameScale },
                    {
                      scale: flamePulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.12],
                      }),
                    },
                  ],
                }}
              >
                <Svg width="100%" height="100%" viewBox="0 0 20 30">
                  <Defs>
                    <LinearGradient
                      id="flameOuter"
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor="#FFD166" />
                      <Stop offset="100%" stopColor="#E3965A" />
                    </LinearGradient>
                    <LinearGradient
                      id="flameInner"
                      x1="50%"
                      y1="0%"
                      x2="50%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor="#FFF5CC" />
                      <Stop offset="100%" stopColor="#FFD166" />
                    </LinearGradient>
                  </Defs>

                  {/* להבה חיצונית */}
                  <Path
                    d="M10 0 C4 8, 4 16, 10 30 C16 16, 16 8, 10 0 Z"
                    fill="url(#flameOuter)"
                    opacity="0.9"
                  />
                  {/* ליבה פנימית */}
                  <Path
                    d="M10 5 C6 11, 6 17, 10 26 C14 17, 14 11, 10 5 Z"
                    fill="url(#flameInner)"
                    opacity="0.95"
                  />
                </Svg>
              </Animated.View>
            </Animated.View>
          )}
        </View>

        <Text
          style={[styles.countText, { color: boosted ? ORANGE : "#6B7280" }]}
        >
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

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
