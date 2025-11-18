import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

/* import { userInfoContext } from "../contex/userInfoContext";
import API from "../../config"; */

// ===== Types =====

type RoommatePreferencesFormProps = {
  onClose: () => void;
  onMatchesFound: (users: any[]) => void; // if you know the user shape, replace `any` with a User type
};

type Preferences = {
  preferenceId?: number;
  preferredGender?: string;
  preferredMinAge?: number;
  preferredMaxAge?: number;
  allowSmoking?: string; // "כן"/"לא"
  allowPets?: string; // "כן"/"לא"
  cleanlinessLevel?: string;
  sleepSchedule?: string;
  socialLevel?: string;
  workHours?: string;
  workFromHome?: string; // "כן"/"לא"
  hasPet?: boolean;
  petType?: string;
  relationshipStatus?: string;
  socialStyle?: string;
  openToFriendship?: string; // "כן"/"לא"
  notes?: string;
};

type IntroField = {
  key: "intro";
  label: string;
};

type QuestionField = {
  key:
    | "preferredGender"
    | "preferredAge"
    | "allowSmoking"
    | "allowPets"
    | "cleanlinessLevel"
    | "sleepSchedule"
    | "socialLevel"
    | "workHours"
    | "workFromHome"
    | "relationshipStatus"
    | "socialStyle"
    | "openToFriendship";
  question: string;
  options?: string[];
};

type AnyField = IntroField | QuestionField;

// ===== Component =====

