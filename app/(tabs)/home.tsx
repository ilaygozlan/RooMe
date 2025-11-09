import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import { useApartments, type Apartment } from "@/context/ApartmentsContext";
import ApartmentDetails from "@/components/apartment/apartmentDetails";
import HouseLoading from "@/components/ui/loadingHouseSign";


import { SearchHeader } from "@/components/home/searchHeader";
import { ApartmentList } from "@/components/home/apartmentList";
import { LoadingSection } from "@/components/home/loadingSection";
import { useHideOnScroll } from "@/hooks/homeHooks/useHideOnScroll";
import {
useApartmentsSearch,
type FiltersJson,
type LocationSuggest,
} from "@/hooks/homeHooks/useApartmentsSearch";


export type ApartmentProps = { hideIcons?: boolean };

export default function HomeScreen(props: ApartmentProps) {
  const { top } = useSafeAreaInsets();
  const { home, loadHomeFirstPage, loadHomeNextPage, getApartmentsByIds } =
    useApartments();

  // First-load bootstrap (one time)
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    loadHomeFirstPage();
  }, [loadHomeFirstPage]);

  // Base list – source of truth from context ids
  const baseApartments = useMemo(
    () => getApartmentsByIds(home.ids),
    [home.ids, getApartmentsByIds]
  );

  // Search / filters state and derived results
  const {
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
  } = useApartmentsSearch(baseApartments);

  // Hide-on-scroll animation state and handlers
  const {
    translateY,
    onScroll,
    onMomentumScrollBegin,
    canLoadMore,
    markHasScrolled,
    resetScrollFlags,
  } = useHideOnScroll({ hideDistance: 150 });

  // Keep list in sync when baseApartments grows (pagination)
  useEffect(() => {
    if (!initializedRef.current && baseApartments.length > 0) {
      showAll(baseApartments);
      initializedRef.current = true;
      resetScrollFlags();
    } else if (initializedRef.current && index) {
      showAll(baseApartments);
    }
  }, [baseApartments, index, initializedRef, resetScrollFlags, showAll]);

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <SearchHeader
        topInset={top}
        translateY={translateY}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        filtersJson={filtersJson}
        setFiltersJson={setFiltersJson}
        index={index}
        setIndex={setIndex}
        SearchApartments={() => SearchApartments(baseApartments)}
        showAll={() => showAll(baseApartments)}
      />

      <ApartmentList
        data={previewSearchApt}
        hideIcons={props.hideIcons}
        isLoading={home.loading}
        emptyText="לא נמצאו דירות..."
        contentPaddingTop={145}
        onScroll={(e) => {
          onScroll(e);
          if (e.nativeEvent.contentOffset.y > 0) markHasScrolled();
        }}
        onEndReached={() => {
          if (!home.hasMore || home.loading) return;
          if (!canLoadMore()) return; // protects multiple triggers
          loadHomeNextPage();
        }}
        onRefresh={() => {
          initializedRef.current = false;
          resetScrollFlags();
          resetAfterRefresh();
          loadHomeFirstPage();
        }}
      />

      {/* Loading overlays */}
      {home.loading && previewSearchApt.length > 0 && (
        <LoadingSection text="טוען דירות נוספות..." />
      )}
      {home.loading && previewSearchApt.length === 0 && (
        <HouseLoading text="טוען דירות..." overlay={true} />
      )}

      {/* Details modal */}
      <DetailsPortal />
    </View>
  );
}

// A tiny portal that renders the modal; keeps HomeScreen lean
function DetailsPortal() {
  const [visible, setVisible] = useState(false);
  const [apt, setApt] = useState<Apartment | null>(null);

  // Render prop would be cleaner; kept simple for drop-in use
  (globalThis as any).__openAptDetails__ = (apartment: Apartment) => {
    setApt(apartment);
    setVisible(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        setVisible(false);
        setApt(null);
      }}
    >
      {apt && (
        <ApartmentDetails
          key={apt.ApartmentID}
          apt={apt}
          onClose={() => {
            setVisible(false);
            setApt(null);
          }}
        />
      )}
    </Modal>
  );
}