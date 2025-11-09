import React, { useState } from "react";
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
/* import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker"; 
import CustomDateTimePicker from "../../components/CustomDateTimePicker";
import type { UserProfile } from "../../hooks/useUserProfile"; */

const baseUrl = "https://roomebackend20250414140006.azurewebsites.net";
const GetImageUrl = (image?: string | null): string => {
  if (!image) return "";
  const trimmed = image.trim();
  return trimmed.startsWith("https")
    ? trimmed
    : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
};

type Props = {
  visible: boolean;
  onClose(): void;
  API: string;
  profile: UserProfile;
  onSave(updated: UserProfile): Promise<void>;
};

export const EditProfileModal: React.FC<Props> = ({ visible, onClose, API, profile, onSave }) => {
  const [updated, setUpdated] = useState<UserProfile>(profile);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // keep in sync if profile changes (modal reopen)
  React.useEffect(() => setUpdated(profile), [profile]);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    setShowPhoneError(!phoneRegex.test(phone));
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setUpdated((p) => ({ ...p, birthDate: date }));
  };

/*   const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("שגיאה", "נדרשות הרשאות ספריית מדיה");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadProfileImage(API, uri);
      if (uploadedUrl) {
        setUpdated((p) => ({ ...p, profilePicture: uploadedUrl }));
      }
    }
  }; */

/*   const uploadProfileImage = async (API: string, uri: string): Promise<string | null> => {
    const fileName = uri.split("/").pop() ?? "image.jpg";
    const match = /\.(\w+)$/.exec(fileName);
    const fileType = match ? `image/${match[1]}` : `image`;
    const formData = new FormData();
    formData.append("files", { uri, name: fileName, type: fileType } as any);
    try {
      const response = await fetch(`${API}UploadImageCpntroller/uploadImageProfile`, {
        method: "POST", headers: {}, body: formData,
      });
      if (!response.ok) throw new Error("Upload failed with status " + response.status);
      const imageUrlText = await response.text();
      return GetImageUrl("uploadedFiles/" + JSON.parse(imageUrlText));
    } catch (e) {
      console.error("Error uploading image:", e);
      return null;
    }
  }; */

  const doSave = async () => {
    if (showPhoneError) {
      Alert.alert("שגיאה", "מספר טלפון לא תקין");
      return;
    }
    await onSave(updated);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { top: 70, height: "85%", marginBottom: 100 }]}>
        <View style={styles.modalContent}>
          <ScrollView>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ערוך פרופיל</Text>

{/*             <TouchableOpacity style={styles.photoContainer} onPress={handleImagePick}>
              {updated.profilePicture ? (
                <Image source={{ uri: updated.profilePicture }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}><Text style={styles.photoText}>הוסף תמונה</Text></View>
              )}
            </TouchableOpacity> */}

            <TextInput
              style={styles.input}
              placeholder="שם מלא"
              value={updated.fullName ?? ""}
              onChangeText={(text) => setUpdated((p) => ({ ...p, fullName: text }))}
            />
            <TextInput style={styles.inputDisabled} value={updated.email ?? ""} editable={false} />
            <TextInput
              style={styles.input}
              placeholder="מספר טלפון"
              value={updated.phoneNumber ?? ""}
              onChangeText={(text) => {
                setUpdated((p) => ({ ...p, phoneNumber: text }));
                validatePhone(text);
              }}
              keyboardType="phone-pad"
            />
            {showPhoneError && <Text style={{ color: "red", textAlign: "right" }}>יש להזין מספר טלפון תקין</Text>}

            <TextInput
              style={styles.input}
              placeholder="סטטוס תעסוקה"
              value={updated.jobStatus ?? ""}
              onChangeText={(text) => setUpdated((p) => ({ ...p, jobStatus: text }))}
            />

            <Text style={styles.label}>מגדר:</Text>
{/*             <Picker
              selectedValue={updated.gender}
              onValueChange={(val) => setUpdated((p) => ({ ...p, gender: val }))}
              style={styles.picker}
            >
              <Picker.Item label="זכר" value="M" />
              <Picker.Item label="נקבה" value="F" />
              <Picker.Item label="אחר" value="O" />
            </Picker> */}

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                תאריך לידה:{" "}
                {updated.birthDate ? new Date(updated.birthDate).toLocaleDateString("he-IL") : ""}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <CustomDateTimePicker
                value={updated.birthDate ? new Date(updated.birthDate) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, updated.ownPet && styles.toggleButtonActive]}
                onPress={() => setUpdated((p) => ({ ...p, ownPet: !p.ownPet }))}
              >
                <Text style={[styles.toggleText, updated.ownPet && styles.toggleTextActive]}>יש חיית מחמד</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleButton, updated.smoke && styles.toggleButtonActive]}
                onPress={() => setUpdated((p) => ({ ...p, smoke: !p.smoke }))}
              >
                <Text style={[styles.toggleText, updated.smoke && styles.toggleTextActive]}>מעשן/ת</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={doSave}>
              <Text style={styles.buttonText}>שמור</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  closeButton: { position: "absolute", top: 15, left: 15, padding: 8, zIndex: 10 },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 25, textAlign: "right", color: "#34495e" },
  input: {
    borderBottomWidth: 1, borderColor: "#ccc", marginBottom: 20, paddingVertical: 8, fontSize: 16, color: "#34495e", textAlign: "right",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0", paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12, marginBottom: 20, color: "#999", fontSize: 16, textAlign: "right",
  },
  photoContainer: { alignItems: "center", marginBottom: 25 },
  profilePhoto: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#eee" },
  photoPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#d9d9d9", justifyContent: "center", alignItems: "center" },
  photoText: { color: "#666", fontWeight: "500" },
  label: { fontSize: 16, marginBottom: 8, textAlign: "right", fontWeight: "600", color: "#34495e" },
  picker: { borderWidth: 1, borderColor: "#ccc", borderRadius: 12, marginBottom: 20, paddingHorizontal: 10, fontSize: 16, color: "#34495e" },
  dateButton: { borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 15, marginBottom: 20, backgroundColor: "#fff" },
  dateButtonText: { textAlign: "right", fontSize: 16, color: "#34495e" },
  toggleContainer: { flexDirection: "row-reverse", justifyContent: "space-around", marginBottom: 30 },
  toggleButton: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#ccc", width: "45%", alignItems: "center", backgroundColor: "#fff" },
  toggleButtonActive: { backgroundColor: "#7C83FD", borderColor: "#7C83FD" },
  toggleText: { fontSize: 16, color: "#34495e" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },
  saveButton: { backgroundColor: "#7C83FD", paddingVertical: 14, borderRadius: 14, marginTop: 15, shadowColor: "#7C83FD", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16, textAlign: "center" },
});
