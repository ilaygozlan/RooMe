import FloatingTabBar from "@/components/navigation/FloatingTabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <FloatingTabBar {...p} centerRouteName="uploadApartmentForm" />}>
      <Tabs.Screen name="home" options={{ title: "דף הבית" }} />
      <Tabs.Screen name="saved" options={{ title: "דירות שמורות" }} />
      <Tabs.Screen name="messages" options={{ title: "הודעות" }} />
      <Tabs.Screen name="profile" options={{ title: "פרופיל" }} />
    </Tabs>
  );
}