const RoommatePreferencesForm: React.FC<RoommatePreferencesFormProps> = ({
  onClose,
  onMatchesFound,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  /*   const { loginUserId } = useContext(userInfoContext) as { loginUserId: number }; */
  const loginUserId = 1;
  const API = "";

  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const [numOfRoommates, setNumOfRoommates] = useState<number>(3);

  const introCard: IntroField[] = [{ key: "intro", label: "ברוכים הבאים" }];

  const fields: QuestionField[] = [
    {
      key: "preferredGender",
      question: "עם איזה שותפים היית רוצה לגור?",
      options: ["נשים בלבד", "גברים בלבד", "אין לי העדפה"],
    },
    {
      key: "preferredAge",
      question: "באיזה טווח גילאים היית רוצה שהשותפים שלך יהיו?",
    },
    {
      key: "allowSmoking",
      question: "האם מפריע לך שיעשנו בבית?",
      options: ["כן", "לא"],
    },
    {
      key: "allowPets",
      question: "האם נוח לך לגור עם חיות מחמד?",
      options: ["כן", "לא"],
    },
    {
      key: "cleanlinessLevel",
      question: "עד כמה חשוב לך סדר וניקיון בדירה?",
      options: ["בכלל לא", "במידה סבירה", "חשוב לי ברמות!"],
    },
    {
      key: "sleepSchedule",
      question: "מתי אתה לרוב הולך לישון?",
      options: ["מוקדם", "מאוחר"],
    },
    {
      key: "socialLevel",
      question: "עד כמה אתה אוהב להיות בחברת אנשים בבית?",
      options: [
        "מעדיף את הבית שלי לעצמי",
        "אין לי בעיה שמארחים מדי פעם",
        "הבית שלי תמיד פתוח לאנשים",
      ],
    },
    {
      key: "workHours",
      question: "כמה שעות ביום אתה עובד בממוצע?",
      options: ["9 שעות", "12 שעות", "משתנה בכל יום"],
    },
    {
      key: "workFromHome",
      question: "האם אתה עובד מהבית?",
      options: ["כן", "לא"],
    },
    {
      key: "relationshipStatus",
      question: "מה הסטטוס הזוגי שלך?",
      options: ["רווק/ה", "בזוגיות", "בין סטוצים"],
    },
    {
      key: "socialStyle",
      question: "איך אתה אוהב לבלות את הזמן ?",
      options: ["יוצא לבלות הרבה", "אוהב להיות בבית", "תלוי ביום"],
    },
    {
      key: "openToFriendship",
      question: "האם אתה פתוח ליצור חברויות עם השותפים?",
      options: ["כן", "לא"],
    },
  ];

  const allFields: AnyField[] = [...introCard, ...fields];

  // ===== Effects =====

  useEffect(() => {
    fetch(`${API}RoommatePreferences/GetByUserId/${loginUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Preferences | null) => {
        setPreferences(data ?? {});
        setLoading(false);
      })
      .catch(() => {
        setPreferences({});
        setLoading(false);
      });
  }, [loginUserId]);

  // ===== Handlers =====

  const handleChange = (key: keyof Preferences, value: unknown) => {
    setPreferences((prev) => ({ ...prev, [key]: value } as Preferences));
  };

  const buildPayload = () => {
    return {
      preferenceId: preferences.preferenceId ?? 0,
      userId: loginUserId,
      preferredGender: preferences.preferredGender ?? "",
      preferredMinAge: preferences.preferredMinAge ?? 18,
      preferredMaxAge: preferences.preferredMaxAge ?? 99,
      allowSmoking: preferences.allowSmoking === "כן",
      allowPets: preferences.allowPets === "כן",
      cleanlinessLevel: preferences.cleanlinessLevel ?? "",
      sleepSchedule: preferences.sleepSchedule ?? "",
      socialLevel: preferences.socialLevel ?? "",
      workHours: preferences.workHours ?? "",
      workFromHome: preferences.workFromHome === "כן",
      hasPet: preferences.hasPet ?? false,
      petType: preferences.petType ?? "",
      relationshipStatus: preferences.relationshipStatus ?? "",
      socialStyle: preferences.socialStyle ?? "",
      openToFriendship: preferences.openToFriendship === "כן",
      notes: preferences.notes ?? "",
    };
  };

  const handleSaveAndFind = () => {
    const payload = buildPayload();

    fetch(`${API}RoommatePreferences/Upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() =>
        fetch(
          `${API}RoommatePreferences/GetMatches/${loginUserId}/${numOfRoommates}`
        )
      )
      .then((res) => res.json())
      .then((data: number[]) =>
        Promise.all(
          data.map((id) =>
            fetch(`${API}User/GetUserById/${id}`).then((res) => res.json())
          )
        )
      )
      .then((fullUsers: any[]) => {
        onMatchesFound(fullUsers);
      })
      .catch((err) => {
        console.error("Error:", err);
        Alert.alert("שגיאה", "אירעה שגיאה בתהליך.");
      });
  };

  const renderField = (field: QuestionField) => {
    if (field.key === "preferredAge") {
      const ageRange: [number, number] = [
        preferences.preferredMinAge ?? 18,
        preferences.preferredMaxAge ?? 99,
      ];

      return (
        <View style={styles.sliderContainer}>
          <MultiSlider
            values={ageRange}
            onValuesChangeStart={() => setScrollEnabled(false)}
            onValuesChange={(vals: number[]) => {
              handleChange("preferredMinAge", vals[0]);
              handleChange("preferredMaxAge", vals[1]);
            }}
            onValuesChangeFinish={() => setScrollEnabled(true)}
            min={18}
            max={99}
            step={1}
            allowOverlap={false}
            snapped
          />
          <Text
            style={styles.sliderText}
          >{`${ageRange[0]} - ${ageRange[1]} שנים`}</Text>
          <Text style={styles.helperText}>
            תבחר טווח שמרגיש לך נוח – אין תשובה נכונה או לא נכונה.
          </Text>
        </View>
      );
    }

    if (!field.options) return null;

    return (
      <View style={styles.optionsContainer}>
        {field.options.map((option, idx) => {
          const isSelected =
            (preferences[field.key as keyof Preferences] as
              | string
              | undefined) === option;

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.optionBtn, isSelected && styles.optionSelected]}
              onPress={() =>
                handleChange(field.key as keyof Preferences, option)
              }
              activeOpacity={0.85}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.optionRadio,
                    isSelected && styles.optionRadioSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  // ===== Render =====

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#2661A1" />
        <Text style={styles.loadingText}>טוען את ההעדפות שלך...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={26} color="#111827" />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="people-circle-outline" size={26} color="#2661A1" />
          <Text style={styles.headerTitle}>שאלון התאמת שותפים</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          נעבור על כמה שאלות כדי לעזור לך למצוא דירה שמרגישה כמו בית.
        </Text>
      </View>

      {/* Main Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center" }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
      >
        {allFields.map((field, index) => (
          <View
            key={index}
            style={[
              styles.pageContainer,
              { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 },
            ]}
          >
            <View style={styles.card}>
              {field.key === "intro" ? (
                <>
                  <Text style={styles.introTitle}>מלא את השאלון</Text>
                  <Text style={styles.introText}>
                    כדי שנוכל למצוא עבורך שותפים שמתאימים לאופי ולשגרה שלך.
                  </Text>

                  <View style={styles.divider} />

                  <Text style={styles.introTextSmall}>
                    כמה שותפים אתה מחפש?
                  </Text>

                  <View style={styles.roommatesButtonsContainer}>
                    {[1, 2, 3].map((num) => {
                      const isSelected = numOfRoommates === num;
                      return (
                        <TouchableOpacity
                          key={num}
                          style={[
                            styles.roommateButton,
                            isSelected && styles.roommateButtonSelected,
                          ]}
                          onPress={() => setNumOfRoommates(num)}
                          activeOpacity={0.9}
                        >
                          <Text
                            style={[
                              styles.roommateButtonText,
                              isSelected && styles.roommateButtonTextSelected,
                            ]}
                          >
                            {num}
                          </Text>
                          <Text
                            style={[
                              styles.roommateButtonSubText,
                              isSelected &&
                                styles.roommateButtonSubTextSelected,
                            ]}
                          >
                            {num === 1
                              ? "עוד שותף אחד"
                              : num === 2
                              ? "עוד שניים"
                              : "דירה חברתית"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.introHint}>
                    תוכל לשנות את זה גם אחר כך, זה רק כדי להבין מה הכיוון שלך.
                  </Text>

                  <View style={styles.scrollHintRow}>
                    <Ionicons
                      name="arrow-back-circle-outline"
                      size={22}
                      color="#6B7280"
                    />
                    <Text style={styles.introTextSmall}>
                      גלול ימינה כדי להתחיל לענות
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.questionHeader}>
                    <Text style={styles.stepBadge}>
                      שאלה {index} מתוך {fields.length}
                    </Text>
                    <Text style={styles.label}>{field.question}</Text>
                    <Text style={styles.helperText}>
                      נסה לענות בכנות – המטרה היא שתרגיש בבית עם מי שיגור איתך.
                    </Text>
                  </View>

                  {renderField(field as QuestionField)}

                  {index === allFields.length - 1 && (
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={handleSaveAndFind}
                      activeOpacity={0.9}
                    >
                      <Ionicons
                        name="sparkles-outline"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginLeft: 8 }}
                      />
                      <Text style={styles.submitText}>
                        מצא את השותפים המושלמים עבורך
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Progress + Dots */}
      <View style={styles.progressContainer}>
        <View style={styles.dotsRow}>
          {allFields.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, currentPage === idx && styles.dotActive]}
            />
          ))}
        </View>
        {currentPage > 0 && (
          <Text style={styles.progressText}>
            {currentPage} מתוך {fields.length}
          </Text>
        )}
      </View>
    </View>
  );
};

