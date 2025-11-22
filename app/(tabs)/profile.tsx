import React, { useContext, useMemo, useState } from "react";
import {
  SafeAreaView, ScrollView, RefreshControl, View,
} from "react-native";
import { useRouter } from "expo-router";
import Screen from "@/components/ui/Screen";
/* import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import API from "../config";
import { ActiveApartmentContext } from "../contex/ActiveApartmentContext";
import UserOwnedApartmentsGrid from "../UserOwnedApartmentsGrid";
import MyOpenHouses from "../components/MyOpenHouses";*/
import RoommatePreferencesForm from "@/components/profile/roommatePreferencesForm"; 
import HouseLoading from "@/components/ui/loadingHouseSign";


import { useUserProfile } from "@/hooks/profileHooks/useUserProfile";
import { useFriends } from "@/hooks/profileHooks/useFriends";
import { useOpenHouses } from "@/hooks/profileHooks/useOpenHouses";

import { ProfileHeader } from "@/components/profile/profileHeader";
import { CountersRow } from "@/components/profile/countersRow";
import { FriendsModal } from "@/components/profile/friendsModal";
import { EditProfileModal } from "@/components/profile/editProfileModal";
import { InfoCard } from "@/components/profile/infoCard";
import { AIButton } from "@/components/profile/AIButton";

import { useAuth } from "@/lib/auth/AuthContext";

import { useApartments, type Apartment } from "@/context/ApartmentsContext";
import { ApartmentsModal } from "@/components/profile/apartmentsModal";
import EditApartmentDetailsForm from "@/components/profile/editApartmentDetailsForm";


type MyProfileProps = { myId?: number | string };

const MyProfile: React.FC<MyProfileProps> = ({ myId: propMyId }) => {
  const router = useRouter();
  const {logout, user} = useAuth();
  
  // Get user ID from prop, auth context, or default to 1
  const myId = propMyId || (user?.id ? Number(user.id) || user.id : 1);
  
  const API = "";
  const {home, getApartmentsByIds} = useApartments();
  const allApartmentIds = home.ids;
  const allApartments = useMemo(() => {
    return getApartmentsByIds(allApartmentIds);
  }, [allApartmentIds, getApartmentsByIds]);

  // data hooks
  const { profile, loading, error, reload, updateProfile } = useUserProfile(API, myId, { mock: true });  
  const { friends, reload: reloadFriends } = useFriends(String(API), myId);
  const { openHouses, reload: reloadOpenHouses } = useOpenHouses(String(API), myId);
console.log(profile);
  // ui state
  const [refreshing, setRefreshing] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showOpenHousesModal, setShowOpenHousesModal] = useState(false);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [showApartmentsModal, setShowApartmentsModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);

  const ownedApartments = useMemo(
    () => allApartments.filter((a) => a.Creator_ID === Number(myId)),
    [allApartments, myId]
  );

  // Calculate apartments count - use real apartments if available, otherwise use mock count
  // The UserOwnedApartmentsGrid component will show mock data (7 apartments) if no real ones exist
  const ownedApartmentsNum = useMemo(() => {
    const realCount = ownedApartments.length;
    return realCount > 0 ? realCount : 7; // 7 is the number of mock apartments
  }, [ownedApartments.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([reload(), reloadFriends(), reloadOpenHouses()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading) return <HouseLoading text="הפרופיל שלי" />;
  if (error || !profile) return null;

  return (
    <Screen>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={{ flex: 1, backgroundColor: "#F8F9FA" , paddingBottom: 100}}>
          <ProfileHeader
            fullName={profile.fullName}
            email={profile.email}
            profilePicture={profile.profilePicture}
            onLogout={handleLogout}
            onEdit={() => setEditVisible(true)}
          />

          <View style={{ marginTop: 24, marginHorizontal: 20 }}>
            <CountersRow
              friendsCount={friends.length}
              apartmentsCount={ownedApartmentsNum}
              openHousesCount={openHouses.length}
              onOpenFriends={() => setShowFriendsModal(true)}
              onOpenApartments={() => setShowApartmentsModal(true)}
              onOpenOpenHouses={() => setShowOpenHousesModal(true)}
            />
          </View>

          <View style={{ marginTop: 24, marginHorizontal: 20 }}>
            <InfoCard
              email={profile.email}
              phoneNumber={profile.phoneNumber}
              gender={profile.gender}
              birthDate={profile.birthDate}
              ownPet={profile.ownPet}
              smoke={profile.smoke}
              jobStatus={profile.jobStatus}
            />
          </View>

          <View style={{ marginTop: 24, marginHorizontal: 20 }}>
            <AIButton onPress={() => setShowPreferencesForm(true)} />
          </View>

          {/* Friends */}
          <FriendsModal
            visible={showFriendsModal}
            friends={friends}
            onClose={() => setShowFriendsModal(false)}
            onSelect={(friendId) => {
              setShowFriendsModal(false);
              router.push({ pathname: "UserProfile", params: { userId: String(friendId) } });
            }}
          />

          {/* Open Houses */}
    {/*       <MyOpenHouses
            visible={showOpenHousesModal}
            onClose={() => setShowOpenHousesModal(false)}
            userId={myId}
            openHouses={openHouses}
          />
 */}
          {/* Apartments Modal */}
          <ApartmentsModal
            visible={showApartmentsModal}
            apartments={ownedApartments}
            userId={myId}
            onClose={() => setShowApartmentsModal(false)}
            onSelect={(apartment) => {
              // Open apartment details
              (globalThis as any).__openAptDetails__?.(apartment);
            }}
            onUpdate={(updated) => {
              // Handle apartment update if needed
              console.log("Apartment updated:", updated);
            }}
            onEdit={(apartment) => {
              setEditingApartment(apartment);
            }}
          />

          {/* Edit Apartment Form */}
          {editingApartment && (
            <EditApartmentDetailsForm
              visible={!!editingApartment}
              apartment={editingApartment}
              onClose={() => {
                setEditingApartment(null);
              }}
              onSave={(updated) => {
                // Handle apartment update
                console.log("Apartment updated:", updated);
                setEditingApartment(null);
              }}
            />
          )}

          {/* Edit Profile */}
          <EditProfileModal
            visible={editVisible}
            onClose={() => setEditVisible(false)}
            API={String(API)}
            profile={profile}
            onSave={async (updated) => {
              const saved = await updateProfile(updated);
              // setProfile(saved); // Commented out as setProfile might not be available
            }}
          />

          {/* Preferences form */}
          {showPreferencesForm && (
            <MyModal visible onClose={() => setShowPreferencesForm(false)}>
              <RoommatePreferencesForm onClose={() => setShowPreferencesForm(false)} />
            </MyModal>
          )} 
        </View>
      </ScrollView>
    </Screen>
  );
};

export default MyProfile;

// מעטפת Modal דקה כדי לא לשנות את RoommatePreferencesForm
const MyModal: React.FC<{ visible: boolean; onClose(): void; children: React.ReactNode }> = ({
  visible,
  onClose,
  children,
}) => {
  const { Modal, View } = require("react-native");
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>{children}</View>
    </Modal>
  );
};