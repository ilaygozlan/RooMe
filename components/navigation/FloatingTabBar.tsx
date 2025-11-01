import { useTheme } from "@/lib/ui/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  search: "search",
  messages: "chatbubble-ellipses",
  profile: "person",
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  const { palette } = useTheme();
  const [tabW, setTabW] = useState(72);
  const index = state.index;
  const x = useSharedValue(index);

  useEffect(() => {
    x.value = withTiming(index, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [index]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTabW(w / state.routes.length);
  };

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * tabW }],
  }));

  const Container = Platform.OS === "ios" ? BlurView : View;

  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: bottom + 12 }}>
      <View style={{ marginHorizontal: 20 }}>
        {Platform.OS === "android" && (
          <LinearGradient
            colors={["rgba(245, 80, 80, 0.06)", "rgba(117, 241, 0, 0.02)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              borderRadius: 28,
            }}
          />
        )}
        <Container
          intensity={30}
          tint="dark"
          style={{
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: Platform.OS === "ios" ? 0 : 1,
            borderColor: palette.border,
            backgroundColor: Platform.OS === "ios" ? "transparent" : palette.card,
            shadowColor: "#fdc899ff",
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View onLayout={onLayout} style={{ flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10 }}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 10,
                  top: 7,
                  height: 55,
                  width: tabW - 15,
                  borderRadius: 20,
                  backgroundColor: palette.navbarBG,
                },
                indicator,
              ]}
            />
            {state.routes.map((route, i) => {
              const isFocused = index === i;
              const onPress = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };
              const label = descriptors[route.key].options.title ?? route.name;
              const icon = icons[route.name] ?? "ellipse";
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
                  hitSlop={8}
                >
                  <Ionicons name={icon as any} size={22} color={isFocused ? palette.text : palette.textMuted} />
                  <Text
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      color: isFocused ? palette.text : palette.textMuted,
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Container>
      </View>
    </View>
  );
}

