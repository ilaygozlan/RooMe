import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  findNodeHandle,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Tour step configuration
type TourStep = {
  id: string;
  title: string;
  body: string;
  targetTestID: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "map",
    title: "מפת הדירות",
    body: "כאן תוכל לראות את כל הדירות על גבי מפה, לסנן לפי קריטריונים רלוונטים ולמצוא את הדירה שמתאימה לך.",
    targetTestID: "mapButton",
    placement: "bottom",
  },
  {
    id: "add",
    title: "הוספת דירה",
    body: "כאן תוכל לפרסם דירה חדשה – למלא פרטים, להעלות תמונות ולשתף את הדירה עם משתמשים אחרים באפליקציה.",
    targetTestID: "addApartmentButton",
    placement: "top",
  },
  {
    id: "saved",
    title: "דירות שמורות",
    body: "כאן תמצא את כל הדירות ששמרת כדי לחזור אליהן במהירות, להשוות ביניהן ולהמשיך משם את החיפוש שלך.",
    targetTestID: "savedApartmentsButton",
    placement: "top",
  },
  {
    id: "boost",
    title: "בוסט למודעה",
    body: "בלחיצה כאן תוכל להעניק בוסט למודעת דירה, כדי שהיא תופיע ליותר משתמשים ותזכה לחשיפה גבוהה יותר ופניות רבות יותר.",
    targetTestID: "boostButton",
    placement: "top",
  },
];

type MainScreenGuidedTourProps = {
  /** Whether the tour should be visible */
  visible: boolean;
  /** Callback when tour is completed */
  onComplete: () => void;
  /** Optional: Layout measurements for target elements */
  targetLayouts?: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >;
};

