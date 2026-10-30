import { Text, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import { getRelativeText } from "../helpers/observationHelpers";

function LastObservation({ observation, onPress }) {
  return (
      <Text style={styles.text} numberOfLines={2}>
        Laatst: <Text style={styles.type}>{observation.type}</Text> ·{" "}
        {getRelativeText(observation)}
      </Text>
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
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.6,
  },
});
