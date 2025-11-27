// UserProfileScreen.jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // make sure expo installed @expo/vector-icons
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ApartmentCard from "@/components/apartment/apartmentCard";
import { router } from "expo-router";

// ===== Example data =====
export const exampleUser = {
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

export const exampleFriends = [
  { id: 2, name: "נועה לוי", avatar: "https://i.pravatar.cc/100?img=5" },
  { id: 3, name: "דניאל כהן", avatar: "https://i.pravatar.cc/100?img=10" },
  { id: 4, name: "יואב רז", avatar: "https://i.pravatar.cc/100?img=15" },
];

export const exampleApartments = [
  {
    ApartmentID: 108,
    Creator_ID: 8,
    Creator_FullName: "ilay gozlan",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=41",
    Images: [
      "https://thumbs.dreamstime.com/b/modern-house-interior-exterior-design-46517595.jpg",
      "https://picsum.photos/800/400?random=16",
      "https://picsum.photos/800/400?random=1",
      "https://picsum.photos/800/400?random=2",
      "https://picsum.photos/800/400?random=31",
      "https://picsum.photos/800/400?random=32",
    ],
    ApartmentType: 0,
    Location:
      '{"address": "קינג ג\'ורג\' 80, Tel Aviv", "latitude": 32.073, "longitude": 34.777}',
    Price: 8400,
    Description: "Penthouse, skyline views, huge terrace, elevator & parking.",
    AmountOfRooms: 4,
    AllowPet: false,
    AllowSmoking: false,
    ParkingSpace: 1,
    EntryDate: "2025-12-05T00:00:00",
    ExitDate: null,
    Rental_ContractLength: 24,
    Rental_ExtensionPossible: true,
    Shared_NumberOfRoommates: null,
    Roommates: "",
    Sublet_CanCancelWithoutPenalty: false,
    Sublet_IsWholeProperty: false,
    LabelsJson:
      '[{"value":"terrace"},{"value":"elevator"},{"value":"parking"},{"value":"dishwasher"}]',
    NumOfLikes: 20,
    IsLikedByUser: true,
  },
  {
    ApartmentID: 109,
    Creator_ID: 9,
    Creator_FullName: "ilay gozlan",
    Creator_ProfilePicture: "https://i.pravatar.cc/150?img=41",
    Images: [
      "https://picsum.photos/800/400?random=17",
      "https://picsum.photos/800/400?random=18",
    ],
    ApartmentType: 1,
    Location:
      '{"address": "Bar Ilan 5, Ramat Gan", "latitude": 32.082, "longitude": 34.826}',
    Price: 4100,
    Description:
      "Student-friendly shared flat, bills included, near campus and transit.",
    AmountOfRooms: 3,
    AllowPet: false,
    AllowSmoking: true,
    ParkingSpace: 0,
    EntryDate: "2025-11-22T00:00:00",
    ExitDate: null,
    Rental_ContractLength: 12,
    Rental_ExtensionPossible: true,
    Shared_NumberOfRoommates: 2,
    Roommates:
      "Name:Tom|Gender:Male|Job:Student|BirthDate:2001-02-02|Image:https://i.pravatar.cc/100?img=52||Name:Noya|Gender:Female|Job:Student|BirthDate:2002-07-09|Image:https://i.pravatar.cc/100?img=53",
    LabelsJson: '[{"value":"wifi"},{"value":"balcony"},{"value":"ac"}]',
    Sublet_CanCancelWithoutPenalty: false,
    Sublet_IsWholeProperty: false,
    NumOfLikes: 9,
    IsLikedByUser: false,
  },
];

// ===== Helper: calculate age =====
const getAgeFromBirthDate = (birthDateString) => {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// ===== Generic Section Card (for nice grouping) =====
const SectionCard = ({ title, rightLabel, iconName, children }) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              style={styles.sectionTitleIcon}
            />
          )}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {rightLabel ? (
          <Text style={styles.sectionRightLabel}>{rightLabel}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
};

// ===== Friend small avatar =====
const FriendAvatar = ({ friend }) => {
  return (
    <View style={styles.friendContainer}>
      <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
      <Text style={styles.friendName} numberOfLines={1}>
        {friend.name}
      </Text>
    </View>
  );
};

// ===== Profile Header (shared for my profile / other profile) =====
const ProfileHeader = ({ user, isCurrentUser }) => {
  const age = useMemo(
    () => getAgeFromBirthDate(user.birthDate),
    [user.birthDate]
  );

  const genderLabel = user.gender === "M" ? "גבר" : "אישה";

  return (
    <View style={styles.headerContainer}>
      {/* Background "card" / elevated area */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.profilePicture}
          />

          <View style={styles.headerTextArea}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userJob} numberOfLines={2}>
              {user.jobStatus}
            </Text>

            <View style={styles.tagRow}>
              {age != null && (
                <View style={styles.tag}>
                  <Ionicons name="calendar-outline" size={14} />
                  <Text style={styles.tagText}>{age} שנים</Text>
                </View>
              )}
              <View style={styles.tag}>
                <Ionicons name="person-outline" size={14} />
                <Text style={styles.tagText}>{genderLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lifestyle tags */}
        <View style={styles.lifestyleRow}>
          <View
            style={[
              styles.lifestyleTag,
              user.ownPet && styles.lifestyleTagActive,
            ]}
          >
            <Ionicons name="paw-outline" size={16} />
            <Text style={styles.lifestyleText}>
              {user.ownPet ? "מגדל חיות" : "ללא חיות"}
            </Text>
          </View>
          <View
            style={[
              styles.lifestyleTag,
              !user.smoke && styles.lifestyleTagActive,
            ]}
          >
            <Ionicons name="flame-outline" size={16} />
            <Text style={styles.lifestyleText}>
              {user.smoke ? "מעשן" : "לא מעשן"}
            </Text>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} style={styles.iconSoft} />
            <Text style={styles.contactText}>{user.phoneNumber}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} style={styles.iconSoft} />
            <Text style={styles.contactText} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Pill at top-right to show if this is "my profile" or another user */}
        <View style={styles.profileTypeBadgeWrapper}>
          <View style={styles.profileTypeBadge}>
            <Ionicons
              name={isCurrentUser ? "person-circle-outline" : "eye-outline"}
              size={16}
              style={styles.iconSoft}
            />
            <Text style={styles.profileTypeText}>
              {isCurrentUser ? "הפרופיל שלי" : "פרופיל משתמש"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ===== Floating action bar (different for my / other profile) =====
const ProfileActionBar = ({ isCurrentUser, safeBottomPadding = 0 }) => {
  const actionBarStyle = [
    styles.actionBar,
    { bottom: Math.max(10, safeBottomPadding + 10) },
  ];
  if (isCurrentUser) {
    return (
      <View style={actionBarStyle}>
        <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]}>
          <Ionicons name="pencil-outline" size={18} />
          <Text style={styles.actionPrimaryText}>עריכת פרופיל</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={18} />
          <Text style={styles.actionText}>הוספת דירה</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Actions when viewing someone else’s profile
  return (
    <View style={actionBarStyle}>
      <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} />
        <Text style={styles.actionPrimaryText}>שליחת הודעה</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="heart-outline" size={18} />
        <Text style={styles.actionText}>שמירה במועדפים</Text>
      </TouchableOpacity>
    </View>
  );
};

