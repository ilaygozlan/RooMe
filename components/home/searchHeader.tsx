import React from "react";
import { Animated, StyleSheet } from "react-native";
import SearchBar from "@/components/home/searchBar";
import type { FiltersJson, LocationSuggest } from "@/hooks/homeHooks/useApartmentsSearch";

export type SearchHeaderProps = {
  topInset: number;
  translateY: Animated.AnimatedInterpolation<number> | Animated.Value;
  selectedType: number | null;
  setSelectedType: (v: number | null) => void;
  selectedLocation: LocationSuggest | null;
  setSelectedLocation: (v: LocationSuggest | null) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  filtersJson: FiltersJson;
  setFiltersJson: (v: FiltersJson) => void;
  index: boolean;
  setIndex: (v: boolean) => void;
  SearchApartments: () => void;
  showAll: () => void;
};

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  topInset,
  translateY,
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  priceRange,
  setPriceRange,
  filtersJson,
  setFiltersJson,
  index,
  setIndex,
  SearchApartments,
  showAll,
}) => {
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { top: topInset },
        { transform: [{ translateY }] },
      ]}
    >
      <SearchBar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        SearchApartments={SearchApartments}
        filtersJson={filtersJson}
        setFiltersJson={setFiltersJson}
        index={index}
        setIndex={setIndex}
        showAllApartments={showAll}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
});
