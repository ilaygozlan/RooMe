// UserProfile.tsx
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
/* import { userInfoContext } from "./contex/userInfoContext";
import UserOwnedApartmentsGrid from "./UserOwnedApartmentsGrid";
import LogoutButton from "./components/LogoutButton";
import API from "../config"; */

// ---------- Theme (Roome-ish) ----------
const COLORS = {
  primary: "#2661A1", // Roome blue
  accent: "#FF7A00", // Roome orange
  background: "#F4F6FB",
  cardBg: "#FFFFFF",
  textMain: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  chipBg: "#E0ECF8",
  chipText: "#1E3A8A",
};

// ---------- Types ----------
interface UserProfileData {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string; // "M" | "F" | etc.
  birthDate: string;
  ownPet: boolean;
  smoke: boolean;
  jobStatus: string;
  profilePicture?: string | null;
}

interface Friend {
  id: number;
  fullName: string;
  profilePicture?: string | null;
}

interface UserProfileProps {
  userId?: number | string;
  onClose?: () => void;
  onAddFriend?: (user: UserProfileData) => void;
  onRemoveFriend?: (userId: number | string) => void;
}

// ---------- MOCK DATA ----------
const MOCK_USER: UserProfileData = {
  id: 1,
  fullName: "עילאי גוזלן",
  email: "ilay@example.com",
  phoneNumber: "050-1234567",
  gender: "M",
  birthDate: "1998-02-16T00:00:00",
  ownPet: true,
  smoke: false,
  jobStatus: "מפתח תוכנה בסטארטאפ",
  profilePicture: "https://www.w3schools.com/howto/img_avatar.png",
};

const MOCK_FRIENDS: Friend[] = [
  {
    id: 2,
    fullName: "נועה לוי",
    profilePicture: "https://www.w3schools.com/howto/img_avatar2.png",
  },
  {
    id: 3,
    fullName: "דניאל כהן",
    profilePicture: "https://www.w3schools.com/howto/img_avatar.png",
  },
];

