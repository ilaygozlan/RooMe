import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

// ===== Types =====

export type PhotoCollageProps = {
  /** Array of image objects with uri and optional id */
  images: Array<{ uri: string; id?: string }>; // length >= 1
  /** Aspect ratio for the collage container height (width / height). Default: 1.2 */
  aspectRatio?: number;
  /** Border radius for image tiles. Default: 16 */
  borderRadius?: number;
  /** Gap between tiles in pixels. Default: 6 */
  gap?: number;
  /** Callback when any image is pressed */
  onImagePress?: () => void;
};

type ImageTile = {
  uri: string;
  id?: string;
  width: number;
  height: number;
  left: number;
  top: number;
  index: number; // original index in images array
};

type LayoutResult = {
  tiles: ImageTile[];
  containerHeight: number;
};

// ===== Layout Helper Functions =====

/**
 * Computes tile positions and dimensions for Facebook-style photo collage
 * @param containerWidth - Total width of the collage container
 * @param imageCount - Number of images to display
 * @param aspectRatio - Desired aspect ratio (width/height)
 * @param gap - Gap between tiles in pixels
 * @returns Layout result with tiles and container height
 */
function computeLayout(
  containerWidth: number,
  imageCount: number,
  aspectRatio: number,
  gap: number
): LayoutResult {
  if (imageCount === 0) {
    return { tiles: [], containerHeight: 0 };
  }

  const containerHeight = containerWidth / aspectRatio;
  const tiles: ImageTile[] = [];

  switch (imageCount) {
    case 1: {
      // Single image: full width, full height
      tiles.push({
        uri: "",
        width: containerWidth,
        height: containerHeight,
        left: 0,
        top: 0,
        index: 0,
      });
      break;
    }

    case 2: {
      // Two images: side-by-side, equal columns
      const tileWidth = (containerWidth - gap) / 2;
      tiles.push(
        {
          uri: "",
          width: tileWidth,
          height: containerHeight,
          left: 0,
          top: 0,
          index: 0,
        },
        {
          uri: "",
          width: tileWidth,
          height: containerHeight,
          left: tileWidth + gap,
          top: 0,
          index: 1,
        }
      );
      break;
    }

    case 3: {
      // Three images: left = large, right = two stacked
      const leftWidth = (containerWidth - gap) / 2;
      const rightWidth = containerWidth - leftWidth - gap;
      const rightTileHeight = (containerHeight - gap) / 2;

      tiles.push(
        {
          uri: "",
          width: leftWidth,
          height: containerHeight,
          left: 0,
          top: 0,
          index: 0,
        },
        {
          uri: "",
          width: rightWidth,
          height: rightTileHeight,
          left: leftWidth + gap,
          top: 0,
          index: 1,
        },
        {
          uri: "",
          width: rightWidth,
          height: rightTileHeight,
          left: leftWidth + gap,
          top: rightTileHeight + gap,
          index: 2,
        }
      );
      break;
    }

    case 4:
    default: {
      // Four images: 2x2 grid
      // For 5+ images, show first 4, then overlay on 4th tile
      const tileWidth = (containerWidth - gap) / 2;
      const tileHeight = (containerHeight - gap) / 2;

      tiles.push(
        {
          uri: "",
          width: tileWidth,
          height: tileHeight,
          left: 0,
          top: 0,
          index: 0,
        },
        {
          uri: "",
          width: tileWidth,
          height: tileHeight,
          left: tileWidth + gap,
          top: 0,
          index: 1,
        },
        {
          uri: "",
          width: tileWidth,
          height: tileHeight,
          left: 0,
          top: tileHeight + gap,
          index: 2,
        },
        {
          uri: "",
          width: tileWidth,
          height: tileHeight,
          left: tileWidth + gap,
          top: tileHeight + gap,
          index: 3,
        }
      );
      break;
    }
  }

  return { tiles, containerHeight };
}

