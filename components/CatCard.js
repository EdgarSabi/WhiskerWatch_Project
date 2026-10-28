import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import Fonts from "../constants/fonts";
import { getPhotoSource } from "../helpers/photoHelpers";
import LastObservation from "./LastObservation";

// katten krijgen om de beurt een kleur, met een donkere kleur voor de beginletter
const avatarStyles = [
  { background: Colors.avatarPink, ink: Colors.primary },
  { background: Colors.avatarGreen, ink: Colors.inkGreen },
  { background: Colors.avatarGold, ink: Colors.inkGold },
];

function CatCard({
  name,
  lastObservation,
  onLastObservationPress,
  initial,
  photoUri,
  index,
  onPress,
}) {
  const avatarStyle = avatarStyles[index % avatarStyles.length];

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: Colors.border }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarStyle.background }]}>
        {photoUri ? (
          <Image source={getPhotoSource(photoUri)} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: avatarStyle.ink }]}>{initial}</Text>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {lastObservation ? (
          <LastObservation observation={lastObservation} onPress={onLastObservationPress} />
        ) : (
          <Text style={styles.noObservations}>Nog geen observaties</Text>
        )}
      </View>

      <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textLight} />
    </Pressable>
  );
}

export default CatCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: Colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  noObservations: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 3,
  },
});
