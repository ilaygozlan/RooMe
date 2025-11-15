import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import SignalRService from "@/utils/SignalRService";
import ChatRoom from "@/components/Chat/chatRoom"; // adjust path if needed

// IMPORTANT: adjust to your real IP + port
const API = "http://172.16.0.45:5097";

const ChatRoomListScreen = () => {
  const loginUserId = 1; // TEMP for dev

  const [chatList, setChatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(
    null
  );
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const loadChatList = () => {
    fetch(`${API}/Chat/GetChatList/${loginUserId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const fullData = await Promise.all(
          data.map(async (chat: any) => {
            const res = await fetch(
              `${API}/User/GetUserById/${chat.otherUserId}`
            );
            const userData = await res.json();
            return { ...chat, userData };
          })
        );
        setChatList(fullData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading chat list:", err);
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChatList();
    }, [loginUserId])
  );

  useEffect(() => {
    SignalRService.startConnection(loginUserId);

    SignalRService.onReceiveMessage((msg) => {
      const senderId = Number(msg.senderId);
      const text = msg.text;
      const sentAt = msg.sentAt
        ? new Date(msg.sentAt).toISOString()
        : new Date().toISOString();

      setTimeout(() => {
        setChatList((prevList) => {
          const existingChat = prevList.find(
            (chat: any) => chat.otherUserId === senderId
          );

          if (existingChat) {
            const updatedChat = {
              ...existingChat,
              lastMessage: text,
              lastMessageTime: sentAt,
            };
            const others = prevList.filter(
              (chat: any) => chat.otherUserId !== senderId
            );
            return [updatedChat, ...others];
          } else {
            loadChatList();
            return prevList;
          }
        });
      }, 40);
    });

    return () => {
      SignalRService.stopConnection();
    };
  }, [loginUserId]);

  const styles = createStyles(isDark);

  const openChatModal = (recipientId: number) => {
    setSelectedRecipientId(recipientId);
    setIsChatModalVisible(true);
  };

  const closeChatModal = () => {
    setIsChatModalVisible(false);
    setSelectedRecipientId(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF8A4A" />
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {chatList.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{chatList.length}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      {chatList.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyEmoji}>💬</Text>
          </View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            When you start chatting with other users, your conversations will
            appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {chatList.map((chat, index) => {
            const lastTime = chat.lastMessageTime
              ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <TouchableOpacity
                key={index}
                style={styles.chatItem}
                activeOpacity={0.8}
                onPress={() => openChatModal(chat.otherUserId)}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri:
                        chat.userData?.profilePicture ||
                        "https://www.w3schools.com/howto/img_avatar.png",
                    }}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.chatTopRow}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {chat.userData?.fullName || "..."}
                    </Text>
                    {!!lastTime && (
                      <Text style={styles.time}>{lastTime}</Text>
                    )}
                  </View>

                  <View style={styles.chatBottomRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {chat.lastMessage || "Start the conversation"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Chat modal */}
      <Modal
        visible={isChatModalVisible && selectedRecipientId !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeChatModal}
      >
        <ChatRoom
          recipientId={selectedRecipientId ?? undefined}
          onClose={closeChatModal}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default ChatRoomListScreen;

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#050509" : "#F4F5F7",
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: isDark ? "#050509" : "#F4F5F7",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#111827",
    },
    headerBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      paddingHorizontal: 8,
      backgroundColor: "#FF8A4A",
      alignItems: "center",
      justifyContent: "center",
    },
    headerBadgeText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    chatItem: {
      flexDirection: "row",
      padding: 12,
      marginBottom: 10,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      borderRadius: 16,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    avatarWrapper: {
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#E5E7EB",
    },
    chatInfo: {
      flex: 1,
      justifyContent: "center",
    },
    chatTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    userName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#F9FAFB" : "#111827",
      marginRight: 8,
    },
    time: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#9CA3AF",
    },
    chatBottomRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    lastMessage: {
      flex: 1,
      fontSize: 14,
      color: isDark ? "#D1D5DB" : "#6B7280",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: isDark ? "#E5E7EB" : "#6B7280",
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    emptyEmoji: {
      fontSize: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#F9FAFB" : "#111827",
      marginBottom: 6,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 14,
      color: isDark ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      lineHeight: 20,
    },
  });
