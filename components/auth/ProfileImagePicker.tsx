import { useTheme } from "@/lib/ui/ThemeProvider";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, Text, View, StyleSheet, Alert } from "react-native";

type Props = {
  imageUri?: string | null;
  onImageSelected: (uri: string | null) => void;
  error?: string;
};

export default function ProfileImagePicker({ imageUri, onImageSelected, error }: Props) {
  const { palette } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need access to your photos to set a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need access to your camera to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Profile Picture",
      "Choose an option",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: imageUri ? "Remove" : "Cancel", onPress: imageUri ? () => onImageSelected(null) : undefined, style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: palette.textMuted }]}>Profile Picture</Text>
      <Pressable onPress={showImageOptions} disabled={isLoading} style={styles.pickerContainer}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={[styles.editOverlay, { backgroundColor: palette.primary }]}>
              <Ionicons name="camera" size={20} color={palette.onPrimary} />
            </View>
          </View>
        ) : (
          <View style={[styles.placeholder, { borderColor: error ? palette.danger : palette.border }]}>
            <Ionicons name="person" size={32} color={error ? palette.danger : palette.textMuted} />
            <Text style={[styles.placeholderText, { color: error ? palette.danger : palette.textMuted }]}>
              Tap to add photo
            </Text>
          </View>
        )}
      </Pressable>
      {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    fontSize: 14,
  },
  pickerContainer: {
    width: 120,
    height: 120,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

