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
      <SectionTitle>תמונות</SectionTitle>
      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {images.length === 0 ? (
          <>
            <Ionicons name="image-outline" size={56} color="gray" />
            <Text>הוסף תמונות מהגלריה</Text>
          </>
        ) : (
          <FlatList
            data={images}
            horizontal
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View style={{ position: "relative", marginRight: 8 }}>
                <Image source={{ uri: item }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => removeImage(item)} style={styles.removeButton}>
                  <Text style={{ color: "white" }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
        <Ionicons name="camera-outline" size={20} color="#333" />
        <Text style={{ marginLeft: 8 }}>צלם תמונה</Text>
      </TouchableOpacity>
    </View>
  );
}
