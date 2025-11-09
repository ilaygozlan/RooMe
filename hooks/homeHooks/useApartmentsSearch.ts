import { useCallback, useRef, useState } from "react";
import type { Apartment } from "@/context/ApartmentsContext";
import {
  hasGardenOrBalcony,
  normalizeString,
  extractCityFromAddress,
  extractStreetFromAddress,
  getDistance,
} from "@/utils/location";

export type LocationSuggest = {
  address: string;
  latitude?: number;
  longitude?: number;
  types?: string[];
};

export type FiltersJson = {
  entryDate: string | null;
  exitDate: string | null;
  gender: string | null;
  filters: string[];
  icons: string[];
};

export function useApartmentsSearch(base: Apartment[]) {
  const initializedRef = useRef(false);

  const [previewSearchApt, setPreviewSearchApt] = useState<Apartment[]>([]);
  const [index, setIndex] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggest | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 10000]);
  const [filtersJson, setFiltersJson] = useState<FiltersJson>({
    entryDate: null,
    exitDate: null,
    gender: null,
    filters: [],
    icons: [],
  });

  const showAll = useCallback((arr: Apartment[]) => setPreviewSearchApt(arr), []);

  const resetAfterRefresh = useCallback(() => {
    initializedRef.current = false;
    setPreviewSearchApt([]);
  }, []);

  const SearchApartments = useCallback(
    (arr?: Apartment[]) => {
      const source = Array.isArray(arr) ? arr : base;
      if (!Array.isArray(source)) return;

      const filtered = source.filter((apt): boolean => {
        const matchesType = selectedType === null || apt.ApartmentType === selectedType;

        const aptPrice = typeof apt.Price === "string" ? parseInt(apt.Price) : apt.Price || 0;
        const matchesPrice = aptPrice >= priceRange[0] && aptPrice <= priceRange[1];

        // location parsing
        let matchesLocation = true;
        let aptLocationObj: { address?: string; latitude?: number | null; longitude?: number | null } = {};

        if (apt.Location && typeof apt.Location === "string" && apt.Location.trim().startsWith("{") && apt.Location.trim().endsWith("}")) {
          try {
            aptLocationObj = JSON.parse(apt.Location);
          } catch {}
        } else if (apt.Location) {
          aptLocationObj = { address: typeof apt.Location === "string" ? apt.Location : "", latitude: null, longitude: null };
        }

        if (selectedLocation?.address) {
          const locationTypes = selectedLocation?.types || [];
          const city = extractCityFromAddress(selectedLocation.address);
          const street = extractStreetFromAddress(selectedLocation.address);

          if (locationTypes.includes("country")) {
            matchesLocation = true;
          } else if (locationTypes.includes("locality")) {
            const normalizedCity = normalizeString(city);
            matchesLocation = !!aptLocationObj.address && normalizeString(aptLocationObj.address).includes(normalizedCity);
          } else if (locationTypes.includes("sublocality")) {
            const normalizedAddress = normalizeString(selectedLocation.address);
            const normalizedCity = normalizeString(city);
            matchesLocation = (!!aptLocationObj.address && normalizeString(aptLocationObj.address).includes(normalizedAddress)) || (!!aptLocationObj.address && normalizeString(aptLocationObj.address).includes(normalizedCity));
          } else if (locationTypes.includes("street_address")) {
            const normalizedStreet = normalizeString(street);
            matchesLocation = (!!aptLocationObj.address && normalizeString(aptLocationObj.address).includes(normalizedStreet)) ||
              (aptLocationObj.latitude != null &&
                aptLocationObj.longitude != null &&
                selectedLocation.latitude != null &&
                selectedLocation.longitude != null &&
                getDistance(
                  selectedLocation.latitude,
                  selectedLocation.longitude,
                  aptLocationObj.latitude,
                  aptLocationObj.longitude
                ) < 0.5);
          }
        }

        const f = filtersJson;
        if (!f) return matchesType && matchesPrice && matchesLocation;

        if (f.entryDate && f.exitDate) {
          const entry = new Date(f.entryDate);
          const exit = new Date(f.exitDate);
          const aptEntry = apt.EntryDate ? new Date(apt.EntryDate) : null;
          const aptExit = apt.ExitDate ? new Date(apt.ExitDate) : null;
          const isAvailable = (!aptEntry || aptEntry <= entry) && (!aptExit || aptExit >= exit);
          if (!isAvailable) return false;
        }

        if (f.gender && f.gender !== "אין העדפה") {
          const genderCode = f.gender === "רק גברים" ? "Male" : "Female";
          if (apt.ApartmentType === 1 && apt.Roommates) {
            const roommates = apt.Roommates.split("||");
            const allMatch = roommates.every((r) => r.includes(`Gender:${genderCode}`) || r.includes(`Gender: ${genderCode}`));
            if (!allMatch) return false;
          }
        }

        const generalFilters = f.filters || [];
        for (const gf of generalFilters) {
          if (gf === "מאפשרים חיות מחמד" && apt.AllowPet === false) return false;
          if (gf === "מותר לעשן" && apt.AllowSmoking === false) return false;
          if (gf === "חצר / מרפסת" && !hasGardenOrBalcony(apt)) return false;
          if (gf === "חניה") {
            const n = typeof apt.ParkingSpace === "number" ? apt.ParkingSpace : parseInt(String(apt.ParkingSpace));
            if (!n || n <= 0) return false;
          }
          if (gf === "ביטול ללא קנס" && apt.Sublet_CanCancelWithoutPenalty !== true) return false;
          if (gf === "מרוהטת") {
            try {
              const labels = JSON.parse(apt.LabelsJson || "[]") as Array<{ value?: string } | string>;
              const labelValues = labels.map((l) => (typeof l === "string" ? l : l.value)).filter(Boolean) as string[];
              if (!labelValues.includes("couch")) return false;
            } catch {}
          }
        }

        const icons = f.icons || [];
        if (icons.length > 0) {
          try {
            const labels = JSON.parse(apt.LabelsJson || "[]") as Array<{ value?: string } | string>;
            const labelValues = labels.map((l) => (typeof l === "string" ? l : l.value)).filter(Boolean) as string[];
            for (const icon of icons) if (!labelValues.includes(icon)) return false;
          } catch {
            return false;
          }
        }

        return matchesType && matchesPrice && matchesLocation;
      });

      setPreviewSearchApt(filtered);
      setIndex(false);
    },
    [base, filtersJson, priceRange, selectedLocation, selectedType]
  );

  return {
    state: {
      previewSearchApt,
      index,
      selectedType,
      selectedLocation,
      priceRange,
      filtersJson,
    },
    actions: {
      setIndex,
      setSelectedType,
      setSelectedLocation,
      setPriceRange,
      setFiltersJson,
      SearchApartments,
      showAll,
      resetAfterRefresh,
    },
    initializedRef,
  } as const;
}
