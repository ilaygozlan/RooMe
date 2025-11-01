import { Pressable, Text } from "react-native";

export default function Button({
  title,
  onPress,
  disabled,
}: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="bg-primary rounded-2xl py-3 items-center justify-center opacity-100 active:opacity-90"
      style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
    >
      <Text className="text-white font-semibold text-base">{title}</Text>
    </Pressable>
  );
}



