import { useCallback, useRef } from "react";
import { Animated } from "react-native";

export function useHideOnScroll({ hideDistance = 150 }: { hideDistance?: number }) {
  const lastScrollY = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const onEndReachedCalledDuringMomentum = useRef(false);
  const hasScrolledRef = useRef(false);

  const onScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    if (currentScrollY > 0) hasScrolledRef.current = true;
    if (Math.abs(diff) < 5) return;

    if (diff > 0 && currentScrollY > 0) {
      Animated.timing(translateY, {
        toValue: -hideDistance,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else if (diff < -10) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  }, [hideDistance, translateY]);

  const onMomentumScrollBegin = useCallback(() => {
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  const canLoadMore = useCallback(() => {
    if (onEndReachedCalledDuringMomentum.current) return false;
    if (!hasScrolledRef.current) return false;
    onEndReachedCalledDuringMomentum.current = true;
    return true;
  }, []);

  const markHasScrolled = useCallback(() => {
    hasScrolledRef.current = true;
  }, []);

  const resetScrollFlags = useCallback(() => {
    hasScrolledRef.current = false;
    onEndReachedCalledDuringMomentum.current = false;
  }, []);

  // expose reset for FlatList's onMomentumScrollBegin
  (globalThis as any).__resetLoadGuard__ = () => {
    onEndReachedCalledDuringMomentum.current = false;
  };

  return { translateY, onScroll, onMomentumScrollBegin, canLoadMore, markHasScrolled, resetScrollFlags };
}