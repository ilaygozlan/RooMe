import { getDistance } from "./location";

export type NearbyPlace = {
  name: string;
  type: "campus" | "supermarket" | "nightlife" | "fitness";
  distance: number; // in kilometers
  walkingTime: string; // formatted walking time
  icon: string;
  label: string;
};

// Google Places API types
type GooglePlaceResult = {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
  distance?: number; // if provided by API
};

type GooglePlacesResponse = {
  results: GooglePlaceResult[];
  status: string;
  error_message?: string;
};

// Place type mappings for Google Places API
const PLACE_TYPE_MAP: Record<string, { query: string; types: string[] }> = {
  campus: {
    query: "university|college|school",
    types: ["university", "school"],
  },
  supermarket: {
    query: "supermarket|grocery_store",
    types: ["supermarket", "grocery_or_supermarket"],
  },
  nightlife: {
    query: "bar|night_club|restaurant",
    types: ["bar", "night_club", "restaurant"],
  },
  fitness: {
    query: "gym|fitness|sports",
    types: ["gym", "health", "sports_complex"],
  },
};

// Calculate walking time from distance (km)
// Average walking speed: 5 km/h = 0.083 km/min
function calculateWalkingTime(distanceKm: number): string {
  const minutes = Math.round(distanceKm / 0.083);
  if (minutes < 1) return "פחות מדקה";
  if (minutes === 1) return "דקה אחת";
  return `${minutes} דק'`;
}

// Fetch nearby places from Google Places API
export async function fetchNearbyPlaces(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<NearbyPlace[]> {
  const amenities: NearbyPlace[] = [];
  const radius = 2000; // 2km radius

  // Fetch each type of amenity
  const placeTypes: Array<{ type: NearbyPlace["type"]; label: string; icon: string }> = [
    { type: "campus", label: "קמפוס", icon: "school" },
    { type: "supermarket", label: "סופרמרקט", icon: "cart" },
    { type: "nightlife", label: "חיי לילה", icon: "beer" },
    { type: "fitness", label: "כושר", icon: "barbell" },
  ];

  for (const { type, label, icon } of placeTypes) {
    try {
      const config = PLACE_TYPE_MAP[type];
      if (!config) continue;

      // Use the first type for the search
      const typeQuery = config.types[0];
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${typeQuery}&key=${apiKey}&language=he`;

      const response = await fetch(url);
      const data: GooglePlacesResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        // Find the closest place
        let closestPlace: GooglePlaceResult | null = null;
        let minDistance = Infinity;

        for (const place of data.results) {
          const distance = getDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestPlace = place;
          }
        }

        if (closestPlace && minDistance < Infinity) {
          amenities.push({
            name: closestPlace.name,
            type,
            distance: minDistance,
            walkingTime: calculateWalkingTime(minDistance),
            icon,
            label,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      // Continue with other types even if one fails
    }
  }

  // Sort by distance
  return amenities.sort((a, b) => a.distance - b.distance);
}

// Fallback: Return default amenities if API fails or no key
export function getDefaultAmenities(): NearbyPlace[] {
  return [
    { type: "campus", label: "קמפוס", icon: "school", distance: 1.25, walkingTime: "15 דק'", name: "" },
    { type: "supermarket", label: "סופרמרקט", icon: "cart", distance: 0.17, walkingTime: "2 דק'", name: "" },
    { type: "nightlife", label: "חיי לילה", icon: "beer", distance: 0.17, walkingTime: "2 דק'", name: "" },
    { type: "fitness", label: "כושר", icon: "barbell", distance: 0.17, walkingTime: "2 דק'", name: "" },
  ];
}

