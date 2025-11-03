import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path, Defs, Mask, Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect as unknown as React.ComponentType<any>);

type Props = {
  text?: string;
};

/**
 * @component HouseLoading
 * @description Animated loading indicator component featuring a house shape that fills up.
 * Uses SVG and Animated API to create a smooth filling animation effect.
 *
 * Features:
 * - SVG-based house shape
 * - Bottom-to-top fill animation
 * - Continuous loop animation
 * - Custom color scheme
 * - Loading text indicator
 *
 * Animation Details:
 * - Duration: 4000ms
 * - Fill Direction: Bottom to top
 * - Animation Type: Linear easing
 * - Colors: Gray background with orange fill
 *
 * @example
 * <HouseLoading />
 */
export default function HouseLoading({ text = "טוען..." }: Props) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 0, // ← reset immediately
          useNativeDriver: false,
        }),
      ]).start(() => {
        loopAnimation(); // recursion for the loop
      });
    };

    loopAnimation(); // first activation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0], // fills from bottom to top
  });

  return (
    <View style={styles.loadingContainer}>
      <Svg width={60} height={60} viewBox="0 0 512 512">
        <Defs>
          <Mask id="mask">
            <Path
              fill="white"
              d="M256 0L0 192h64v320h128V320h128v192h128V192h64z"
            />
          </Mask>
        </Defs>

        {/* gray background of the house */}
        <Path
          fill="#ccc"
          d="M256 0L0 192h64v320h128V320h128v192h128V192h64z"
        />

        {/* the orange filling that fills */}
        <AnimatedRect
          x="0"
          // Animated value for y (allowed via createAnimatedComponent + cast)
          y={fillHeight as unknown as number}
          width="512"
          height="512"
          fill="#E3965A"
          mask="url(#mask)"
        />
      </Svg>

      <Text style={{ marginTop: 20, fontSize: 16 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
