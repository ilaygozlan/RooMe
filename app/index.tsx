import { useAuth } from "@/lib/auth/AuthContext";
import {useEffect} from 'react';
import { useApartments } from "@/context/ApartmentsContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { user } = useAuth();
  const { initializeOnLogin } = useApartments();
  useEffect(() => {
    if (user) {
      initializeOnLogin(); 
    }
  }, [user]);

  if (!user) return <Redirect href="/(auth)/auth" />;
  return <Redirect href="/(tabs)/home" />;
}
