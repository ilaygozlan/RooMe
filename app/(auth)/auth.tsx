import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/ui/ThemeProvider";
import { loginSchema, signupSchema } from "@/lib/validation/authSchemas";
import * as Haptics from "expo-haptics";
import { Redirect } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type AuthMode = "login" | "signup";

export default function Auth() {
  const { user, login, signup } = useAuth();
  const { palette } = useTheme();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", displayName: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  
  const loginPasswordRef = useRef<TextInput>(null);
  const signupEmailRef = useRef<TextInput>(null);
  const signupPasswordRef = useRef<TextInput>(null);

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
      await signup(signupForm.email.trim(), signupForm.password, signupForm.displayName.trim());
    } catch (e: any) {
      setErrors({ root: e.message || "Signup failed" });
    }
  }

  const isLogin = mode === "login";

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 18 }}>
        {/* Header Section */}
        <View>
          <Text style={{ color: palette.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 6 }}>
            {isLogin ? "Welcome" : "Join Roome"}
          </Text>
          <Text style={{ color: palette.text, fontFamily: "Inter_700Bold", fontSize: 30, marginBottom: 2 }}>
            {isLogin ? "Sign in to Roome" : "Create your account"}
          </Text>
          <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular" }}>
            {isLogin ? "Find your next home and roommate match." : "It takes less than a minute."}
          </Text>
        </View>

        {/* Form Card */}
        <Card>
          <Animated.View
            key={mode}
            entering={FadeIn.duration(200).delay(50)}
            exiting={FadeOut.duration(150)}
          >
            {isLogin ? (
              <View>
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
                  <Text style={{ color: palette.danger, marginBottom: 8, fontFamily: "Inter_400Regular" }}>
                    {errors.root}
                  </Text>
                ) : null}
                <Button title="Sign in" onPress={handleLogin} />
                <Pressable
                  onPress={() => handleModeToggle("signup")}
                  hitSlop={8}
                  style={{ marginTop: 14 }}
                >
                  <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                    New here?{" "}
                    <Text style={{ color: palette.primary, fontFamily: "Inter_500Medium" }}>Create an account</Text>
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View>
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
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                  ref={signupPasswordRef}
                  accessibilityLabel="Password"
                />
                {errors.root ? (
                  <Text style={{ color: palette.danger, marginBottom: 8, fontFamily: "Inter_400Regular" }}>
                    {errors.root}
                  </Text>
                ) : null}
                <Button title="Create account" onPress={handleSignup} />
                <Pressable
                  onPress={() => handleModeToggle("login")}
                  hitSlop={8}
                  style={{ marginTop: 14 }}
                >
                  <Text style={{ color: palette.textMuted, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                    Already have an account?{" "}
                    <Text style={{ color: palette.primary, fontFamily: "Inter_500Medium" }}>Sign in</Text>
                  </Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </Card>
      </View>
    </Screen>
  );
}


