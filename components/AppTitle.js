import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import Fonts from "../constants/fonts";

function AppTitle() {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name="paw" size={22} color={Colors.primary} />
      <Text style={styles.title}>WhiskerWatch</Text>
    </View>
  );
}

export default AppTitle;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.text,
  },
});
