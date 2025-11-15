import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import SignalRService from "@/utils/SignalRService";
import { Ionicons } from "@expo/vector-icons";
import API from "../config";

// ChatRoom can work in two modes:
// 1) As a normal screen via navigation (recipientId from route.params)
// 2) As a modal child, via props: { recipientId, onClose }
const ChatRoom = ({ recipientId: propRecipientId, onClose }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // recipientId from navigation params (if exists)
  const routeRecipientId = route?.params?.recipientId;

  // final recipientId we work with: prefer prop (modal) over route param
  const effectiveRecipientId = propRecipientId ?? routeRecipientId;

  // TODO: replace with real context later
  const loginUserId = 1;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollViewRef = useRef(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Parse recipient safely
  const recipient =
    effectiveRecipientId !== undefined && effectiveRecipientId !== null
      ? parseInt(String(effectiveRecipientId), 10)
      : null;

  // Fetch user profile
  useEffect(() => {
    if (recipient == null) return;

    fetch(`${API}/User/GetUserById/${recipient}`)
      .then((response) => response.json())
      .then((data) => {
        setUserProfile(data);
        setLoadingProfile(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setLoadingProfile(false);
      });
  }, [recipient]);

  // Load chat history
  useEffect(() => {
    if (recipient == null || !loginUserId) return;

    fetch(`${API}/Chat/GetMessages/${loginUserId}/${recipient}`)
      .then((res) => res.json())
      .then((data) => {
        const loadedMessages = data.map((m) => ({
          from: m.fromUserId,
          text: m.content,
          time: new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(loadedMessages);
      })
      .catch((err) => {
        console.error("Error loading chat history:", err);
      });
  }, [loginUserId, recipient]);

  // SignalR realtime
  useEffect(() => {
    if (!loginUserId) return;

    SignalRService.startConnection(loginUserId);
    SignalRService.onReceiveMessage((senderId, message) => {
      const newMsg = {
        from: senderId,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      SignalRService.stopConnection();
    };
  }, [loginUserId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || recipient == null) return;

    const myMsg = {
      from: loginUserId,
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // SignalR send (keeping your original logic)
    SignalRService.sendMessage(recipient.toString(), input);
    setMessages((prev) => [...prev, myMsg]);

    // Save to server
    fetch(`${API}/Chat/SaveMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: loginUserId,
        toUserId: recipient,
        content: input,
      }),
    }).catch((err) => {
      console.error("Failed to save message:", err);
    });

    setInput("");
  };

  const handleBack = () => {
    if (onClose) {
      // In modal mode
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback if needed
      // @ts-ignore
      navigation.navigate("ChatRoomListScreen");
    }
  };

  const styles = createStyles(isDark);

  // If for some reason we don't have a recipientId at all
  if (recipient == null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={26}
              color={isDark ? "#fff" : "#111827"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <View style={styles.centeredFallback}>
          <Text style={styles.fallbackText}>
            No recipient selected for this chat.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#fff" : "#111827"}
            />
          </TouchableOpacity>

          {loadingProfile ? (
            <View style={styles.headerCenter}>
              <ActivityIndicator size="small" color="#FF8A4A" />
            </View>
          ) : (
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {userProfile?.fullName ?? "Chat"}
              </Text>
              <Text style={styles.headerSubtitle}>Online recently</Text>
            </View>
          )}

          <View style={styles.headerRight}>
            <Image
              source={{
                uri: userProfile?.profilePicture
                  ? userProfile.profilePicture
                  : "https://www.w3schools.com/howto/img_avatar.png",
              }}
              style={styles.userImage}
            />
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messages}
          contentContainerStyle={styles.messagesContainer}
          ref={scrollViewRef}
        >
          {messages.map((item, index) => {
            const isMe = item.from === loginUserId;
            return (
              <View
                key={index}
                style={[
                  styles.messageRow,
                  isMe ? styles.myRow : styles.otherRow,
                ]}
              >
                {!isMe && (
                  <Image
                    source={{
                      uri: userProfile?.profilePicture
                        ? userProfile.profilePicture
                        : "https://www.w3schools.com/howto/img_avatar.png",
                    }}
                    style={styles.avatar}
                  />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text
                    style={isMe ? styles.messageTextMe : styles.messageTextOther}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={
                      isMe ? styles.messageTimeMe : styles.messageTimeOther
                    }
                  >
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputOuter}>
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="הקלד הודעה..."
              style={styles.input}
              placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
              multiline
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#050509" : "#F3F4F6",
    },
    container: { flex: 1 },

    // ===== Header =====
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: isDark ? "#0B0B10" : "#FFFFFF",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? "#1F2933" : "#E5E7EB",
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    backButton: {
      padding: 8,
      marginRight: 4,
      borderRadius: 999,
    },
    headerCenter: {
      flex: 1,
      marginLeft: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#F9FAFB" : "#111827",
    },
    headerSubtitle: {
      fontSize: 12,
      color: isDark ? "#9CA3AF" : "#6B7280",
      marginTop: 2,
    },
    headerRight: {
      marginLeft: 8,
    },
    userImage: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#E5E7EB",
    },

    // ===== Messages =====
    messages: {
      flex: 1,
    },
    messagesContainer: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 12,
    },
    messageRow: {
      flexDirection: "row",
      marginVertical: 4,
      alignItems: "flex-end",
    },
    myRow: {
      justifyContent: "flex-end",
    },
    otherRow: {
      justifyContent: "flex-start",
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 6,
      backgroundColor: "#E5E7EB",
    },
    messageBubble: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 18,
      maxWidth: "78%",
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    myMessage: {
      backgroundColor: "#FF8A4A", // RooMe orange
      borderBottomRightRadius: 4,
      marginLeft: 40,
      alignSelf: "flex-end",
    },
    otherMessage: {
      backgroundColor: isDark ? "#1F2933" : "#FFFFFF",
      borderBottomLeftRadius: 4,
      marginRight: 40,
      alignSelf: "flex-start",
    },
    messageTextMe: {
      color: "#FFFFFF",
      fontSize: 15,
    },
    messageTextOther: {
      color: isDark ? "#F9FAFB" : "#111827",
      fontSize: 15,
    },
    messageTimeMe: {
      fontSize: 11,
      marginTop: 4,
      color: "rgba(255,255,255,0.8)",
      alignSelf: "flex-end",
    },
    messageTimeOther: {
      fontSize: 11,
      marginTop: 4,
      color: isDark ? "#9CA3AF" : "#9CA3AF",
      alignSelf: "flex-end",
    },

    // ===== Input =====
    inputOuter: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: isDark ? "#050509" : "#F3F4F6",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? "#111827" : "#FFFFFF",
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    input: {
      flex: 1,
      maxHeight: 100,
      paddingVertical: 6,
      paddingRight: 10,
      fontSize: 15,
      color: isDark ? "#F9FAFB" : "#111827",
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#FF8A4A", // RooMe orange
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 4,
      shadowColor: "#FF8A4A",
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },

    // ===== Fallback =====
    centeredFallback: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    fallbackText: {
      fontSize: 14,
      color: isDark ? "#E5E7EB" : "#6B7280",
      textAlign: "center",
    },
  });

export default ChatRoom;
