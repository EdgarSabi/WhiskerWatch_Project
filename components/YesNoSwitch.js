// Een schuifje voor een ja/nee-vraag, bijvoorbeeld "Bloed gezien".
// Staat standaard uit (= "Nee"), zodat je voor het gewone geval niets hoeft
// aan te raken. We bewaren de waarde nog steeds als "Ja" of "Nee" (tekst),
// zodat de rest van de app (samenvattingen, opgeslagen observaties) niet
// hoeft te veranderen — alleen hoe je het hier invult.

import { View, Text, Switch, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function YesNoSwitch({ label, value, onValueChange }) {
  const isYes = value === "Ja";

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={isYes}
        onValueChange={(newValue) => onValueChange(newValue ? "Ja" : "Nee")}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default YesNoSwitch;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    color: Colors.text,
  },
});