// ===== Main Component =====

/**
 * Facebook-style photo collage component
 * Supports 1-5+ images with intelligent layout
 */
export default function PhotoCollage({
  images,
  aspectRatio = 1.2,
  borderRadius = 16,
  gap = 6,
  onImagePress,
}: PhotoCollageProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<Record<number, boolean>>({});

  // Validate images prop
  if (!images || images.length === 0) {
    console.warn("PhotoCollage: images array must contain at least 1 image");
    return null;
  }

  // Compute layout based on container width
  const displayCount = Math.min(images.length, 4);
  const hasOverlay = images.length > 4;
  const remainingCount = images.length - 4;

  const layout = useMemo(() => {
    if (containerWidth === 0) {
      return { tiles: [], containerHeight: 0 };
    }
    return computeLayout(containerWidth, displayCount, aspectRatio, gap);
  }, [containerWidth, displayCount, aspectRatio, gap]);

  // Handle tile press - trigger callback to open apartment details
  const handleTilePress = useCallback(() => {
    onImagePress?.();
  }, [onImagePress]);

  // Handle overlay press (5th+ images) - same behavior
  const handleOverlayPress = useCallback(() => {
    onImagePress?.();
  }, [onImagePress]);

  // Track image load state
  const handleImageLoad = useCallback((index: number) => {
    setImageLoadStates((prev) => ({ ...prev, [index]: true }));
  }, []);

  // Render a single image tile
  const renderTile = (tile: ImageTile, imageIndex: number) => {
    const image = images[imageIndex];
    if (!image) return null;

    const isLoading = !imageLoadStates[imageIndex];

    return (
      <Pressable
        key={`tile-${imageIndex}`}
        style={[
          styles.tile,
          {
            width: tile.width,
            height: tile.height,
            left: tile.left,
            top: tile.top,
            borderRadius,
          },
        ]}
        onPress={handleTilePress}
        accessibilityLabel={`Apartment image #${imageIndex + 1}`}
        accessibilityRole="imagebutton"
      >
        <Image
          source={{ uri: image.uri }}
          style={[styles.tileImage, { borderRadius }]}
          contentFit="cover"
          transition={200}
          onLoad={() => handleImageLoad(imageIndex)}
          cachePolicy="memory-disk"
        />
        {isLoading && (
          <View style={[styles.loadingOverlay, { borderRadius }]}>
            <ActivityIndicator size="small" color="#E3965A" />
          </View>
        )}
      </Pressable>
    );
  };

  // Render overlay for 5+ images
  const renderOverlay = () => {
    if (!hasOverlay || layout.tiles.length < 4) return null;

    const lastTile = layout.tiles[3]; // 4th tile (bottom-right)
    return (
      <Pressable
        style={[
          styles.overlay,
          {
            width: lastTile.width,
            height: lastTile.height,
            left: lastTile.left,
            top: lastTile.top,
            borderRadius,
          },
        ]}
        onPress={handleOverlayPress}
        accessibilityLabel={`View ${remainingCount} more images`}
        accessibilityRole="button"
      >
        <View style={[styles.overlayContent, { borderRadius }]}>
          <Text style={styles.overlayText}>+{remainingCount}</Text>
        </View>
      </Pressable>
    );
  };

  if (containerWidth === 0) {
    return (
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View style={{ height: Dimensions.get("window").width / aspectRatio }} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          height: layout.containerHeight,
          borderRadius,
          overflow: "hidden",
        },
      ]}
      onLayout={(e) => {
        const newWidth = e.nativeEvent.layout.width;
        if (newWidth > 0 && newWidth !== containerWidth) {
          setContainerWidth(newWidth);
        }
      }}
    >
      {layout.tiles.map((tile, idx) => renderTile(tile, tile.index))}
      {renderOverlay()}
    </View>
  );
}

// ===== Styles =====

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#ffffffff",
    position: "relative",
  },
  tile: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

