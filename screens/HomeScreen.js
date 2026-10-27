import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CatCard from "../components/CatCard";
import Colors from "../constants/colors";
import { loadCats } from "../storage/catStorage";
import { loadObservations } from "../storage/observationStorage";
import { getLastObservationText } from "../helpers/observationHelpers";

function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cats, setCats] = useState([]);
  const [observations, setObservations] = useState([]);

  // useFocusEffect draait elke keer dat dit scherm in beeld komt. Zo staat een
  // nieuwe, bewerkte of verwijderde kat meteen goed in de lijst, en klopt de
  // regel "Laatst: ..." nadat je een observatie hebt toegevoegd.
  useFocusEffect(
    useCallback(() => {
      async function loadSavedData() {
        const savedCats = await loadCats();
        const savedObservations = await loadObservations();
        setCats(savedCats);
        setObservations(savedObservations);
      }

      loadSavedData();
    }, [])
  );

  // navigation.navigate("CatProfile", { cat: item }) doet twee dingen:
  // 1. Het legt het CatProfile-scherm boven op de stapel (dus je ziet het).
  // 2. Het geeft de aangetikte kat mee als "route params": extra data die
  //    het nieuwe scherm kan uitlezen via zijn eigen route-prop
  //    (zie CatProfileScreen: route.params.cat).
  function catPressHandler(cat) {
    navigation.navigate("CatProfile", { cat: cat });
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 16 }]}>
      <FlatList
        data={cats}
        keyExtractor={(cat) => cat.id}
        renderItem={({ item, index }) => (
          <CatCard
            name={item.name}
            initial={item.initial}
            photoUri={item.photoUri}
            lastObservation={getLastObservationText(
              observations.filter((observation) => observation.catId === item.id)
            )}
            index={index}
            onPress={() => catPressHandler(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {/* katjes toevoegen */}
      <Pressable
        style={({ pressed }) => [styles.addCatButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("CatForm")}
      >
        <Text style={styles.addCatButtonText}>+ Kat toevoegen</Text>
      </Pressable>

      {/* observaties toevoegen */}
      <Pressable
        style={({ pressed }) => [styles.addObservationButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("AddObservation")}
      >
        <Text style={styles.addObservationButtonText}>+ Observatie toevoegen</Text>
      </Pressable>

      {/* tijdlijn en dierenartsoverzicht, naast elkaar */}
      <View style={styles.linkRow}>
        <Pressable
          style={({ pressed }) => [styles.timelineLink, pressed && styles.timelineLinkPressed]}
          onPress={() => navigation.navigate("Timeline")}
        >
          <Text style={styles.timelineLinkText}>Tijdlijn bekijken</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.timelineLink, pressed && styles.timelineLinkPressed]}
          onPress={() => navigation.navigate("VetOverview")}
        >
          <Text style={styles.timelineLinkText}>Dierenartsoverzicht</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  list: {
    paddingBottom: 12,
  },
  addCatButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addCatButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
  },
  addObservationButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  addObservationButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  linkRow: {
    flexDirection: "row",
  },
  timelineLink: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  timelineLinkPressed: {
    opacity: 0.6,
  },
  timelineLinkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
