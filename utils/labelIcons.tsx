import React from "react";
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

// Icon map: english label -> icon element
export const labelToIcon: Record<string, React.ReactElement> = {
  couch: <FontAwesome5 name="couch" size={24} />,
  sofa: <FontAwesome5 name="couch" size={24} />,
  armchair: <MaterialCommunityIcons name="seat" size={24} />,
  chair: <MaterialIcons name="chair" size={24} />,
  table: <MaterialIcons name="table-restaurant" size={24} />,
  "coffee table": <MaterialCommunityIcons name="coffee" size={24} />,
  "dining table": <MaterialIcons name="table-restaurant" size={24} />,
  desk: <MaterialCommunityIcons name="desk" size={24} />,
  bed: <FontAwesome5 name="bed" size={24} />,
  "bunk bed": <MaterialCommunityIcons name="bunk-bed" size={24} />,
  mattress: <MaterialCommunityIcons name="bed-king" size={24} />,
  dresser: <MaterialCommunityIcons name="dresser" size={24} />,
  wardrobe: <MaterialCommunityIcons name="wardrobe" size={24} />,
  tv: <MaterialIcons name="tv" size={24} />,
  lamp: <MaterialIcons name="emoji-objects" size={24} />,
  bookshelf: <MaterialCommunityIcons name="bookshelf" size={24} />,
  balcony: <MaterialCommunityIcons name="balcony" size={24} />,
  "air conditioner": <MaterialCommunityIcons name="air-conditioner" size={24} />,
  "washing machine": <MaterialCommunityIcons name="washing-machine" size={24} />,
  garden: <MaterialCommunityIcons name="flower" size={24} />,
  elevator: <MaterialCommunityIcons name="elevator" size={24} />,
  parking: <MaterialIcons name="local-parking" size={24} />,
  dishwasher: <MaterialCommunityIcons name="dishwasher" size={24} />,
  microwave: <MaterialCommunityIcons name="microwave" size={24} />,
  oven: <MaterialCommunityIcons name="stove" size={24} />,
  fridge: <MaterialCommunityIcons name="fridge-outline" size={24} />,
  jacuzzi: <MaterialCommunityIcons name="hot-tub" size={24} />,
};
