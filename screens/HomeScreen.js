import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import CatCard from "../components/CatCard";
import TabBar from "../components/TabBar";
import Colors from "../constants/colors";
import { loadCats } from "../storage/catStorage";
import { loadObservations } from "../storage/observationStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import { getLastObservation } from "../helpers/observationHelpers";

function HomeScreen({ navigation }) {
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

  // De laatste observatie openen in het bewerkscherm dat daarbij hoort (hetzelfde
  // als "Bewerken" in de tijdlijn).
  function lastObservationPressHandler(observation) {
    const observationType = OBSERVATION_TYPES.find((type) => type.label === observation.type);
    navigation.navigate(observationType.screen, { observation: observation });
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={cats}
        keyExtractor={(cat) => cat.id}
        renderItem={({ item, index }) => {
          const catObservations = observations.filter(
            (observation) => observation.catId === item.id
          );
          const lastObservation = getLastObservation(catObservations);

          return (
            <CatCard
              name={item.name}
              initial={item.initial}
              photoUri={item.photoUri}
              lastObservation={lastObservation}
              onLastObservationPress={() => lastObservationPressHandler(lastObservation)}
              index={index}
              onPress={() => catPressHandler(item)}
            />
          );
        }}
        // Zijn er geen katten (bijv. allemaal verwijderd), dan niet een leeg scherm.
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nog geen katten. Voeg er een toe met de knop hieronder.</Text>
        }
        // katjes toevoegen: onder de laatste kaart, als stippellijn-knop
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [styles.addCatButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate("CatForm")}
          >
            <MaterialCommunityIcons name="plus" size={20} color={Colors.textLight} />
            <Text style={styles.addCatButtonText}>Kat toevoegen</Text>
          </Pressable>
        }
        contentContainerStyle={styles.list}
      />

      {/* observaties toevoegen: de duidelijke hoofdknop, vast onderaan */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.addObservationButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("AddObservation")}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          <Text style={styles.addObservationButtonText}>Observatie toevoegen</Text>
        </Pressable>
      </View>

      {/* Home, Tijdlijn en Overzicht (het dierenartsoverzicht) */}
      <TabBar active="Home" navigation={navigation} />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  emptyText: {
    color: Colors.textLight,
    marginTop: 8,
    marginBottom: 12,
  },
  addCatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 20,
    paddingVertical: 16,
  },
  addCatButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
    fontSize: 15,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  addObservationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  addObservationButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
