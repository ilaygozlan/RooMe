// app/(tabs)/saved.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ApartmentCard from "@/components/apartment/apartmentCard";
import ApartmentDetails from "@/components/apartment/apartmentDetails";
import HouseLoading from "@/components/ui/loadingHouseSign";
import { useApartments, type Apartment } from "@/context/ApartmentsContext";
import { useSavedApartments } from "@/context/SavedApartmentsContext";
import { useAuth } from "@/lib/auth/AuthContext";

const windowWidth = Dimensions.get("window").width;
const CARD_MARGIN = 10;
const CARDS_PER_ROW = 2;
const CARD_WIDTH =
  (windowWidth - CARD_MARGIN * (CARDS_PER_ROW + 1)) / CARDS_PER_ROW;

export default function SavedApartmentsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const {
    savedApartmentIds,
    savedApartments: savedFromContext,
    isLoading,
    refreshSavedApartments,
  } = useSavedApartments();
  const { entities, getApartmentsByIds } = useApartments();
  const [refreshing, setRefreshing] = useState(false);

  // Get full apartment data for saved IDs
  const savedApartments = useMemo(() => {
    const ids = Array.from(savedApartmentIds).map(String);
    const fromContext = getApartmentsByIds(ids);
    
    // Merge with saved apartments from context (in case they have more data)
    const merged = new Map<number, Apartment>();
    fromContext.forEach((apt) => merged.set(apt.ApartmentID, apt));
    savedFromContext.forEach((apt) => merged.set(apt.ApartmentID, apt));
    
    return Array.from(merged.values());
  }, [savedApartmentIds, savedFromContext, getApartmentsByIds, entities]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSavedApartments();
    setRefreshing(false);
  }, [refreshSavedApartments]);

  const handleCardPress = useCallback((apartment: Apartment) => {
    (globalThis as any).__openAptDetails__?.(apartment);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Apartment }) => (
      <View style={styles.cardWrapper}>
        <ApartmentCard
          apartment={item}
          hideIcons={false}
          onPress={handleCardPress}
        />
      </View>
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback(
    (item: Apartment) => `saved-${item.ApartmentID}`,
    []
  );

  if (isLoading && savedApartments.length === 0) {
    return <HouseLoading text="טוען דירות שמורות..." overlay={true} />;
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>דירות שמורות</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{savedApartments.length}</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      {savedApartments.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="bookmark-outline"
            size={80}
            color="#E3965A"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>אין דירות שמורות</Text>
          <Text style={styles.emptyText}>
            {user
              ? "שמור דירות שאתה מעוניין בהן כדי לראות אותן כאן"
              : "התחבר כדי לשמור דירות"}
          </Text>
          {user && (
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text style={styles.exploreButtonText}>גלה דירות</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={savedApartments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={1}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E3965A"
              colors={["#E3965A"]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            savedApartments.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  סה"כ {savedApartments.length} דירות שמורות
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Apartment Details Portal */}
      <DetailsPortal />
    </View>
  );
}

// Apartment details portal
function DetailsPortal() {
  const [visible, setVisible] = useState(false);
  const [apt, setApt] = useState<Apartment | null>(null);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  countBadge: {
    backgroundColor: "#E3965A",
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    shadowColor: "#E3965A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  countText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  listContent: {
    padding: CARD_MARGIN,
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: CARD_MARGIN,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: "#E3965A",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#E3965A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

