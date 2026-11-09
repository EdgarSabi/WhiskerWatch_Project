// klein, wegklikbaar tipje — geen volledige tutorial, gewoon één zin
// op het juiste moment. Het scherm bepaalt zelf of hij getoond wordt
// (via hintStorage) en roept onDismiss aan om 'm te onthouden.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";

function HintBanner({ text, onDismiss }) {
  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons
        name="lightbulb-outline"
        size={18}
        color={Colors.inkGold}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={onDismiss} hitSlop={10} accessibilityLabel="Tip sluiten">
        <MaterialCommunityIcons name="close" size={18} color={Colors.textLight} />
      </Pressable>
    </View>
  );
}

export default HintBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.avatarGold,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 19,
  },
});
