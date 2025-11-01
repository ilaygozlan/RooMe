import { clsx } from "clsx";
import { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export default forwardRef<TextInput, Props>(function FormTextInput(
  { label, error, ...props }, ref
) {
  return (
    <View className="mb-4">
      {label ? <Text className="text-white/80 mb-2">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={clsx(
          "bg-card text-white px-4 py-3 rounded-2xl",
          error && "border border-red-500"
        )}
        placeholderTextColor="#8A8A8E"
        {...props}
      />
      {error ? <Text className="text-red-400 mt-1">{error}</Text> : null}
    </View>
  );
});




