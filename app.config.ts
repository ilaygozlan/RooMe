import "dotenv/config";
import type { ExpoConfig } from "expo/config";

// Load environment variables from .env files
// In EAS builds, these will be injected as Secrets via process.env
const config: ExpoConfig = {
  name: "RooMe2.0",
  slug: "RooMe2.0",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "roome20",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  extra: {
    // Only expose safe/needed values to the client
    // WARNING: Values in extra are bundled in the client - expose only what must be public
    apiBaseUrl: process.env.API_BASE_URL ?? "",
    googleMapsKey: process.env.GOOGLE_MAPS_KEY ?? "",
    sentryDsn: process.env.SENTRY_DSN ?? "",
    firebase: {
      apiKey: "",
      authDomain: "",
      projectId: "",
      appId: "",
    },
  },
};

export default config;

