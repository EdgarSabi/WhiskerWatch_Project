// "Laatst: Eten & drinken · 2u geleden" onder de kattennaam, het type in bordeaux zodat je ziet dat het aantikbaar is
// krijgt alleen een echte observatie, zonder observaties toont het scherm zelf gewone tekst

import { Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import { getRelativeText } from "../helpers/observationHelpers";

function LastObservation({ observation, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      // groter tikgebied dan de kleine tekst
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Text style={styles.text} numberOfLines={2}>
        Laatst: <Text style={styles.type}>{observation.type}</Text> ·{" "}
        {getRelativeText(observation)}
      </Text>
    </Pressable>
  );
}

export default LastObservation;

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 3,
  },
  type: {
    color: Colors.primary,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.6,
  },
});
