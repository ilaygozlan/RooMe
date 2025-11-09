// ToastSystem.tsx
// Drop-in toast system for React Native (Expo friendly).
// 1) Place <ToastProvider><App/></ToastProvider> ברמת ה-root (app/_layout.tsx או App.tsx).
// 2) קרא useToast().showToast({...}) מכל מקום.
//
// Notes:
// - Comments are in English per your preference.
// - Colors tuned to Roome style (primary orange #E3965A).
// - Uses @expo/vector-icons; install if needed: `npx expo install @expo/vector-icons`
// - No external toast libs required.

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info" | "warning" | "boost";
type Placement = "top" | "center" | "bottom";

type ToastAction = {
  label: string;
  onPress: () => void;
};

export type ToastOptions = {
  id?: string;
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number; // ms; if 0 or undefined -> default
  placement?: Placement; // top/center/bottom
  position?: {
    // Custom positioning for specific alerts (overrides placement)
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  action?: ToastAction; // optional CTA button
  iconName?: string; // override icon per-toast if needed
  onHide?: () => void; // callback on dismiss
  persist?: boolean; // if true, won't auto-dismiss
};

type InternalToast = Required<Omit<ToastOptions, "position">> & {
  id: string;
  createdAt: number;
  position?: ToastOptions["position"];
};

type ToastContextValue = {
  showToast: (opts: ToastOptions) => string; // returns toast id
  hideToast: (id: string) => void;
  clearAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// ---------- Provider ----------
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<InternalToast[]>([]);
  const idCounter = useRef(0);

  const defaultDuration = 3500;

  const normalize = (opts: ToastOptions): InternalToast => {
    const type = opts.type ?? "info";
    const id = opts.id ?? `toast_${Date.now()}_${idCounter.current++}`;
    const duration =
      typeof opts.duration === "number"
        ? opts.duration
        : (type === "error" ? 4500 : defaultDuration);
    const placement = opts.placement ?? "top";
    const iconName =
      opts.iconName ??
      (type === "success"
        ? "check-circle"
        : type === "error"
        ? "alert-circle"
        : type === "warning"
        ? "alert"
        : type === "boost"
        ? "rocket-launch"
        : "information");

    return {
      id,
      type,
      title: opts.title ?? "",
      message: opts.message ?? "",
      duration,
      placement,
      position: opts.position,
      action: opts.action ?? ({} as any),
      iconName,
      onHide: opts.onHide ?? (() => {}),
      persist: !!opts.persist,
      createdAt: Date.now(),
    };
  };

  const showToast = useCallback((opts: ToastOptions) => {
    const t = normalize(opts);
    setQueue((prev) => [...prev, t]);
    return t.id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => setQueue([]), []);

  const value = useMemo(
    () => ({ showToast, hideToast, clearAll }),
    [showToast, hideToast, clearAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost queue={queue} onRequestClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

// ---------- Host renders visible toasts ----------
const MAX_VISIBLE = 1;

const ToastHost = ({
  queue,
  onRequestClose,
}: {
  queue: InternalToast[];
  onRequestClose: (id: string) => void;
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const centerY = screenHeight / 2;
  
  // Split by placement and custom position
  const topToasts = queue.filter((t) => t.placement === "top" && !t.position).slice(0, MAX_VISIBLE);
  const centerToasts = queue.filter((t) => t.placement === "center" && !t.position).slice(0, MAX_VISIBLE);
  const bottomToasts = queue.filter((t) => t.placement === "bottom" && !t.position).slice(0, MAX_VISIBLE);
  const customPositionToasts = queue.filter((t) => t.position).slice(0, MAX_VISIBLE);

  return (
    <>
      {/* TOP */}
      <View
        pointerEvents="box-none"
        style={[
          styles.host,
          {
            top: insets.top + 12,
            bottom: undefined,
            alignItems: "center",
          },
        ]}
      >
        {topToasts.map((t, idx) => (
          <ToastCard
            key={t.id}
            toast={t}
            index={idx}
            onClose={() => onRequestClose(t.id)}
          />
        ))}
      </View>

      {/* CENTER */}
      <View
        pointerEvents="box-none"
        style={[
          styles.host,
          {
            top: centerY,
            bottom: undefined,
            alignItems: "center",
            transform: [{ translateY: -50 }],
          },
        ]}
      >
        {centerToasts.map((t, idx) => (
          <ToastCard
            key={t.id}
            toast={t}
            index={idx}
            onClose={() => onRequestClose(t.id)}
          />
        ))}
      </View>

      {/* BOTTOM */}
      <View
        pointerEvents="box-none"
        style={[
          styles.host,
          {
            bottom: insets.bottom + 12,
            top: undefined,
            alignItems: "center",
          },
        ]}
      >
        {bottomToasts.map((t, idx) => (
          <ToastCard
            key={t.id}
            toast={t}
            index={idx}
            onClose={() => onRequestClose(t.id)}
          />
        ))}
      </View>

      {/* CUSTOM POSITION */}
      {customPositionToasts.map((t, idx) => (
        <View
          key={t.id}
          pointerEvents="box-none"
          style={[
            styles.host,
            {
              top: t.position?.top,
              bottom: t.position?.bottom,
              left: t.position?.left ?? 8,
              right: t.position?.right ?? 8,
              alignItems: t.position?.left !== undefined && t.position?.right === undefined 
                ? "flex-start" 
                : t.position?.right !== undefined && t.position?.left === undefined
                ? "flex-end"
                : "center",
            },
          ]}
        >
          <ToastCard
            toast={t}
            index={idx}
            onClose={() => onRequestClose(t.id)}
          />
        </View>
      ))}
    </>
  );
};

// ---------- Single toast card with animation ----------
const ToastCard = ({
  toast,
  index,
  onClose,
}: {
  toast: InternalToast;
  index: number;
  onClose: () => void;
}) => {
  const translate = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isRTL = I18nManager.isRTL;
  const slideFrom = 
    toast.placement === "top" ? -30 
    : toast.placement === "center" ? 0 
    : 30;

  useEffect(() => {
    // Enter animation
    const initialValue = toast.placement === "center" ? 0 : slideFrom;
    translate.setValue(initialValue);
    
    Animated.parallel([
      Animated.timing(translate, {
        toValue: 0,
        duration: toast.placement === "center" ? 300 : 220,
        easing: toast.placement === "center" 
          ? Easing.out(Easing.back(1.2))
          : Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    let timer: NodeJS.Timeout | null = null;
    if (!toast.persist && toast.duration > 0) {
      timer = setTimeout(() => handleHide(), toast.duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHide = () => {
    const exitValue = toast.placement === "center" ? 0 : slideFrom;
    Animated.parallel([
      Animated.timing(translate, {
        toValue: exitValue,
        duration: toast.placement === "center" ? 200 : 180,
        easing: toast.placement === "center"
          ? Easing.in(Easing.back(1.1))
          : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        toast.onHide?.();
        onClose();
      }
    });
  };

  const palette = getPalette(toast.type);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.cardWrapper,
        {
          transform: [
            {
              translateY: translate.interpolate({
                inputRange: [-30, 0, 30],
                outputRange:
                  toast.placement === "top" 
                    ? [-30, 0, 0] 
                    : toast.placement === "center"
                    ? [0, 0, 0]
                    : [0, 0, 30],
              }),
            },
          ],
          opacity,
          marginTop: toast.placement === "top" ? (index === 0 ? 0 : 8) : 0,
          marginBottom: toast.placement === "bottom" ? (index === 0 ? 0 : 8) : 0,
          marginVertical: toast.placement === "center" ? 0 : undefined,
        },
      ]}
    >
      <Pressable
        onPress={toast.action?.onPress ?? handleHide}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            opacity: pressed ? 0.95 : 1,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: palette.accent }]}>
          <MaterialCommunityIcons
            name={toast.iconName as any}
            size={20}
            color={"white"}
          />
        </View>

        <View
          style={[
            styles.textBox,
            { alignItems: isRTL ? "flex-end" : "flex-start" },
          ]}
        >
          {!!toast.title && (
            <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
              {toast.title}
            </Text>
          )}
          {!!toast.message && (
            <Text
              style={[styles.message, { color: palette.textSoft }]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          )}
          {!!toast.action?.label && (
            <View style={styles.actionRow}>
              <Text style={[styles.actionLabel, { color: palette.accent }]}>
                {toast.action.label}
              </Text>
            </View>
          )}
        </View>

        {/* Close button */}
        <Pressable onPress={handleHide} hitSlop={8} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={18} color={palette.textSoft} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

// ---------- Palette / Styles ----------
const ORANGE = "#E3965A";
const RED = "#D9534F";
const GREEN = "#2E7D32";
const BLUE = "#2F80ED";
const YELLOW = "#F2C94C";

const getPalette = (type: ToastType) => {
  // Light/dark adaptive colors
  const isDark = Platform.OS !== "web" && (StyleSheet as any).getColorScheme?.() === "dark";
  const baseBg = isDark ? "#1E1E1E" : "#FFFFFF";
  const baseText = isDark ? "#F5F5F5" : "#1B1B1B";
  const textSoft = isDark ? "#D0D0D0" : "#4C4C4C";

  const map: Record<
    ToastType,
    { bg: string; border: string; accent: string; text: string; textSoft: string }
  > = {
    success: {
      bg: baseBg,
      border: ORANGE,
      accent: GREEN,
      text: baseText,
      textSoft,
    },
    error: {
      bg: baseBg,
      border: "rgba(217,83,79,0.2)",
      accent: RED,
      text: baseText,
      textSoft,
    },
    info: {
      bg: baseBg,
      border: "rgba(47,128,237,0.18)",
      accent: BLUE,
      text: baseText,
      textSoft,
    },
    warning: {
      bg: baseBg,
      border: "rgba(242,201,76,0.28)",
      accent: YELLOW,
      text: baseText,
      textSoft,
    },
    boost: {
      bg: baseBg,
      border: "rgba(227,150,90,0.28)",
      accent: ORANGE,
      text: baseText,
      textSoft,
    },
  };

  return map[type] ?? map.info;
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 8,
    right: 8,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    minWidth: "94%",
    maxWidth: 700,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: ORANGE,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  textBox: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 17,
  },
  actionRow: {
    marginTop: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
    marginStart: 4,
  },
});

// ---------- Example helpers ----------
/** Quick helpers you can import */
export const toast = {
  success: (
    show: (o: ToastOptions) => string,
    title: string,
    message?: string,
    options?: { placement?: Placement; position?: ToastOptions["position"] }
  ) => show({ type: "success", title, message, ...options }),
  error: (
    show: (o: ToastOptions) => string,
    title: string,
    message?: string,
    options?: { placement?: Placement; position?: ToastOptions["position"] }
  ) => show({ type: "error", title, message, duration: 5000, ...options }),
  info: (
    show: (o: ToastOptions) => string,
    title: string,
    message?: string,
    options?: { placement?: Placement; position?: ToastOptions["position"] }
  ) => show({ type: "info", title, message, ...options }),
  warning: (
    show: (o: ToastOptions) => string,
    title: string,
    message?: string,
    options?: { placement?: Placement; position?: ToastOptions["position"] }
  ) => show({ type: "warning", title, message, ...options }),
  boost: (
    show: (o: ToastOptions) => string,
    title: string,
    message?: string,
    options?: { placement?: Placement; position?: ToastOptions["position"] }
  ) => show({ type: "boost", title, message, iconName: "rocket-launch", ...options }),
};
