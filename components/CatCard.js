import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import { getPhotoSource } from "../helpers/photoHelpers";

const avatarColors = [Colors.avatarPink, Colors.avatarGreen, Colors.avatarGold];

function CatCard({ name, lastObservation, initial, photoUri, index, onPress }) {
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: Colors.border }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        {/* Heeft de kat een foto? Dan tonen we die, anders de beginletter. */}
        {photoUri ? (
          <Image source={getPhotoSource(photoUri)} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.observation}>{lastObservation}</Text>
      </View>
    </Pressable>
  );
}

export default CatCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
  },
  cardPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  observation: {
    color: Colors.textLight,
    marginTop: 4,
  },
});
