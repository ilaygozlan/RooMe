import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ENV } from "../config/env";
// Optional alternative for libraries that require string literals:
// import { API_BASE_URL, GOOGLE_MAPS_KEY } from "@env";

/**
 * Example component demonstrating environment variable usage
 *
 * This component shows the preferred way to access environment variables
 * using the validated ENV object from src/config/env.ts
 */
export default function EnvUsageExample() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Environment Variables</Text>
        <Text style={styles.description}>
          This component demonstrates how to access environment variables in the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>API Base URL:</Text>
        <Text style={styles.value}>{ENV.apiBaseUrl}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Google Maps Key:</Text>
        <Text style={styles.value}>
          {ENV.googleMapsKey ? `${ENV.googleMapsKey.substring(0, 20)}...` : "Not set"}
        </Text>
        <Text style={styles.hint}>Key length: {ENV.googleMapsKey.length} characters</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sentry DSN:</Text>
        <Text style={styles.value}>
          {ENV.sentryDsn || "Not configured (optional)"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.codeTitle}>Usage Example:</Text>
        <Text style={styles.codeBlock}>
          {`import { ENV } from "../config/env";

// Make an API call
const response = await fetch(
  \`\${ENV.apiBaseUrl}/api/users\`
);`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.codeTitle}>Alternative (@env import):</Text>
        <Text style={styles.codeBlock}>
          {`// Only use this for libraries requiring 
// compile-time string literals
import { GOOGLE_MAPS_KEY } from "@env";

<MapView apiKey={GOOGLE_MAPS_KEY} />`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: "#007AFF",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  codeBlock: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 4,
    color: "#333",
  },
});

