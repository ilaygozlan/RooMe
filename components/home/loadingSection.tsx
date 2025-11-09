import React from "react";
import { View } from "react-native";
import HouseLoading from "@/components/ui/loadingHouseSign";

export const LoadingSection: React.FC<{ text: string }> = ({ text }) => (
  <View style={{ paddingVertical: 32, alignItems: "center" }}>
    <HouseLoading text={text} overlay={false} />
  </View>
);