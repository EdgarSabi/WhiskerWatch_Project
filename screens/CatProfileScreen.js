// CatProfileScreen toont de gegevens van ÉÉN kat.
//
// React Navigation geeft elk scherm twee props automatisch mee:
// - navigation: om naar een ander scherm te gaan (navigation.navigate, navigation.goBack)
// - route: bevat route.params, de data die is meegegeven bij het navigeren
//   hiernaartoe (in dit geval: { cat: ... }, zie HomeScreen.js)
//
// Het profiel toont de ingevulde gegevens van de kat (leeg = niet getoond), hoeveel
// opgeslagen observaties DEZE kat heeft (we tellen alleen die met hetzelfde
// catId), en knoppen om te bewerken of te verwijderen.

import { useState, useCallback } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import ConfirmModal from "../components/ConfirmModal";
import { getPhotoSource } from "../helpers/photoHelpers";
import { loadObservations } from "../storage/observationStorage";
import { loadCats, saveCats } from "../storage/catStorage";
import { getLastObservationText } from "../helpers/observationHelpers";

function CatProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // De kat die is meegegeven via navigation.navigate("CatProfile", { cat: item }).
  // We bewaren hem in state, zodat we hem opnieuw kunnen laden na het bewerken.
  const [cat, setCat] = useState(route.params.cat);
  const [observationCount, setObservationCount] = useState(0);
  const [lastObservationText, setLastObservationText] = useState("");

  // Staat de bevestigingsvraag voor het verwijderen open?
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Draait elke keer dat dit scherm in beeld komt, dus alles klopt ook nadat je
  // de kat hebt bewerkt of een observatie hebt toegevoegd en weer terug bent.
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const savedCats = await loadCats();
        const savedCat = savedCats.find((item) => item.id === route.params.cat.id);
        if (savedCat) {
          setCat(savedCat);
        }

        const savedObservations = await loadObservations();
        const catObservations = savedObservations.filter(
          (observation) => observation.catId === route.params.cat.id
        );
        setObservationCount(catObservations.length);
        setLastObservationText(getLastObservationText(catObservations));
      }

      loadProfile();
    }, [route.params.cat.id])
  );

  // "Kat verwijderen" opent eerst de bevestigingsvraag (ConfirmModal onderaan).
  // Pas bij "Verwijderen" verdwijnt de kat uit de lijst met katten. Zijn
  // observaties blijven bewaard (met de naam van toen) in de tijdlijn.
  async function confirmDeleteHandler() {
    setIsDeleteModalOpen(false);

    const savedCats = await loadCats();
    const remainingCats = savedCats.filter((item) => item.id !== cat.id);
    await saveCats(remainingCats);

    // Terug naar het dashboard (het eerste scherm van de stapel).
    navigation.popToTop();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.avatar}>
        {cat.photoUri ? (
          <Image source={getPhotoSource(cat.photoUri)} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{cat.initial}</Text>
        )}
      </View>

      <Text style={styles.name}>{cat.name}</Text>
      <Text style={styles.observation}>{lastObservationText}</Text>
      <Text style={styles.count}>Opgeslagen observaties: {observationCount}</Text>

      {/* Alleen de velden die zijn ingevuld worden getoond. Boolean(...) maakt er
          echt true of false van; een lege tekst ("") mag in React Native niet
          buiten een <Text> staan. */}
      {Boolean(cat.birthInfo || cat.weightKg || cat.medicalNote) && (
        <View style={styles.infoCard}>
          {cat.birthInfo ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Geboortedatum of leeftijd</Text>
              <Text style={styles.infoValue}>{cat.birthInfo}</Text>
            </View>
          ) : null}

          {cat.weightKg ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gewicht</Text>
              <Text style={styles.infoValue}>{String(cat.weightKg).replace(".", ",")} kg</Text>
            </View>
          ) : null}

          {cat.medicalNote ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Medische notitie</Text>
              <Text style={styles.infoValue}>{cat.medicalNote}</Text>
            </View>
          ) : null}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("AddObservation", { cat: cat })}
      >
        <Text style={styles.primaryButtonText}>+ Observatie toevoegen</Text>
      </Pressable>

      {/* De tijdlijn opent al gefilterd op deze kat (via het catId). */}
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("Timeline", { catId: cat.id })}
      >
        <Text style={styles.secondaryButtonText}>Tijdlijn bekijken</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("CatForm", { cat: cat })}
      >
        <Text style={styles.secondaryButtonText}>Profiel bewerken</Text>
      </Pressable>

      {/* navigation.goBack() haalt dit scherm van de stapel af en toont
          weer het scherm dat eronder lag (hier: Home). */}
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Terug</Text>
      </Pressable>

      {/* Bewust klein en rustig: geen grote rode knop. */}
      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
        onPress={() => setIsDeleteModalOpen(true)}
      >
        <Text style={styles.deleteButtonText}>Kat verwijderen</Text>
      </Pressable>

      <ConfirmModal
        visible={isDeleteModalOpen}
        title="Kat verwijderen?"
        message={`Weet je zeker dat je ${cat.name} wilt verwijderen? De observaties van ${cat.name} blijven bewaard in de tijdlijn.`}
        confirmText="Verwijderen"
        onConfirm={confirmDeleteHandler}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </ScrollView>
  );
}

export default CatProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.avatarGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  observation: {
    color: Colors.textLight,
    marginTop: 8,
  },
  count: {
    color: Colors.text,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignSelf: "stretch",
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  deleteButtonText: {
    color: Colors.textLight,
    textDecorationLine: "underline",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
