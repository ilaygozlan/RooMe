import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  ViewStyle,
  AccessibilityInfo,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

// ---- Types ----
export type Brokerage = "any" | "with" | "without";

export type FloatingSearchFABProps = {
  onApplyFilters: (filters: {
    minPrice: number;
    maxPrice: number;
    brokerage: Brokerage;
  }) => void;
  initialFilters?: {
    minPrice?: number;
    maxPrice?: number;
    brokerage?: Brokerage;
  };
  minPriceBoundary?: number; // default 0
  maxPriceBoundary?: number; // default 30_000
  style?: ViewStyle;
  testID?: string;
};

// ---- Constants ----
const FAB_SIZE = 68; // Collapsed size in dp
const SHEET_HEIGHT_PERCENT = 0.5; // 50% of screen height
const ANIMATION_DURATION = 300; // ms
const PRIMARY_COLOR = "#E3965A";

// ---- Component ----
export default function FloatingSearchFAB({
  onApplyFilters,
  initialFilters,
  minPriceBoundary = 0,
  maxPriceBoundary = 30000,
  style,
  testID = "floating-search-fab",
}: FloatingSearchFABProps) {
  const { bottom } = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const sheetHeight = screenHeight * SHEET_HEIGHT_PERCENT;

  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState(
    initialFilters?.minPrice ?? minPriceBoundary
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters?.maxPrice ?? maxPriceBoundary
  );
  const [brokerage, setBrokerage] = useState<Brokerage>(
    initialFilters?.brokerage ?? "any"
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Single progress animation value (0 = collapsed, 1 = expanded)
  const morphProgress = useSharedValue(0);
  const opacityAnim = useSharedValue(0); // For sheet content
  const backdropOpacity = useSharedValue(0); // For backdrop overlay

  const screenWidth = Dimensions.get("window").width;
  const halfCircleRadius = screenWidth / 2;

  // Animated styles using react-native-reanimated (supports layout properties)
  const animatedContainerStyle = useAnimatedStyle(() => {
    const progress = morphProgress.value;
    // Use progress > 0.5 to determine if we're closer to expanded state for border radius
    const isExpandedState = progress > 0.5;
    
    return {
      width: interpolate(
        progress,
        [0, 1],
        [FAB_SIZE, screenWidth],
        Extrapolation.CLAMP
      ),
      height: interpolate(
        progress,
        [0, 1],
        [FAB_SIZE, sheetHeight],
        Extrapolation.CLAMP
      ),
      borderTopLeftRadius: isExpandedState
        ? interpolate(progress, [0, 1], [FAB_SIZE / 2, halfCircleRadius], Extrapolation.CLAMP)
        : interpolate(progress, [0, 1], [FAB_SIZE / 2, 0], Extrapolation.CLAMP),
      borderTopRightRadius: isExpandedState
        ? interpolate(progress, [0, 1], [FAB_SIZE / 2, halfCircleRadius], Extrapolation.CLAMP)
        : interpolate(progress, [0, 1], [FAB_SIZE / 2, 0], Extrapolation.CLAMP),
      borderBottomLeftRadius: interpolate(
        progress,
        [0, 1],
        [FAB_SIZE / 2, 0],
        Extrapolation.CLAMP
      ),
      borderBottomRightRadius: interpolate(
        progress,
        [0, 1],
        [FAB_SIZE / 2, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(progress, [0, 1], [1, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
      borderTopLeftRadius: interpolate(
        morphProgress.value,
        [0, 1],
        [FAB_SIZE / 2, halfCircleRadius],
        Extrapolation.CLAMP
      ),
      borderTopRightRadius: interpolate(
        morphProgress.value,
        [0, 1],
        [FAB_SIZE / 2, halfCircleRadius],
        Extrapolation.CLAMP
      ),
    };
  });

  const animatedContentSpacerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        morphProgress.value,
        [0, 1],
        [0, 64],
        Extrapolation.CLAMP
      ),
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  // Initialize from props when they change
  useEffect(() => {
    if (initialFilters?.minPrice !== undefined) {
      setMinPrice(initialFilters.minPrice);
    }
    if (initialFilters?.maxPrice !== undefined) {
      setMaxPrice(initialFilters.maxPrice);
    }
    if (initialFilters?.brokerage !== undefined) {
      setBrokerage(initialFilters.brokerage);
    }
  }, [initialFilters]);

  // Expand animation: morph from FAB to bottom sheet with half-circle top
  const expand = () => {
    setIsAnimating(true);
    setIsExpanded(true);

    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics not available
    }

    // Animate progress value using react-native-reanimated (supports layout properties)
    morphProgress.value = withTiming(1, {
      duration: ANIMATION_DURATION,
    });
    
    // Fade in backdrop
    backdropOpacity.value = withTiming(1, {
      duration: ANIMATION_DURATION,
    });
    
    // Fade in sheet content with delay
    opacityAnim.value = withDelay(
      ANIMATION_DURATION * 0.2,
      withTiming(1, {
        duration: ANIMATION_DURATION * 0.8,
      }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimating)(false);
          runOnJS(AccessibilityInfo.announceForAccessibility)("Search filters opened");
        }
      })
    );
  };

  // Collapse animation: reverse the morph
  const collapse = (applyFilters = false) => {
    setIsAnimating(true);

    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics not available
    }

    // Fade out backdrop and content, then reverse morph progress
    backdropOpacity.value = withTiming(0, {
      duration: ANIMATION_DURATION * 0.3,
    });
    
    opacityAnim.value = withTiming(0, {
      duration: ANIMATION_DURATION * 0.3,
    });
    
    morphProgress.value = withTiming(
      0,
      {
        duration: ANIMATION_DURATION,
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsExpanded)(false);
          runOnJS(setIsAnimating)(false);

          if (applyFilters) {
            runOnJS(onApplyFilters)({ minPrice, maxPrice, brokerage });
          }
        }
      }
    );
  };

  // Handle price range change
  const handlePriceChange = (values: number[]) => {
    setMinPrice(values[0] ?? minPriceBoundary);
    setMaxPrice(values[1] ?? maxPriceBoundary);
  };

  // Handle search button press
  const handleSearch = () => {
    if (!isAnimating) {
      collapse(true);
    }
  };

  // Handle close button press
  const handleClose = () => {
    if (!isAnimating) {
      collapse(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    return `₪${price.toLocaleString("he-IL")}`;
  };

  return (
    <>
      {/* Backdrop overlay - closes form when pressed outside */}
      {isExpanded && (
        <Animated.View
          style={[styles.backdrop, animatedBackdropStyle]}
          pointerEvents={isExpanded ? "auto" : "none"}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            testID="search-backdrop"
          />
        </Animated.View>
      )}
      <View
        style={[
          styles.container,
          {
            bottom: isExpanded ? 0 : bottom + 24, // Stick to bottom when expanded, offset when collapsed
          },
          style,
        ]}
        pointerEvents="box-none"
      >
      <Animated.View
        style={[
          styles.fabContainer,
          animatedContainerStyle,
          {
            backgroundColor: isExpanded ? "#fff" : PRIMARY_COLOR, // Orange when collapsed, white when expanded
          },
        ]}
      >
        {/* Collapsed state: FAB with search icon */}
        {!isExpanded && (
          <TouchableOpacity
            style={styles.fabButton}
            onPress={expand}
            activeOpacity={0.8}
            accessibilityLabel="Open search filters"
            accessibilityRole="button"
            testID={testID}
          >
            <MaterialIcons name="search" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Expanded state: Bottom sheet with filters */}
        {isExpanded && (
          <Animated.View
            style={[styles.sheetWrapper, animatedSheetStyle]}
            testID="search-sheet"
          >
            {/* Close button - positioned absolutely in top-right */}
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close filters"
              accessibilityRole="button"
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>

            {/* Content wrapper with animated top spacer */}
            <Animated.View style={styles.contentWrap}>
              <Animated.View style={animatedContentSpacerStyle} />
              
              {/* Title */}
              <Text style={styles.sheetTitle}>Search Filters</Text>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Price Range: {formatPrice(minPrice)} — {formatPrice(maxPrice)}
                </Text>
                <MultiSlider
                  values={[minPrice, maxPrice]}
                  min={minPriceBoundary}
                  max={maxPriceBoundary}
                  step={100}
                  onValuesChange={handlePriceChange}
                  selectedStyle={{ backgroundColor: PRIMARY_COLOR }}
                  markerStyle={{ backgroundColor: PRIMARY_COLOR }}
                  containerStyle={styles.sliderContainer}
                  testID="price-slider"
                />
                <View style={styles.priceLabels}>
                  <Text
                    style={styles.priceLabel}
                    testID="price-min"
                    accessibilityLabel={`Minimum price: ${formatPrice(minPrice)}`}
                  >
                    {formatPrice(minPrice)}
                  </Text>
                  <Text
                    style={styles.priceLabel}
                    testID="price-max"
                    accessibilityLabel={`Maximum price: ${formatPrice(maxPrice)}`}
                  >
                    {formatPrice(maxPrice)}
                  </Text>
                </View>
              </View>

              {/* Brokerage Toggle Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Brokerage</Text>
                <View style={styles.brokerageToggle} testID="brokerage-toggle">
                  {(["any", "with", "without"] as Brokerage[]).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.brokerageOption,
                        brokerage === option && styles.brokerageOptionActive,
                      ]}
                      onPress={() => setBrokerage(option)}
                      accessibilityLabel={`${option === "any" ? "Any" : option === "with" ? "With" : "Without"} brokerage`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.brokerageOptionText,
                          brokerage === option &&
                            styles.brokerageOptionTextActive,
                        ]}
                      >
                        {option === "any"
                          ? "Any"
                          : option === "with"
                          ? "With"
                          : "Without"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Sticky Search Button at bottom */}
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.ctaWrap,
                {
                  paddingBottom: bottom > 0 ? bottom : 12,
                },
              ]}
            >
              <TouchableOpacity
                testID="apply-search"
                accessibilityRole="button"
                accessibilityLabel="Apply search filters"
                disabled={isAnimating}
                style={[
                  styles.searchBtn,
                  isAnimating && styles.searchButtonDisabled,
                ]}
                onPress={handleSearch}
              >
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
    </>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 999,
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    // When expanded, container will be at bottom: 0, so we need to handle safe area inside
  },
  fabContainer: {
    backgroundColor: "#fff", // White background for the sheet
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 }, // Negative offset for shadow above when expanded
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  fabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden", // IMPORTANT: Clips content to rounded shape
  },
  contentWrap: {
    paddingHorizontal: 18,
    paddingBottom: 120, // Leave room so content doesn't hide behind sticky CTA
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 10,
  },
  filterSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  sliderContainer: {
    marginHorizontal: 10,
    marginVertical: 20,
  },
  priceLabels: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  brokerageToggle: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  brokerageOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  brokerageOptionActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: PRIMARY_COLOR,
  },
  brokerageOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  brokerageOptionTextActive: {
    color: "#fff",
  },
  ctaWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: "transparent",
    alignItems: "center"
  },
  searchBtn: {
    height: 52,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    width: "50%"
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

