import React, { useState, useContext, useEffect, useCallback } from "react";
import { TouchableOpacity, Alert, StyleSheet, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import API from "../config";
//import { userInfoContext } from "../contex/userInfoContext";
//import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";

// -------- Types --------
type Props = {
  apartmentId: number | string;
  numOfLikes: number;
  isLikedByUser: boolean;
};

type UserInfoCtx = {
  loginUserId?: number | string | null;
};

type ApartmentSummary = {
  ApartmentID: number | string;
  IsLikedByUser?: boolean;
  // ... other fields are irrelevant here
};

type ActiveApartmentCtx = {
  allApartments: ApartmentSummary[];
  setAllApartments: (a: ApartmentSummary[]) => void;
  triggerFavoritesRefresh: () => void;
};

// -------- Component --------
export default function LikeButton({
  apartmentId,
  numOfLikes,
  isLikedByUser,
}: Props) {
  const { loginUserId } = useContext(userInfoContext) as UserInfoCtx;
  const { allApartments, setAllApartments, triggerFavoritesRefresh } =
    useContext(ActiveApartmentContext) as ActiveApartmentCtx;

  const [liked, setLiked] = useState<boolean>(isLikedByUser);
  const [likesCount, setLikesCount] = useState<number>(numOfLikes);
  const [pending, setPending] = useState<boolean>(false);

  // keep internal state in sync with prop changes
  useEffect(() => setLiked(isLikedByUser), [isLikedByUser]);
  useEffect(() => setLikesCount(numOfLikes), [numOfLikes]);

  // ---- helpers to update context ----
  const setApartmentLikedByUser = useCallback(
    (id: number | string, value: boolean) => {
      const updated = allApartments.map((apt) =>
        apt.ApartmentID === id ? { ...apt, IsLikedByUser: value } : apt
      );
      setAllApartments(updated);
      triggerFavoritesRefresh();
    },
    [allApartments, setAllApartments, triggerFavoritesRefresh]
  );

  // ---- server calls ----
  const likeApartment = async (userId: number | string, id: number | string) => {
    const res = await fetch(`${API}User/LikeApartment/${userId}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to like apartment");
  };

  const unlikeApartment = async (userId: number | string, id: number | string) => {
    const res = await fetch(`${API}User/RemoveLikeApartment/${userId}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to unlike apartment");
  };

  // ---- click handler with optimistic update + rollback ----
  const handlePress = async () => {
    if (!loginUserId) {
      Alert.alert("שגיאה", "עליך להתחבר לפני ביצוע לייק");
      return;
    }
    if (pending) return;

    const nextLiked = !liked;
    const prevLiked = liked;
    const prevCount = likesCount;

    // optimistic UI
    setPending(true);
    setLiked(nextLiked);
    setLikesCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    setApartmentLikedByUser(apartmentId, nextLiked);

    try {
      if (nextLiked) {
        await likeApartment(loginUserId, apartmentId);
      } else {
        await unlikeApartment(loginUserId, apartmentId);
      }
      // success – keep optimistic state
    } catch (err) {
      // rollback UI + context on failure
      console.error("Like action failed:", err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
      setApartmentLikedByUser(apartmentId, prevLiked);

      Alert.alert("שגיאה", nextLiked ? "לא ניתן לעשות לייק לדירה" : "שגיאה בהסרת לייק לדירה");
    } finally {
      setPending(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={pending}>
      <View style={styles.container}>
        <FontAwesome
          name={liked ? "heart" : "heart-o"}
          size={24}
          color={liked ? "red" : "gray"}
        />
        <Text style={styles.countText}>{likesCount}</Text>
        {pending ? <Text style={styles.pending}>…</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

// -------- Styles --------
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countText: {
    fontSize: 14,
    color: "gray",
  },
  pending: {
    fontSize: 14,
    color: "#aaa",
  },
});