const UserProfile: React.FC<UserProfileProps> = (props) => {
  /*   const { loginUserId } = useContext(userInfoContext) as {
    loginUserId: number | string;
  }; */
  const loginUserId = 1;
  const API = ""; // אם נשאר ריק – נשתמש ב-MOCK

  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const finalUserId: number | string | undefined =
    props.userId ?? (userId ? Number(userId) || userId : undefined);

  const isMyProfile = finalUserId == loginUserId;

  const router = useRouter();

  const [showFriendProfile, setFriendProfile] = useState(false);
  const [selectedFriendId, setFriendId] = useState<number | string | null>(
    null
  );
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<
    Partial<UserProfileData>
  >({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isFriend, setIsFriend] = useState(false);

  // --- Load user profile (with MOCK fallback) ---
  useEffect(() => {
    if (!finalUserId) return;

    if (!API) {
      const mockUser: UserProfileData = {
        ...MOCK_USER,
        id: Number(finalUserId) || 1,
      };
      setUserProfile(mockUser);
      setUpdatedProfile(mockUser);
      setLoading(false);
      return;
    }

    fetch(API + "User/GetUserById/" + finalUserId)
      .then((res) => {
        if (!res.ok) throw new Error("שגיאה בטעינת פרופיל");
        return res.json();
      })
      .then((data: UserProfileData) => {
        setUserProfile(data);
        setUpdatedProfile(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  }, [API, finalUserId]);

  // --- Load friends (with MOCK fallback) ---
  useEffect(() => {
    if (!finalUserId) return;

    if (!API) {
      setFriends(MOCK_FRIENDS);
      setIsFriend(MOCK_FRIENDS.some((f) => f.id === loginUserId));
      return;
    }

    fetch(API + "User/GetUserFriends/" + finalUserId)
      .then((res) => res.json())
      .then((data: Friend[]) => {
        setFriends(data);
        setIsFriend(data.some((f) => f.id === loginUserId));
      })
      .catch((err) => console.error("שגיאה בטעינת חברים", err));
  }, [API, finalUserId, loginUserId]);

  const handleFriendToggle = () => {
    if (!finalUserId) return;

    if (!API) {
      setIsFriend((prev) => !prev);
      return;
    }

    if (isFriend) {
      fetch(`${API}User/RemoveFriend/${loginUserId}/${finalUserId}`, {
        method: "DELETE",
      })
        .then(() => {
          setIsFriend(false);
          if (props.onRemoveFriend) {
            props.onRemoveFriend(finalUserId);
          }
        })
        .catch((err) => console.error("שגיאה בהסרת חבר", err));
    } else {
      fetch(`${API}User/AddFriend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID1: loginUserId,
          userID2: finalUserId,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("שגיאה בהוספת חבר");
          return res.text();
        })
        .then(() => {
          setIsFriend(true);
          if (props.onAddFriend && userProfile) {
            props.onAddFriend(userProfile);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleSave = async () => {
    const updatedUser = { ...updatedProfile, id: loginUserId };

    if (!API) {
      console.log("MOCK: profile updated", updatedUser);
      setModalVisible(false);
      return;
    }

    try {
      const res = await fetch(API + "User/UpdateUserDetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      console.log("✔️ profile updated");
      setModalVisible(false);
    } catch (err) {
      console.error("❌", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>שגיאה: {error?.message}</Text>
      </View>
    );
  }

  const headerTitle = isMyProfile
    ? "החברים שלי"
    : userProfile?.fullName
    ? `החברים של ${userProfile.fullName}`
    : "החברים";

  const genderLabel = userProfile.gender === "F" ? "נקבה" : "זכר";
  const petLabel = userProfile.ownPet ? "בעל חיית מחמד" : "אין חיית מחמד";
  const smokeLabel = userProfile.smoke ? "מעשן" : "לא מעשן";

  return (
    <View style={styles.screen}>
      {/* Blue top background */}
      <View style={styles.headerBackground} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBackButton}
          onPress={() => {
            if (props.onClose) props.onClose();
            else router.back();
          }}
        >
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {isMyProfile ? "הפרופיל שלי" : "פרופיל משתמש"}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={
                userProfile.profilePicture
                  ? { uri: userProfile.profilePicture }
                  : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
              }
              style={styles.profileImage}
            />
          </View>

          {/* Name + job */}
          <Text style={styles.profileName}>{userProfile.fullName}</Text>
          {!!userProfile.jobStatus && (
            <Text style={styles.profileJob}>{userProfile.jobStatus}</Text>
          )}

          {/* Lifestyle chips */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <FontAwesome5 name="venus-mars" size={12} color={COLORS.chipText} />
              <Text style={styles.chipText}>{genderLabel}</Text>
            </View>
            <View style={styles.chip}>
              <FontAwesome5 name="dog" size={12} color={COLORS.chipText} />
              <Text style={styles.chipText}>{petLabel}</Text>
            </View>
            <View style={styles.chip}>
              <FontAwesome5 name="smoking" size={12} color={COLORS.chipText} />
              <Text style={styles.chipText}>{smokeLabel}</Text>
            </View>
          </View>

          {/* Action buttons */}
          {!isMyProfile && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.friendButton]}
                onPress={handleFriendToggle}
              >
                <FontAwesome5
                  name={isFriend ? "user-minus" : "user-plus"}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>
                  {isFriend ? "הסר מחברים" : "הוסף לחברים"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.chatButton]}
                onPress={() =>
                  router.push({
                    pathname: "ChatRoom",
                    params: { recipientId: finalUserId },
                  })
                }
              >
                <FontAwesome5 name="comments" size={14} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>הודעה</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>פרטי קשר</Text>
          <View style={styles.infoGrid}>
            <InfoCard
              icon={
                <FontAwesome5 name="envelope" size={16} color={COLORS.primary} />
              }
              label="אימייל"
              value={userProfile.email}
            />
            <InfoCard
              icon={
                <FontAwesome5 name="phone" size={16} color={COLORS.primary} />
              }
              label="טלפון"
              value={userProfile.phoneNumber}
            />
            <InfoCard
              icon={
                <FontAwesome5
                  name="birthday-cake"
                  size={16}
                  color={COLORS.primary}
                />
              }
              label="תאריך לידה"
              value={new Date(userProfile.birthDate).toLocaleDateString(
                "he-IL"
              )}
            />
          </View>
        </View>

        {/* Friends */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeaderRow}>
            <Text style={styles.sectionTitle}>{headerTitle}</Text>
            {friends.length > 0 && (
              <Text style={styles.friendsCount}>{friends.length} חברים</Text>
            )}
          </View>

          {friends.length === 0 ? (
            <View style={styles.emptyFriendsCard}>
              <Text style={styles.emptyFriendsTitle}>אין חברים כרגע</Text>
              <Text style={styles.emptyFriendsText}>
                ברגע שתוסיפו חברים, הם יופיעו כאן 💙
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsScrollContent}
            >
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendCard}
                  onPress={() => {
                    setFriendProfile(true);
                    setFriendId(friend.id);
                  }}
                >
                  <Image
                    source={{
                      uri:
                        friend.profilePicture ||
                        "https://www.w3schools.com/howto/img_avatar.png",
                    }}
                    style={styles.friendCardImage}
                  />
                  <Text style={styles.friendCardName}>{friend.fullName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Friend profile modal (same component, recursive) */}
        {showFriendProfile && selectedFriendId && (
          <Modal
            visible={true}
            animationType="slide"
            onRequestClose={() => setFriendProfile(false)}
          >
            <UserProfile
              userId={selectedFriendId}
              onClose={() => setFriendProfile(false)}
              onRemoveFriend={props.onRemoveFriend}
              onAddFriend={props.onAddFriend}
            />
          </Modal>
        )}

        {/* Apartments + Logout are kept commented as in original logic */}
        {/* <View style={styles.apartmentsWrapper}>
          <UserOwnedApartmentsGrid
            userId={finalUserId}
            isMyProfile={false}
            loginUserId={loginUserId}
          />
        </View>

        {isMyProfile && (
          <View style={styles.logoutContainer}>
            <LogoutButton />
          </View>
        )} */}
      </ScrollView>
    </View>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  if (value === undefined || value === null || value === "") return null;

  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrapper}>{icon}</View>
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoText}>{value}</Text>
      </View>
    </View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 210,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    flex: 1,
    textAlign: "right",
    marginRight: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  profileCard: {
    marginTop: 90,
    marginHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 8,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: COLORS.cardBg,
    backgroundColor: "#E5E7EB",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 8,
  },
  profileJob: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },
  chip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.chipBg,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.chipText,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    gap: 8,
  },
  friendButton: {
    backgroundColor: COLORS.primary,
  },
  chatButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  infoSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: COLORS.textMain,
    marginBottom: 10,
  },
  infoGrid: {
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  infoItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoIconWrapper: {
    marginLeft: 10,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  infoText: {
    fontSize: 15,
    color: COLORS.textMain,
    textAlign: "right",
    marginTop: 2,
  },

  friendsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  friendsHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyFriendsCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
  },
  emptyFriendsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    textAlign: "right",
    marginBottom: 4,
  },
  emptyFriendsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  friendsScrollContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
  },
  friendCard: {
    alignItems: "center",
    marginLeft: 12,
    backgroundColor: COLORS.cardBg,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: 90,
  },
  friendCardImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
  },
  friendCardName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMain,
    textAlign: "center",
  },

  apartmentsWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
  },
  logoutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
});

export default UserProfile;
