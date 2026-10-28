// kopje boven een veld, met optioneel een labeltje: tag="required" (verplicht) of tag="optional" (optioneel)

import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function FormLabel({ text, tag }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{text}</Text>

      {tag === "required" ? (
        <View style={[styles.tag, styles.tagRequired]}>
          <Text style={[styles.tagText, styles.tagRequiredText]}>verplicht</Text>
        </View>
      ) : null}

      {tag === "optional" ? (
        <View style={[styles.tag, styles.tagOptional]}>
          <Text style={[styles.tagText, styles.tagOptionalText]}>optioneel</Text>
        </View>
      ) : null}
    </View>
  );
}

export default FormLabel;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
  },
  tag: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagRequired: {
    backgroundColor: Colors.avatarPink,
  },
  tagOptional: {
    backgroundColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tagRequiredText: {
    color: Colors.primary,
  },
  tagOptionalText: {
    color: Colors.textLight,
  },
});
