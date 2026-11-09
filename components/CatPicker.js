// kattenkeuze bovenaan elk observatieformulier, met "Kat onbekend" als laatste keuze
// testers wisten niet dat Kat onbekend kon, daarom een vraagteken-icoon en een korte hint eronder
//
// Elke kat heeft nu ook een klein avatar-rondje voor de naam, met dezelfde
// kleuren/foto als op Home (CatCard), zodat je in één oogopslag ziet welke
// kat welke is — vooral handig met meerdere katten.

import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import FormLabel from "./FormLabel";
import { getPhotoSource } from "../helpers/photoHelpers";
import { UNKNOWN_CAT } from "../storage/catStorage";

// zelfde kleuren-rotatie als CatCard, zodat een kat overal dezelfde kleur heeft
const avatarStyles = [
  { background: Colors.avatarPink, ink: Colors.primary },
  { background: Colors.avatarGreen, ink: Colors.inkGreen },
  { background: Colors.avatarGold, ink: Colors.inkGold },
];

function CatPicker({ cats, selectedCat, onSelect }) {
  return (
    <View style={styles.container}>
      <FormLabel text="Kat" tag="required" />
      <View style={styles.pillRow}>
        {[...cats, UNKNOWN_CAT].map((option, index) => {
          const isSelected = selectedCat?.id === option.id;
          const isUnknown = option.id === UNKNOWN_CAT.id;
          const avatarStyle = avatarStyles[index % avatarStyles.length];

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
              ) : (
                <View style={[styles.avatar, { backgroundColor: avatarStyle.background }]}>
                  {option.photoUri ? (
                    <Image source={getPhotoSource(option.photoUri)} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: avatarStyle.ink }]}>
                      {option.initial}
                    </Text>
                  )}
                </View>
              )}
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillDashed: {
    borderStyle: "dashed",
    paddingHorizontal: 14,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "bold",
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