// ===== Styles =====

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#E5ECF5",
    paddingTop: 40,
  },
  loadingWrapper: {
    flex: 1,
    backgroundColor: "#E5ECF5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "right",
  },
  pageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    justifyContent: "center",
  },

  // Intro
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#111827",
  },
  introText: {
    fontSize: 16,
    textAlign: "center",
    color: "#4B5563",
  },
  introTextSmall: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  introHint: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
    width: "100%",
  },
  scrollHintRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  roommatesButtonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginVertical: 14,
    width: "100%",
  },
  roommateButton: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  roommateButtonSelected: {
    backgroundColor: "#2661A1",
    borderColor: "#2661A1",
  },
  roommateButtonText: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "600",
  },
  roommateButtonTextSelected: {
    color: "#FFFFFF",
  },
  roommateButtonSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  roommateButtonSubTextSelected: {
    color: "#E5ECF5",
  },

  // Questions
  questionHeader: {
    marginBottom: 16,
    alignItems: "flex-end",
  },
  stepBadge: {
    fontSize: 12,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    color: "#111827",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 4,
  },

  optionsContainer: {
    width: "100%",
    gap: 10 as any, // React Native doesn't officially support `gap` yet; remove if needed
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },
  optionSelected: {
    backgroundColor: "#2661A1",
    borderColor: "#1D4ED8",
  },
  optionContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginLeft: 10,
    backgroundColor: "transparent",
  },
  optionRadioSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    flexShrink: 1,
    textAlign: "right",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },

  // Slider
  sliderContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  sliderText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
  },

  // Submit
  submitBtn: {
    marginTop: 32,
    backgroundColor: "#2661A1",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  // Progress
  progressContainer: {
    position: "absolute",
    bottom: 26,
    width: "100%",
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#CBD5F5",
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: "#2661A1",
  },
  progressText: {
    fontSize: 14,
    color: "#374151",
  },
});

export default RoommatePreferencesForm;
