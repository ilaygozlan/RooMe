import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-5 py-4">{children}</View>
    </SafeAreaView>
  );
}



