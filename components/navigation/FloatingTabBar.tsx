import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ---- Optional theme palette fallback ----
type Palette = {
  text: string;
  textMuted: string;
  border: string;
  card: string;
  navbarBG: string;
  fabBg: string;
  fabIcon: string;
};
const defaultPalette: Palette = {
  text: "#111",
  textMuted: "#8A8A8A",
  border: "rgba(0,0,0,0.08)",
  card: "rgba(255,255,255,0.92)",
  navbarBG: "rgba(227,150,90,0.15)", // indicator bg
  fabBg: "#E3965A",
  fabIcon: "#fff",
};

// Map simple names → Ionicons
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  search: "search",
  messages: "chatbubble-ellipses",
  profile: "person",
};

type Props = BottomTabBarProps & {
  /** Optional theme palette override */
  palette?: Partial<Palette>;
  /** Route name to navigate when pressing the big center button (if not supplied, calls onCenterPress) */
  centerRouteName?: string;
  /** Custom handler instead of navigation to a route */
  onCenterPress?: () => void;
  /** Diameter of the center circle */
  centerSize?: number; // default 76
};

export default function FloatingCenterFabTabBar({
  state,
  descriptors,
  navigation,
  palette: paletteProp,
  centerRouteName,
  onCenterPress,
  centerSize = 80,
}: Props) {
  const palette = { ...defaultPalette, ...(paletteProp || {}) } as Palette;
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  // Expect at least 4 routes – take first 2 for left, last 2 for right
  const { leftRoutes, rightRoutes } = useMemo(() => {
    const routes = (state.routes ?? []).filter(
    (route) => route.name.toLowerCase() !== "map" // remove map from the routes
  );
    const firstTwo = routes.slice(0, 2);
    const lastTwo = routes.slice(-2);
    return { leftRoutes: firstTwo, rightRoutes: lastTwo };
  }, [state.routes]);

  // Animated indicator across side tabs (ignores the center FAB)
  const [tabW, setTabW] = useState(72);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    // there are 4 side slots (2 left + 2 right), with a spacer in the middle for the FAB
    // We divide the width minus the center spacer by 4.
    const centerSpacer = centerSize * 0.55; // visual space for the overhanging FAB
    const sideWidth = (w - centerSpacer) / 4;
    setTabW(sideWidth);
  };

  const Container = Platform.OS === "ios" ? BlurView : View;

  const handlePressTab = (
    routeKey: string,
    routeName: string,
    isFocused: boolean
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const event = navigation.emit({
      type: "tabPress",
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  const handleCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onCenterPress) return onCenterPress();
    if (centerRouteName) {
      // navigate to provided route (use router for routes outside tabs)
      router.push(`/${centerRouteName}` as any);
    }
  };

  // Render helper
  const renderTab = (route: (typeof state.routes)[number]) => {
    const isFocused = state.routes[state.index].key === route.key;
    const label = descriptors[route.key].options.title ?? route.name;
    const iconName = icons[route.name] ?? "ellipse";
    return (
      <Pressable
        key={route.key}
        onPress={() => handlePressTab(route.key, route.name, isFocused)}
        style={styles.tabBtn}
        hitSlop={10}
      >
        <Ionicons
          name={iconName}
          size={22}
          color={isFocused ? "#E3965A" : palette.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? "#E3965A" : palette.textMuted },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { bottom: bottom + 12 }]}
    >
      <View style={styles.outerMargin}>
        {Platform.OS === "android" && (
          <LinearGradient
            colors={["rgba(245, 80, 80, 0.06)", "rgba(117, 241, 0, 0.02)"]}
            style={styles.androidGradient}
          />
        )}

        <Container
          // @ts-ignore BlurView only
          intensity={90}
          tint="light"
          style={[
            styles.container,
            {
              borderColor:
                Platform.OS === "ios" ? "transparent" : palette.border,
              backgroundColor:
                Platform.OS === "ios" ? "transparent" : palette.card,
            },
          ]}
        >
          <View onLayout={onLayout} style={styles.row}>
            {/* Left 2 tabs */}
            <View  style={[
                styles.side,
                {
                  width: tabW * 2,
                  gap: 0,
                  paddingRight: 30,
                },
              ]}>
              {leftRoutes.map(renderTab)}
            </View>

            {/* Center spacer (the FAB will overlap above it) */}
            <View style={{ width: centerSize * 0.55 }} />

            {/* Right 2 tabs */}
            <View
              style={[
                styles.side,
                {
                  width: tabW * 1.9,
                  gap: 5,
                  paddingLeft: 25,
                },
              ]}
            >
              {rightRoutes.map(renderTab)}
            </View>
          </View>
        </Container>

        {/* Center FAB – big circle with home + plus */}
        <View
          pointerEvents="box-none"
          style={[
            styles.fabWrapper,
            {
              height: centerSize,
              width: centerSize,
              bottom: centerSize * 0.15, // lift above bar
            },
          ]}
        >
          <Pressable
            onPress={handleCenterPress}
            style={[
              styles.fab,
              {
                height: centerSize,
                width: centerSize,
                borderRadius: centerSize / 2,
                backgroundColor: palette.fabBg,
              },
            ]}
          >
            {/* Home icon */}
            <Ionicons name="home" size={40} color={palette.fabIcon} />
            {/* Plus badge in corner */}
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={16} color={palette.fabBg} />
              <View style={styles.plusBadgeInner} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  outerMargin: {
    marginHorizontal: 20,
  },
  androidGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderRadius: 28,
  },
  container: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: Platform.OS === "ios" ? 0 : 1,
    shadowColor: "#fdc899ff",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  side: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "Inter_500Medium",
  },
  fabWrapper: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#be5403ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10, // Android
  },
  plusBadge: {
    position: "absolute",
    right: 16,
    top: 48,
    height: 18,
    width: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#E3965A",
    borderWidth: 1,
  },
  plusBadgeInner: {
    position: "absolute",
    inset: 0,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
