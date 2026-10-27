// LastObservation is de kleine regel "Laatst: Eten & drinken · 2u geleden" onder de
// naam van een kat op het dashboard. Het type staat in bordeaux, zodat je ziet dat
// je erop kunt tikken; dan opent die observatie. Verder is het gewone, rustige tekst.
//
// Heeft de kat nog geen observaties, dan toont het scherm zelf gewone tekst;
// dit component krijgt alleen een echte observatie.

import { Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import { getRelativeText } from "../helpers/observationHelpers";

function LastObservation({ observation, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      // Een ruimer tikgebied dan de kleine tekst, zonder dat de kaart groter wordt.
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
