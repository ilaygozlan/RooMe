import Constants from "expo-constants";
import { z } from "zod";

// Schema for runtime validation of environment variables
// Made more lenient to handle missing values gracefully during development
const envSchema = z.object({
  apiBaseUrl: z.string().default(""),
  googleMapsKey: z.string().default(""),
  sentryDsn: z.string().optional().default(""),
});

// Extract extra config from Constants
// In development, Constants.expoConfig is available; in production builds, use Constants.expoConfig
const extra =
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
  // Fallback for older Expo SDKs:
  // @ts-ignore - manifest may exist in older SDKs
  (Constants.manifest?.extra as Record<string, unknown> | undefined) ??
  {};

// Validate with safe defaults - won't throw if values are missing
// This allows the app to start even if env vars aren't fully configured
const parsed = envSchema.safeParse(extra);

if (!parsed.success) {
  console.warn("Environment variable validation failed:", parsed.error.format());
}

// Use parsed values or fallback to empty strings
const envValues = parsed.success ? parsed.data : {
  apiBaseUrl: "",
  googleMapsKey: "",
  sentryDsn: "",
};

// Validate URL format only if apiBaseUrl is provided
if (envValues.apiBaseUrl && !z.string().url().safeParse(envValues.apiBaseUrl).success) {
  console.warn("API_BASE_URL is not a valid URL:", envValues.apiBaseUrl);
}

export const ENV = {
  apiBaseUrl: envValues.apiBaseUrl,
  googleMapsKey: envValues.googleMapsKey,
  sentryDsn: envValues.sentryDsn,
};

// Export individual values for convenience
export const API_BASE_URL = ENV.apiBaseUrl;
export const GOOGLE_MAPS_KEY = ENV.googleMapsKey;
export const SENTRY_DSN = ENV.sentryDsn;

