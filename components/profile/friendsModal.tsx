import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
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
      <View style={styles.container}>
        <Text style={styles.title}>החברים שלי</Text>
        <ScrollView>
          {friends.map((f) => (
            <TouchableOpacity key={f.id} style={styles.row} onPress={() => onSelect(f.id)}>
              <Image
                source={{
                  uri: f.profilePicture || "https://www.w3schools.com/howto/img_avatar.png",
                }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{f.fullName}</Text>
                <Text style={styles.user}>@{f.username}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={{ color: "#fff", fontSize: 18 }}>סגור</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 100, paddingBottom: 50, paddingHorizontal: 18 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 18, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F8" },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  name: { fontSize: 16, fontWeight: "600", color: "#222B45" },
  user: { fontSize: 13, color: "#A1A7B3" },
  closeBtn: {
    backgroundColor: "#7C83FD",
    padding: 14,
    borderRadius: 12,
    marginTop: 18,
    marginBottom: 18,
    alignItems: "center",
  },
});
