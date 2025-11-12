import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, StyleSheet, Platform, SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Friend } from "@/hooks/profileHooks/useFriends";

type Props = {
  visible: boolean;
  friends: Friend[];
  onClose(): void;
  onSelect(friendId: string | number): void;
};

export const FriendsModal: React.FC<Props> = ({ visible, friends, onClose, onSelect }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#E3965A", "#F4B982"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>החברים שלי</Text>
          <Text style={styles.subtitle}>{friends.length} חברים</Text>
        </LinearGradient>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>אין חברים עדיין</Text>
            </View>
          ) : (
            friends.map((f) => (
              <TouchableOpacity 
                key={f.id} 
                style={styles.friendCard} 
                onPress={() => onSelect(f.id)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: f.profilePicture || "https://www.w3schools.com/howto/img_avatar.png",
                    }}
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.name}>{f.fullName}</Text>
                  <Text style={styles.username}>@{f.username}</Text>
                </View>
                <Feather name="chevron-left" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  closeButton: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  friendCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    marginLeft: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#FFE3D1",
  },
  friendInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 16,
    fontWeight: "500",
  },
});