// ===== Main screen =====
const UserProfileScreen = ({
  user = exampleUser,
  friends = exampleFriends,
  apartments = exampleApartments,
  isCurrentUser = false,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const handleBackPress = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.root}>
        <View
          style={[
            styles.backButtonWrapper,
            { top: insets.top + 10 },
          ]}
        >
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            user={user}
            isCurrentUser={isCurrentUser}
          />

          {/* Stats section */}
          <SectionCard
            title="סקירה מהירה"
            iconName="stats-chart-outline"
            rightLabel={
              isCurrentUser ? "איך אחרים רואים אותך" : "מידע על המשתמש"
            }
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{friends.length}</Text>
                <Text style={styles.statLabel}>חברים</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{apartments.length}</Text>
                <Text style={styles.statLabel}>דירות שפורסמו</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>דירוג משתמש</Text>
              </View>
            </View>
          </SectionCard>

          {/* Friends section */}
          <SectionCard
            title="חברים משותפים / חברים"
            iconName="people-outline"
            rightLabel={
              friends.length ? `${friends.length} חברים` : "אין חברים להצגה"
            }
          >
            {friends.length ? (
              <FlatList
                data={friends}
                keyExtractor={(item) => String(item.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.friendsList}
                inverted // for RTL visual order
                renderItem={({ item }) => <FriendAvatar friend={item} />}
              />
            ) : (
              <Text style={styles.emptyText}>
                עדיין אין חברים להצגה עבור משתמש זה.
              </Text>
            )}
          </SectionCard>

          {/* Apartments section */}
          <SectionCard
            title={isCurrentUser ? "הדירות שפרסמת" : "דירות שהמשתמש פרסם"}
            iconName="home-outline"
            rightLabel={
              apartments.length ? `${apartments.length} דירות` : undefined
            }
          >
            {apartments.length ? (
              <View style={styles.apartmentsList}>
                {apartments.map((apt, idx) => {
                  const key =
                    apt?.ApartmentID ??
                    (typeof apt?.id !== "undefined" ? apt.id : `apt-${idx}`);
                  return <ApartmentCard key={String(key)} apartment={apt} />;
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                עדיין לא פורסמו דירות על ידי משתמש זה.
              </Text>
            )}
          </SectionCard>

          {/* Extra padding at bottom so it won't hide under the action bar */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Floating bottom action bar */}
        <ProfileActionBar
          isCurrentUser={isCurrentUser}
          safeBottomPadding={insets.bottom}
        />
      </View>
    </SafeAreaView>
  );
};

export default UserProfileScreen;

// ===== Styles =====
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB", // color behind the whole screen including safe area
  },
  root: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Header
  headerContainer: {
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
  },
  backButtonWrapper: {
    position: "absolute",
    left: 16,
    zIndex: 50,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: "row-reverse", // RTL layout
    alignItems: "center",
  },
  profilePicture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginLeft: 16,
  },
  headerTextArea: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
  },
  userJob: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "right",
  },
  tagRow: {
    flexDirection: "row-reverse",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 6,
  },
  tagText: {
    fontSize: 12,
    marginRight: 4,
  },

  lifestyleRow: {
    flexDirection: "row-reverse",
    marginTop: 12,
  },
  lifestyleTag: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    backgroundColor: "#EFF1F5",
  },
  lifestyleTagActive: {
    backgroundColor: "#E0ECFF",
  },
  lifestyleText: {
    fontSize: 12,
    marginRight: 4,
  },

  contactRow: {
    flexDirection: "column",
    marginTop: 12,
    gap: 6,
  },
  contactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  contactText: {
    fontSize: 13,
    color: "#4B5563",
    marginRight: 6,
    maxWidth: "90%",
    textAlign: "right",
  },
  iconSoft: {
    opacity: 0.7,
  },

  profileTypeBadgeWrapper: {
    position: "absolute",
    top: 10,
    left: 12,
  },
  profileTypeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  profileTypeText: {
    color: "white",
    fontSize: 11,
    marginRight: 4,
  },

  // Section card
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  sectionTitleIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionRightLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Stats
  statsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  // Friends
  friendsList: {
    paddingTop: 8,
  },
  friendContainer: {
    width: 72,
    alignItems: "center",
    marginLeft: 10,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  friendName: {
    fontSize: 11,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 6,
    textAlign: "right",
  },

  // Apartments
  apartmentsList: {
    gap: 10,
    marginTop: 6,
  },
  apartmentCard: {
    flexDirection: "row-reverse",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    overflow: "hidden",
  },
  apartmentImageWrapper: {
    width: 110,
    height: "100%",
  },
  apartmentImage: {
    width: "100%",
    height: "100%",
  },
  boostBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FBBF24",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  boostBadgeText: {
    fontSize: 11,
    marginRight: 4,
  },
  apartmentInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  apartmentTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  apartmentRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
  },
  apartmentLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 4,
  },
  apartmentFooterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  apartmentPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  apartmentActions: {
    flexDirection: "row-reverse",
  },
  apartmentActionButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    marginLeft: 6,
  },

  // Bottom action bar
  actionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row-reverse",
    backgroundColor: "#111827",
    borderRadius: 999,
    padding: 8,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionPrimary: {
    backgroundColor: "#F97316",
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  actionText: {
    color: "#E5E7EB",
    fontSize: 13,
    marginRight: 6,
  },
});
