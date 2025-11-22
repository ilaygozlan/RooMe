import { DatePickerField, GenderSelector, ProfileImagePicker, ToggleField } from "@/components/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/ui/ThemeProvider";
import { loginSchema, signupSchema } from "@/lib/validation/authSchemas";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type AuthMode = "login" | "signup";

export default function Auth() {
  const { user, login, signup } = useAuth();
  const { palette } = useTheme();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    displayName: "",
    job: "",
    phoneNumber: "",
    gender: undefined as "male" | "female" | "other" | "prefer-not-to-say" | undefined,
    birthDate: "",
    ownPet: false,
    smoke: false,
    profileImage: null as string | null,
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const loginPasswordRef = useRef<TextInput>(null);
  const signupEmailRef = useRef<TextInput>(null);
  const signupPasswordRef = useRef<TextInput>(null);
  const signupJobRef = useRef<TextInput>(null);
  const signupPhoneRef = useRef<TextInput>(null);

  if (user) return <Redirect href="/(tabs)/home" />;

  const handleModeToggle = (newMode: AuthMode) => {
    if (newMode !== mode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMode(newMode);
      setErrors({});
    }
  };

  async function handleLogin() {
    setErrors({});
    const parsed = loginSchema.safeParse(loginForm);
    if (!parsed.success) {
      const err: any = {};
      for (const i of parsed.error.issues) err[i.path[0] as string] = i.message;
      setErrors(err);
      return;
    }
    try {
      await login(loginForm.email.trim(), loginForm.password);
    } catch (e: any) {
      setErrors({ root: e.message || "Login failed" });
    }
  }

  async function handleSignup() {
    setErrors({});
    const parsed = signupSchema.safeParse(signupForm);
    if (!parsed.success) {
      const err: any = {};
      for (const i of parsed.error.issues) err[i.path[0] as string] = i.message;
      setErrors(err);
      return;
    }
    try {
      // For now, only pass required fields. Additional fields are collected for future use
      await signup(
        signupForm.email.trim(),
        signupForm.password,
        signupForm.displayName.trim()
      );
      // TODO: Update AuthContext.signup to accept additional fields:
      // profileImage, job, phoneNumber, gender, birthDate, ownPet, smoke
    } catch (e: any) {
      setErrors({ root: e.message || "Signup failed" });
    }
  }

  const isLogin = mode === "login";

  return (
    <Screen padded={false}>
      <LinearGradient
        colors={["#FFF8F2", "#FFFFFF"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.container}>
            {/* Header Section with Orange Accent */}
            <View style={styles.headerSection}>
              <View style={[styles.logoContainer, { backgroundColor: palette.primary + "15" }]}>
                <Ionicons name="home" size={32} color={palette.primary} />
              </View>
              <Text style={[styles.welcomeText, { color: palette.textMuted }]}>
                {isLogin ? "Welcome back" : "Join RooMe"}
              </Text>
              <Text style={[styles.titleText, { color: palette.text }]}>
                {isLogin ? "Sign in to continue" : "Create your account"}
              </Text>
              <Text style={[styles.subtitleText, { color: palette.textMuted }]}>
                {isLogin
                  ? "Find your perfect home and roommate match"
                  : "Start your journey to finding the perfect living space"}
              </Text>
            </View>

            {/* Mode Toggle */}
            <View style={[styles.modeToggle, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Pressable
                onPress={() => handleModeToggle("login")}
                style={[
                  styles.modeButton,
                  isLogin && { backgroundColor: palette.primary },
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: isLogin ? palette.onPrimary : palette.textMuted,
                      fontFamily: isLogin ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleModeToggle("signup")}
                style={[
                  styles.modeButton,
                  !isLogin && { backgroundColor: palette.primary },
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: !isLogin ? palette.onPrimary : palette.textMuted,
                      fontFamily: !isLogin ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Form Card */}
            <Card>
              <Animated.View
                key={mode}
                entering={FadeIn.duration(300).delay(50)}
                exiting={FadeOut.duration(200)}
              >
                {isLogin ? (
                  <View style={styles.formContent}>
                    <TextField
                      label="Email"
                      value={loginForm.email}
                      onChangeText={(email) => setLoginForm((f) => ({ ...f, email }))}
                      placeholder="you@roome.app"
                      error={errors.email}
                      returnKeyType="next"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onSubmitEditing={() => loginPasswordRef.current?.focus()}
                      accessibilityLabel="Email address"
                    />
                    <TextField
                      label="Password"
                      value={loginForm.password}
                      onChangeText={(password) => setLoginForm((f) => ({ ...f, password }))}
                      placeholder="••••••••"
                      secureTextEntry
                      error={errors.password}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      ref={loginPasswordRef}
                      accessibilityLabel="Password"
                    />
                    {errors.root ? (
                      <View style={[styles.errorContainer, { backgroundColor: palette.danger + "15" }]}>
                        <Ionicons name="alert-circle" size={16} color={palette.danger} />
                        <Text style={[styles.errorText, { color: palette.danger }]}>{errors.root}</Text>
                      </View>
                    ) : null}
                    <Button title="Sign in" onPress={handleLogin} />
                  </View>
                ) : (
                  <View style={styles.formContent}>
                      {/* Profile Image */}
                      <ProfileImagePicker
                        imageUri={signupForm.profileImage}
                        onImageSelected={(uri) => setSignupForm((f) => ({ ...f, profileImage: uri }))}
                        error={errors.profileImage}
                      />

                      {/* Basic Info Section */}
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: palette.text }]}>Basic Information</Text>
                        <TextField
                          label="Full name"
                          value={signupForm.displayName}
                          onChangeText={(displayName) => setSignupForm((f) => ({ ...f, displayName }))}
                          placeholder="Your name"
                          error={errors.displayName}
                          returnKeyType="next"
                          autoCapitalize="words"
                          onSubmitEditing={() => signupEmailRef.current?.focus()}
                          accessibilityLabel="Full name"
                        />
                        <TextField
                          label="Email"
                          value={signupForm.email}
                          onChangeText={(email) => setSignupForm((f) => ({ ...f, email }))}
                          placeholder="you@roome.app"
                          error={errors.email}
                          returnKeyType="next"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          onSubmitEditing={() => signupPasswordRef.current?.focus()}
                          ref={signupEmailRef}
                          accessibilityLabel="Email address"
                        />
                        <TextField
                          label="Password"
                          value={signupForm.password}
                          onChangeText={(password) => setSignupForm((f) => ({ ...f, password }))}
                          placeholder="Strong password"
                          secureTextEntry
                          error={errors.password}
                          returnKeyType="next"
                          onSubmitEditing={() => signupPhoneRef.current?.focus()}
                          ref={signupPasswordRef}
                          accessibilityLabel="Password"
                        />
                      </View>

                      {/* Contact & Professional Section */}
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: palette.text }]}>Contact & Professional</Text>
                        <TextField
                          label="Phone Number"
                          value={signupForm.phoneNumber}
                          onChangeText={(phoneNumber) => setSignupForm((f) => ({ ...f, phoneNumber }))}
                          placeholder="+1 (555) 123-4567"
                          error={errors.phoneNumber}
                          returnKeyType="next"
                          keyboardType="phone-pad"
                          onSubmitEditing={() => signupJobRef.current?.focus()}
                          ref={signupPhoneRef}
                          accessibilityLabel="Phone number"
                        />
                        <TextField
                          label="Job / Profession"
                          value={signupForm.job}
                          onChangeText={(job) => setSignupForm((f) => ({ ...f, job }))}
                          placeholder="Software Engineer"
                          error={errors.job}
                          returnKeyType="next"
                          autoCapitalize="words"
                          ref={signupJobRef}
                          accessibilityLabel="Job"
                        />
                      </View>

                      {/* Personal Details Section */}
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: palette.text }]}>Personal Details</Text>
                        <DatePickerField
                          label="Birth Date"
                          value={signupForm.birthDate}
                          onChange={(birthDate) => setSignupForm((f) => ({ ...f, birthDate }))}
                          error={errors.birthDate}
                          placeholder="YYYY-MM-DD"
                        />
                        <GenderSelector
                          label="Gender"
                          value={signupForm.gender}
                          onChange={(gender) => setSignupForm((f) => ({ ...f, gender }))}
                          error={errors.gender}
                        />
                      </View>

                      {/* Lifestyle Preferences Section */}
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: palette.text }]}>Lifestyle Preferences</Text>
                        <ToggleField
                          label="Own a pet"
                          value={signupForm.ownPet}
                          onChange={(ownPet) => setSignupForm((f) => ({ ...f, ownPet }))}
                          icon="paw"
                        />
                        <ToggleField
                          label="Smoke"
                          value={signupForm.smoke}
                          onChange={(smoke) => setSignupForm((f) => ({ ...f, smoke }))}
                          icon="flame"
                        />
                      </View>

                      {errors.root ? (
                        <View style={[styles.errorContainer, { backgroundColor: palette.danger + "15" }]}>
                          <Ionicons name="alert-circle" size={16} color={palette.danger} />
                          <Text style={[styles.errorText, { color: palette.danger }]}>{errors.root}</Text>
                        </View>
                      ) : null}
                      <Button title="Create account" onPress={handleSignup} />
                  </View>
                )}
              </Animated.View>
            </Card>

            {/* Footer Link */}
            {isLogin ? (
              <Pressable
                onPress={() => handleModeToggle("signup")}
                hitSlop={8}
                style={styles.footerLink}
              >
                <Text style={[styles.footerText, { color: palette.textMuted }]}>
                  New here?{" "}
                  <Text style={[styles.footerLinkText, { color: palette.primary }]}>Create an account</Text>
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleModeToggle("login")}
                hitSlop={8}
                style={styles.footerLink}
              >
                <Text style={[styles.footerText, { color: palette.textMuted }]}>
                  Already have an account?{" "}
                  <Text style={[styles.footerLinkText, { color: palette.primary }]}>Sign in</Text>
                </Text>
              </Pressable>
            )}
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  headerSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  titleText: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonText: {
    fontSize: 15,
  },
  formContent: {
    gap: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginBottom: 16,
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    flex: 1,
  },
  footerLink: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  footerLinkText: {
    fontFamily: "Inter_600SemiBold",
  },
});
