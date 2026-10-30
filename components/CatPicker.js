// kattenkeuze bovenaan elk observatieformulier, met "Kat onbekend" als laatste keuze
// testers wisten niet dat Kat onbekend kon, daarom een vraagteken-icoon en een korte hint eronder

import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import FormLabel from "./FormLabel";
import { UNKNOWN_CAT } from "../storage/catStorage";

function CatPicker({ cats, selectedCat, onSelect }) {
  return (
    <View style={styles.container}>
      <FormLabel text="Kat" tag="required" />
      <View style={styles.pillRow}>
        {[...cats, UNKNOWN_CAT].map((option) => {
          const isSelected = selectedCat?.id === option.id;
          const isUnknown = option.id === UNKNOWN_CAT.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option)}
              style={[styles.pill, isUnknown && styles.pillDashed, isSelected && styles.pillSelected]}
            >
              {isUnknown ? (
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={16}
                  color={isSelected ? "#FFFFFF" : Colors.text}
                />
              ) : null}
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {option.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Weet je niet welke kat het was? Kies dan &lsquo;{UNKNOWN_CAT.name}&rsquo;.
      </Text>
    </View>
  );
}

export default CatPicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillDashed: {
    borderStyle: "dashed",
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  hint: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
