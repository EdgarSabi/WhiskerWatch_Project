import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { OBSERVATION_TYPES } from "../constants/observationTypes";

//eerste zes in twee kolommen, rest als brede kaart 
const GRID_TYPES = OBSERVATION_TYPES.slice(0, -1);
const NOTE_TYPE = OBSERVATION_TYPES[OBSERVATION_TYPES.length - 1];

function AddObservationScreen({ route, navigation }) {
  const cat = route.params?.cat;
  const insets = useSafeAreaInsets();

  function typePressHandler(type) {
    navigation.navigate(type.screen, { cat: cat });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.subtitle}>
        {cat ? `Wat is er aan de hand met ${cat.name}?` : "Wat is er aan de hand?"}
      </Text>

      <FlatList
        data={GRID_TYPES}
        keyExtractor={(type) => type.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        // ruimte onderaan, anders zit het laatste blok achter de Android-navigatiebalk
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => typePressHandler(item)}
          >
            <MaterialCommunityIcons name={item.icon} size={32} color={Colors.primary} />
            <Text style={styles.cardText}>{item.label}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [styles.wideCard, pressed && styles.cardPressed]}
            onPress={() => typePressHandler(NOTE_TYPE)}
          >
            <MaterialCommunityIcons name={NOTE_TYPE.icon} size={26} color={Colors.primary} />
            <Text style={styles.cardText}>Algemene notitie / overig</Text>
          </Pressable>
        }
      />
    </View>
  );
}

export default AddObservationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: Colors.textLight,
    marginBottom: 16,
    fontSize: 15,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    marginBottom: 12,
  },
  wideCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 32,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
});
