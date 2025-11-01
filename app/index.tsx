import { useAuth } from "@/lib/auth/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/auth" />;
  return <Redirect href="/(tabs)/home" />;
}
