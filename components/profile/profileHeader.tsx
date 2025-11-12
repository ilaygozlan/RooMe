import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      colors={["#E3965A", "#F4B982", "#F0C27B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <Feather name="log-out" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.avatarWrapper} 
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={
                profilePicture
                  ? { uri: profilePicture }
                  : { uri: "https://www.w3schools.com/howto/img_avatar.png" }
              }
              style={styles.avatar}
            />
            <View style={styles.avatarOverlay} />
          </View>
          <View style={styles.editIconCircle}>
            <Feather name="edit-2" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.profileName}>{fullName}</Text>
          <View style={styles.emailContainer}>
            <Feather name="mail" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#E3965A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContainer: {
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 20,
  },
  logoutButton: {
    position: "absolute",
    top: 0,
    right: 20,
    zIndex: 10,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarWrapper: {
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },
  avatarOverlay: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  editIconCircle: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#E3965A",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  textContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emailContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontWeight: "500",
  },
});
