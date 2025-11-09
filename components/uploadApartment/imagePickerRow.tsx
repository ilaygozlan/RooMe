import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import SectionTitle from "@/components/uploadApartment/ui/sectionTitle";
import { uploadStyles as styles } from "@/styles/uploadApartmentStyles";

export default function ImagePickerRow({
  images,
  setImages,
}: {
  images: string[];
  setImages: (imgs: string[]) => void;
}) {
  const removeImage = (uriToRemove: string) => setImages(images.filter((u) => u !== uriToRemove));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("לא התקבלו הרשאות למצלמה");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  return (
    <View style={{ width: "100%" }}>
      {images.length === 0 ? (
        <View style={styles.imageBox}>
          <Ionicons name="images-outline" size={64} color="#ccc" />
          <Text style={{ marginTop: 12, fontSize: 16, color: "#666", marginBottom: 8 }}>אין תמונות</Text>
          <Text style={{ fontSize: 14, color: "#999", textAlign: "center" }}>הוסף תמונות כדי למשוך יותר תשומת לב</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={{ position: "relative", marginRight: 12, marginBottom: 12 }}>
              <Image source={{ uri: item }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => removeImage(item)} style={styles.removeButton}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <TouchableOpacity onPress={pickImage} style={styles.actionButton}>
          <Ionicons name="image-outline" size={22} color="#E3965A" />
          <Text style={styles.actionButtonText}>גלריה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={takePhoto} style={styles.actionButton}>
          <Ionicons name="camera-outline" size={22} color="#E3965A" />
          <Text style={styles.actionButtonText}>מצלמה</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
