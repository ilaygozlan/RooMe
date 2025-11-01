import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ENV } from "../../src/config/env";

const screenWidth = Dimensions.get("window").width;
const baseUrl = ENV.apiBaseUrl;

// ----- Types -----
type Props = {
  /** Can be a CSV string: "img1.jpg,img2.jpg" OR an array of URLs/paths */
  images?: string[] | string;
  /** Gallery width in px. Defaults to screen width when not provided */
  width?: number;
};

/** Normalize images prop -> absolute URL array */
const getImagesArr = (images?: string[] | string): string[] => {
  const asArray: string[] =
    typeof images === "string"
      ? images.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(images)
      ? images
      : [];

  return asArray.map((img) => {
    const trimmed = (img ?? "").trim();
    if (!trimmed) return "";
    // If already absolute https URL
    if (trimmed.startsWith("https")) return trimmed;
    // Ensure single slash between base and path
    const needsSlash = trimmed.startsWith("/") ? "" : "/";
    return `${baseUrl}${needsSlash}${trimmed}`;
  }).filter(Boolean);
};

export default function ApartmentGallery({ images, width }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const imageArray = getImagesArr(images);

  // fallback to screen width if no width is provided
  const galleryWidth = width ?? screenWidth;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / galleryWidth);
    setCurrentIndex(index);
  };

  if (imageArray.length === 0) {
    return (
      <View style={[styles.placeholder, { width: galleryWidth }]}>
        <Text style={styles.placeholderText}>No images available</Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollRef}
        style={[styles.scrollView, { width: galleryWidth }]}
      >
        {imageArray.map((imgUrl, index) => (
          <Image
            key={index}
            source={{ uri: imgUrl }}
            style={[styles.image, { width: galleryWidth }]}
          />
        ))}
      </ScrollView>

      {imageArray.length > 1 && (
        <View style={styles.dotsContainer}>
          {imageArray.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    height: 200,
  },
  image: {
    height: 200,
    resizeMode: "cover",
  },
  placeholder: {
    height: 150,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#777",
    fontSize: 16,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#E3965A",
  },
});
