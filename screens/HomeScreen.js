import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CatCard from "../components/CatCard";
import AddCatModal from "../components/AddCatModal";
import Colors from "../constants/colors";
import { loadCats, saveCats } from "../storage/catStorage";

function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cats, setCats] = useState([]);

  // useEffect met [] draait één keer, zodra het scherm voor het eerst verschijnt.
  // Hier laden we de opgeslagen katten (of de placeholder katjes als er nog niets is).
  useEffect(() => {
    async function loadSavedCats() {
      const savedCats = await loadCats();
      setCats(savedCats);
    }

    loadSavedCats();
  }, []);

  const [isAddCatModalVisible, setIsAddCatModalVisible] = useState(false);

  function openAddCatModal() {
    setIsAddCatModalVisible(true);
  }

  function closeAddCatModal() {
    setIsAddCatModalVisible(false);
  }


  async function addCatHandler(name) {
    // Date.now() is het aantal milliseconden sinds 1970: elke nieuwe kat krijgt
    // daarmee een eigen, unieke id.
    const newCat = {
      id: Date.now().toString(),
      name: name,
      initial: name.charAt(0).toUpperCase(),
      lastObservation: "Nog geen observaties",
    };

    const updatedCats = [...cats, newCat];
    setCats(updatedCats);
    closeAddCatModal();
    await saveCats(updatedCats);
  }

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
            lastObservation={item.lastObservation}
            index={index}
            onPress={() => catPressHandler(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {/* katjes toevoegen */}
      <Pressable
        style={({ pressed }) => [styles.addCatButton, pressed && styles.buttonPressed]}
        onPress={openAddCatModal}
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

      {/* tijdlijn */}
      <Pressable
        style={({ pressed }) => [styles.timelineLink, pressed && styles.timelineLinkPressed]}
        onPress={() => navigation.navigate("Timeline")}
      >
        <Text style={styles.timelineLinkText}>Tijdlijn bekijken</Text>
      </Pressable>

      <AddCatModal
        visible={isAddCatModalVisible}
        onClose={closeAddCatModal}
        onAddCat={addCatHandler}
      />
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
  timelineLink: {
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
