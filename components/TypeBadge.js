// TypeBadge is het kleine vierkantje links op een observatie: het icoon van het
// type op een zachte achtergrondkleur. Heeft de observatie een foto, dan tonen
// we die foto (even groot) in plaats van het icoon.

import { View, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { getObservationType } from "../constants/observationTypes";

function TypeBadge({ type, photoUri, size = 44 }) {
  if (photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={[styles.badge, { width: size, height: size }, styles.photo]}
      />
    );
  }

  const observationType = getObservationType(type);

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: observationType.tint },
      ]}
    >
      <MaterialCommunityIcons
        name={observationType.icon}
        size={Math.round(size * 0.5)}
        color={observationType.ink}
      />
    </View>
  );
}

export default TypeBadge;

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    backgroundColor: Colors.border,
  },
});
