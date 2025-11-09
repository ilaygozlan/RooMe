import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/styles/uploadApartmentStyles";

type Props = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
};

export default function ProgressIndicator({ currentStep, totalSteps, stepLabels }: Props) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarInner, { width: `${progress}%` }]} />
      </View>
      <View style={styles.stepsContainer}>
        {stepLabels.map((label, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {index < currentStep ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.stepNumber, index === currentStep && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index === currentStep && styles.stepLabelActive,
                index < currentStep && styles.stepLabelCompleted,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.progressText}>
        שלב {currentStep + 1} מתוך {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    zIndex: 5,
  },
  progressBarOuter: {
    height: 4,
    backgroundColor: colors.borderSoft,
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarInner: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderSoft,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: "#fff",
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: colors.primary,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  stepLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 80,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  stepLabelCompleted: {
    color: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});

