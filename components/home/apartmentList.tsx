import React, { useCallback } from "react";
import { FlatList, View, Text, ListRenderItemInfo } from "react-native";
import ApartmentCard from "@/components/apartment/apartmentCard";
import type { Apartment } from "@/context/ApartmentsContext";

export type ApartmentListProps = {
  data: Apartment[];
  hideIcons?: boolean;
  isLoading: boolean;
  emptyText?: string;
  contentPaddingTop?: number;
  onEndReached?: () => void;
  onRefresh?: () => void;
  onScroll?: (e: any) => void;
};

export const ApartmentList: React.FC<ApartmentListProps> = ({
  data,
  hideIcons,
  isLoading,
  emptyText = "",
  contentPaddingTop = 145,
  onEndReached,
  onRefresh,
  onScroll,
}) => {
  const keyExtractor = useCallback((apt: Apartment) => String(apt.ApartmentID), []);

  const renderItem = useCallback(
    ({ item: apt }: ListRenderItemInfo<Apartment>) => (
      <ApartmentCard
        apartment={apt}
        hideIcons={hideIcons}
        onPress={(apartment) => (globalThis as any).__openAptDetails__?.(apartment)}
      />
    ),
    [hideIcons]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingTop: contentPaddingTop,
        paddingBottom: 24,
        backgroundColor: "#F0F0F0",
        flexGrow: 1,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      onMomentumScrollBegin={() => {
        // reset guard in useHideOnScroll
        (globalThis as any).__resetLoadGuard__?.();
      }}
      ListEmptyComponent={
        !isLoading && data.length === 0 ? (
          <View style={{ paddingTop: 180, alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: "#333" }}>{emptyText}</Text>
          </View>
        ) : null
      }
      refreshing={isLoading && data.length === 0}
      onRefresh={onRefresh}
    />
  );
};

