import Constants from "expo-constants";
import { z } from "zod";

// Schema for runtime validation of environment variables
const envSchema = z.object({
  apiBaseUrl: z.string().url().min(1, "API_BASE_URL is required"),
  googleMapsKey: z.string().min(1, "GOOGLE_MAPS_KEY is required"),
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

// Validate and export typed environment variables
// This will throw a descriptive error if validation fails
export const ENV = envSchema.parse(extra);

// Export individual values for convenience
export const API_BASE_URL = ENV.apiBaseUrl;
export const GOOGLE_MAPS_KEY = ENV.googleMapsKey;
export const SENTRY_DSN = ENV.sentryDsn;

