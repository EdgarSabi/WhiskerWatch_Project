import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { OBSERVATION_TYPES } from "../constants/observationTypes";

function AddObservationScreen({ route, navigation }) {
  const cat = route.params?.cat;
  const insets = useSafeAreaInsets();


  function typePressHandler(type) {
    navigation.navigate(type.screen, { cat: cat });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.subtitle}>
        {cat ? `Voor ${cat.name} — wat is er aan de hand?` : "Wat is er aan de hand?"}
      </Text>

      <FlatList
        data={OBSERVATION_TYPES}
        keyExtractor={(type) => type.id}
        // De FlatList scrollt al zelf; deze extra ruimte onderaan zorgt dat het
        // laatste type boven de Android-navigatiebalk kan komen.
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => typePressHandler(item)}
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
