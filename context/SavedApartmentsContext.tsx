// context/SavedApartmentsContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { type Apartment } from "./ApartmentsContext";
import { ENV } from "@/src/config/env";
import { useAuth } from "@/lib/auth/AuthContext";

// ---------- Types ----------
type SavedApartmentsContextValue = {
  savedApartmentIds: Set<number>;
  savedApartments: Apartment[];
  isLoading: boolean;
  error?: string;
  isSaved: (apartmentId: number) => boolean;
  toggleSaved: (apartmentId: number, apartment?: Apartment) => Promise<void>;
  loadSavedApartments: () => Promise<void>;
  refreshSavedApartments: () => Promise<void>;
};

const SavedApartmentsContext = createContext<SavedApartmentsContextValue | null>(
  null
);

// ---------- Provider ----------
export const SavedApartmentsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [savedApartmentIds, setSavedApartmentIds] = useState<Set<number>>(
    new Set()
  );
  const [savedApartments, setSavedApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Load saved apartments from API or localStorage
  const loadSavedApartments = useCallback(async () => {
    if (!user?.id) {
      setSavedApartmentIds(new Set());
      setSavedApartments([]);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Try API first
      if (ENV.apiBaseUrl) {
        const response = await fetch(
          `${ENV.apiBaseUrl}/SavedApartment/GetByUser/${user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          const ids = Array.isArray(data)
            ? data.map((item: any) => item.ApartmentID || item.apartmentId)
            : [];
          setSavedApartmentIds(new Set(ids));
          // If we have apartment data, use it; otherwise just store IDs
          if (Array.isArray(data) && data[0]?.ApartmentID) {
            setSavedApartments(data as Apartment[]);
          }
          setIsLoading(false);
          return;
        }
      }

      // Fallback to SecureStore for development
      try {
        const stored = await SecureStore.getItemAsync(
          `saved_apartments_${user.id}`
        );
        if (stored) {
          const ids = JSON.parse(stored) as number[];
          setSavedApartmentIds(new Set(ids));
        } else {
          setSavedApartmentIds(new Set());
        }
      } catch (storeErr) {
        // Ignore SecureStore errors
        setSavedApartmentIds(new Set());
      }
    } catch (err: any) {
      console.error("Error loading saved apartments:", err);
      setError(err?.message || "Failed to load saved apartments");
      
      // Fallback to SecureStore
      try {
        const stored = await SecureStore.getItemAsync(
          `saved_apartments_${user.id}`
        );
        if (stored) {
          const ids = JSON.parse(stored) as number[];
          setSavedApartmentIds(new Set(ids));
        }
      } catch (e) {
        // Ignore SecureStore errors
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save/unsave apartment
  const toggleSaved = useCallback(
    async (apartmentId: number, apartment?: Apartment) => {
      if (!user?.id) return;

      const isCurrentlySaved = savedApartmentIds.has(apartmentId);
      const newSaved = !isCurrentlySaved;

      // Optimistic update
      setSavedApartmentIds((prev) => {
        const next = new Set(prev);
        if (newSaved) {
          next.add(apartmentId);
        } else {
          next.delete(apartmentId);
        }
        return next;
      });

      // Update saved apartments list
      if (apartment) {
        setSavedApartments((prev) => {
          if (newSaved) {
            // Add apartment if not already in list
            if (!prev.find((a) => a.ApartmentID === apartmentId)) {
              return [...prev, apartment];
            }
            return prev;
          } else {
            // Remove apartment from list
            return prev.filter((a) => a.ApartmentID !== apartmentId);
          }
        });
      }

      // Persist to API or localStorage
/*       try {
        if (ENV.apiBaseUrl) {
          const method = newSaved ? "POST" : "DELETE";
          const response = await fetch(
            `${ENV.apiBaseUrl}/SavedApartment/${newSaved ? "Save" : "Unsave"}`,
            {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                apartmentId,
              }),
            }
          );
          if (!response.ok) throw new Error("Failed to update saved status");
        } else {
          // Fallback to SecureStore
          const ids = Array.from(savedApartmentIds);
          if (newSaved) {
            ids.push(apartmentId);
          } else {
            const index = ids.indexOf(apartmentId);
            if (index > -1) ids.splice(index, 1);
          }
          await SecureStore.setItemAsync(
            `saved_apartments_${user.id}`,
            JSON.stringify(ids)
          );
        }
      } catch (err: any) {
        console.error("Error toggling saved status:", err);
        // Revert optimistic update on error
        setSavedApartmentIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlySaved) {
            next.add(apartmentId);
          } else {
            next.delete(apartmentId);
          }
          return next;
        });
        if (apartment) {
          setSavedApartments((prev) => {
            if (isCurrentlySaved) {
              if (!prev.find((a) => a.ApartmentID === apartmentId)) {
                return [...prev, apartment];
              }
            } else {
              return prev.filter((a) => a.ApartmentID !== apartmentId);
            }
            return prev;
          });
        }
      } */
    },
    [user?.id, savedApartmentIds]
  );

  // Check if apartment is saved
  const isSaved = useCallback(
    (apartmentId: number) => {
      return savedApartmentIds.has(apartmentId);
    },
    [savedApartmentIds]
  );

  // Refresh saved apartments
  const refreshSavedApartments = useCallback(async () => {
    await loadSavedApartments();
  }, [loadSavedApartments]);

  // Load on mount and when user changes
  useEffect(() => {
    loadSavedApartments();
  }, [loadSavedApartments]);

  // ---------- Value ----------
  const value = useMemo<SavedApartmentsContextValue>(
    () => ({
      savedApartmentIds,
      savedApartments,
      isLoading,
      error,
      isSaved,
      toggleSaved,
      loadSavedApartments,
      refreshSavedApartments,
    }),
    [
      savedApartmentIds,
      savedApartments,
      isLoading,
      error,
      isSaved,
      toggleSaved,
      loadSavedApartments,
      refreshSavedApartments,
    ]
  );

  return (
    <SavedApartmentsContext.Provider value={value}>
      {children}
    </SavedApartmentsContext.Provider>
  );
};

// ---------- Hook ----------
export function useSavedApartments() {
  const ctx = useContext(SavedApartmentsContext);
  if (!ctx) {
    // Return a safe fallback instead of throwing
    // This allows the component to work even if provider is not available
    return {
      savedApartmentIds: new Set<number>(),
      savedApartments: [],
      isLoading: false,
      error: undefined,
      isSaved: () => false,
      toggleSaved: async () => {},
      loadSavedApartments: async () => {},
      refreshSavedApartments: async () => {},
    };
  }
  return ctx;
}

