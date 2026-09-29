//VOEG NOG NIKS TOE MAAR LAAT EVEN EEN ALERT ZIEN DAT HET WERKT
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import Colors from "../constants/colors";

const OBSERVATION_TYPES = [
  { id: "1", label: "Ontlasting" },
  { id: "2", label: "Braken" },
  { id: "3", label: "Eten & drinken" },
  { id: "4", label: "Gedrag" },
  { id: "5", label: "Medicatie" },
  { id: "6", label: "Gewicht" },
  { id: "7", label: "Algemene notitie" },
];

function AddObservationScreen({ route, navigation }) {
  const cat = route.params?.cat;

  function typePressHandler(type) {
    // Alleen "Ontlasting" heeft al een eigen scherm. De rest laat voorlopig
    // gewoon een Alert zien, zodat je weet dat de knop werkt.
    if (type === "Ontlasting") {
      navigation.navigate("PoopObservation", { cat: cat });
      return;
    }

    Alert.alert(type, "Testmodus - Later observatie toevoegen");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.subtitle}>
        {cat ? `Voor ${cat.name} — wat is er aan de hand?` : "Wat is er aan de hand?"}
      </Text>

      <FlatList
        data={OBSERVATION_TYPES}
        keyExtractor={(type) => type.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => typePressHandler(item.label)}
          >
            <Text style={styles.cardText}>{item.label}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

export default AddObservationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: Colors.textLight,
    marginBottom: 16,
    fontSize: 15,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});
