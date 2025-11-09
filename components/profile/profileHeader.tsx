import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  fullName: string;
  email: string;
  profilePicture?: string;
  onLogout(): void;
  onEdit(): void;
};

export const ProfileHeader: React.FC<Props> = ({
  fullName,
  email,
  profilePicture,
  onLogout,
  onEdit,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.logoutIcon} onPress={onLogout}>
        <Feather name="log-out" size={24} color="#A1A7B3" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.avatarWrapper} onPress={onEdit}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
          }
          style={styles.avatar}
        />
        <View style={styles.editIconCircle}>
          <Feather name="edit" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.profileName}>{fullName}</Text>
      <Text style={styles.profileEmail}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#F6F7FB",
    position: "relative",
  },
  logoutIcon: { position: "absolute", top: 40, right: 24, zIndex: 10 },
  avatarWrapper: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editIconCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E3965A",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
    marginTop: 8,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 15,
    color: "#A1A7B3",
    marginTop: 2,
    marginBottom: 10,
    textAlign: "center",
  },
});