export default function MainScreenGuidedTour({
  visible,
  onComplete,
  targetLayouts,
}: MainScreenGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetLayout, setTargetLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { bottom: safeBottom, top: safeTop } = useSafeAreaInsets();

  // Approximate positions as fallback (will be overridden by targetLayouts if provided)
  // Note: These are calculated inside useEffect to have access to safeTop/safeBottom
  const getApproximatePositions = (): Record<
    string,
    { x: number; y: number; width: number; height: number }
  > => ({
    mapButton: {
      x: SCREEN_WIDTH - 429,
      y: safeTop + 14,
      width: 60,
      height: 60,
    },
    addApartmentButton: {
      x: SCREEN_WIDTH / 2 - 40,
      y: SCREEN_HEIGHT - safeBottom - 105,
      width: 80,
      height: 80,
    },
    savedApartmentsButton: {
      x: 94,
      y: SCREEN_HEIGHT - safeBottom - 80,
      width: 75,
      height: 60,
    },
    boostButton: {
      x: SCREEN_WIDTH / 2 - 173,
      y: safeTop + 572, // Approximate position where first apartment card's boost button would be
      width: 60,
      height: 50,
    },
  });

  // Measure target element position
  useEffect(() => {
    if (!visible || currentStep >= TOUR_STEPS.length) return;

    const measureTarget = () => {
      const testID = TOUR_STEPS[currentStep].targetTestID;

      // Use provided layouts if available, otherwise use approximate positions
      const approximatePositions = getApproximatePositions();
      const layout = targetLayouts?.[testID] || approximatePositions[testID];

      if (layout) {
        setTargetLayout(layout);
        // Small delay to ensure smooth animation
        setTimeout(() => {
          setTooltipVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 100);
      }
    };

    // Reset and measure
    setTooltipVisible(false);
    fadeAnim.setValue(0);

    // Small delay to ensure UI is ready
    const timer = setTimeout(measureTarget, 200);
    return () => clearTimeout(timer);
  }, [visible, currentStep, fadeAnim, targetLayouts, safeBottom, safeTop]);

  // Reset when tour becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setTooltipVisible(false);
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep((prev) => prev + 1);
        setTooltipVisible(false);
        fadeAnim.setValue(0);
      });
    } else {
      // Tour complete
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }
  };

  const handleSkip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  if (!visible || currentStep >= TOUR_STEPS.length) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Calculate tooltip position based on target and placement
  const getTooltipPosition = () => {
    if (!targetLayout) return { top: 0, left: 0 };

    const tooltipWidth = SCREEN_WIDTH - 80;
    const tooltipHeight = 200;
    const spacing = 20;

    switch (step.placement) {
      case "top":
        return {
          top: Math.max(safeTop + 20, targetLayout.y - tooltipHeight - spacing),
          left: (SCREEN_WIDTH - tooltipWidth) / 2,
        };
      case "bottom":
        return {
          top: Math.min(
            SCREEN_HEIGHT - tooltipHeight - safeBottom - 20,
            targetLayout.y + targetLayout.height + spacing
          ),
          left: (SCREEN_WIDTH - tooltipWidth) / 2,
        };
      case "left":
        return {
          top: targetLayout.y + (targetLayout.height - tooltipHeight) / 2,
          left: Math.max(20, targetLayout.x - tooltipWidth - spacing),
        };
      case "right":
        return {
          top: targetLayout.y + (targetLayout.height - tooltipHeight) / 2,
          left: Math.min(
            SCREEN_WIDTH - tooltipWidth - 20,
            targetLayout.x + targetLayout.width + spacing
          ),
        };
      default:
        return {
          top: (SCREEN_HEIGHT - tooltipHeight) / 2,
          left: (SCREEN_WIDTH - tooltipWidth) / 2,
        };
    }
  };

  const tooltipPos = getTooltipPosition();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        {/* Backdrop with hole for target element */}
        {targetLayout && (
          <View style={styles.backdropContainer}>
            {/* Top overlay */}
            <View
              style={[
                styles.backdropSection,
                {
                  height: Math.max(0, targetLayout.y),
                },
              ]}
            />
            {/* Middle row */}
            <View style={styles.middleRow}>
              {/* Left overlay */}
              <View
                style={[
                  styles.backdropSection,
                  {
                    width: Math.max(0, targetLayout.x),
                    height: targetLayout.height,
                  },
                ]}
              />
              {/* Target highlight area (transparent) */}
              <View
                style={[
                  styles.targetHighlight,
                  {
                    width: targetLayout.width,
                    height: targetLayout.height,
                  },
                ]}
              />
              {/* Right overlay */}
              <View
                style={[
                  styles.backdropSection,
                  {
                    flex: 1,
                    height: targetLayout.height,
                  },
                ]}
              />
            </View>
            {/* Bottom overlay */}
            <View
              style={[
                styles.backdropSection,
                {
                  flex: 1,
                },
              ]}
            />
          </View>
        )}

        {/* Tooltip */}
        {tooltipVisible && targetLayout && (
          <Animated.View
            style={[
              styles.tooltipContainer,
              tooltipPos,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.tooltip}>
              <Text style={styles.tooltipTitle}>{step.title}</Text>
              <Text style={styles.tooltipBody}>{step.body}</Text>
              <View style={styles.tooltipActions}>
                {!isLastStep && (
                  <TouchableOpacity
                    onPress={handleSkip}
                    style={styles.skipButton}
                  >
                    <Text style={styles.skipButtonText}>דלג</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleNext} style={styles.okButton}>
                  <Text style={styles.okButtonText}>אישור</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Tooltip arrow/pointer */}
            {step.placement === "top" && step.id !== "saved" && step.id !== "boost" && (
              <View
                style={[
                  styles.tooltipArrow,
                  {
                    position: "absolute",
                    bottom: -12,
                    left: (SCREEN_WIDTH - 80) / 2 - 6,
                    width: 0,
                    height: 0,
                    backgroundColor: "transparent",
                    borderStyle: "solid",
                    borderTopWidth: 12,
                    borderTopColor: "#fff",
                    borderLeftWidth: 6,
                    borderLeftColor: "transparent",
                    borderRightWidth: 6,
                    borderRightColor: "transparent",
                  },
                ]}
              />
            )}
            {step.placement === "top" && step.id === "saved" && (
              <View
                style={[
                  styles.tooltipArrow,
                  {
                    position: "absolute",
                    bottom: -12,
                    left: (SCREEN_WIDTH - 80) / 5 + 12,
                    width: 0,
                    height: 0,
                    backgroundColor: "transparent",
                    borderStyle: "solid",
                    borderTopWidth: 12,
                    borderTopColor: "#fff",
                    borderLeftWidth: 6,
                    borderLeftColor: "transparent",
                    borderRightWidth: 6,
                    borderRightColor: "transparent",
                  },
                ]}
              />
            )}
                {step.placement === "top" && step.id === "boost" && (
              <View
                style={[
                  styles.tooltipArrow,
                  {
                    position: "absolute",
                    bottom: -12,
                    left: (SCREEN_WIDTH - 80) / 8 - 15,
                    width: 0,
                    height: 0,
                    backgroundColor: "transparent",
                    borderStyle: "solid",
                    borderTopWidth: 12,
                    borderTopColor: "#fff",
                    borderLeftWidth: 6,
                    borderLeftColor: "transparent",
                    borderRightWidth: 6,
                    borderRightColor: "transparent",
                  },
                ]}
              />
            )}
            {step.placement === "bottom" && (
              <View
                style={[
                  styles.tooltipArrow,
                  {
                    position: "absolute",
                    top: -10,
                    left: (SCREEN_WIDTH - 80) / 8 - 32,
                    width: 0,
                    height: 0,
                    backgroundColor: "transparent",
                    borderStyle: "solid",
                    borderBottomWidth: 12,
                    borderBottomColor: "#fff",
                    borderLeftWidth: 6,
                    borderLeftColor: "transparent",
                    borderRightWidth: 6,
                    borderRightColor: "transparent",
                  },
                ]}
              />
            )}
          </Animated.View>
        )}

        {/* Progress indicator */}
        <View style={[styles.progressContainer, { top: safeTop + 20 }]}>
          {TOUR_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backdropContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropSection: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleRow: {
    flexDirection: "row",
  },
  targetHighlight: {
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#E3965A",
    shadowColor: "#E3965A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltipContainer: {
    position: "absolute",
    width: SCREEN_WIDTH - 80,
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
  },
  tooltipBody: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "right",
  },
  tooltipActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 12,
  },
  okButton: {
    backgroundColor: "#E3965A",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#E3965A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  okButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  skipButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
  tooltipArrow: {
    // Arrow styles are applied dynamically
  },
  progressContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    zIndex: 1001,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  progressDotActive: {
    backgroundColor: "#E3965A",
    width: 24,
  },
});
