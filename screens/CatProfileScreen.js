// CatProfileScreen toont de gegevens van ÉÉN kat.
//
// React Navigation geeft elk scherm twee props automatisch mee:
// - navigation: om naar een ander scherm te gaan (navigation.navigate, navigation.goBack)
// - route: bevat route.params, de data die is meegegeven bij het navigeren
//   hiernaartoe (in dit geval: { cat: ... }, zie HomeScreen.js)
//
// Fase 5: het profiel toont ook hoeveel opgeslagen observaties DEZE kat heeft.
// We laden alle observaties en tellen alleen die met hetzelfde catId.

import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import { loadObservations } from "../storage/observationStorage";

function CatProfileScreen({ route, navigation }) {
  // De kat die is meegegeven via navigation.navigate("CatProfile", { cat: item })
  const { cat } = route.params;

  const [observationCount, setObservationCount] = useState(0);

  // Draait elke keer dat dit scherm in beeld komt, dus de teller klopt ook
  // nadat je een observatie hebt toegevoegd en weer terug bent.
  useFocusEffect(
    useCallback(() => {
      async function countObservations() {
        const savedObservations = await loadObservations();
        const catObservations = savedObservations.filter(
          (observation) => observation.catId === cat.id
        );
        setObservationCount(catObservations.length);
      }

      countObservations();
    }, [cat.id])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{cat.initial}</Text>
      </View>

      <Text style={styles.name}>{cat.name}</Text>
      <Text style={styles.observation}>{cat.lastObservation}</Text>
      <Text style={styles.count}>Opgeslagen observaties: {observationCount}</Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("AddObservation", { cat: cat })}
      >
        <Text style={styles.primaryButtonText}>+ Observatie toevoegen</Text>
      </Pressable>

      {/* navigation.goBack() haalt dit scherm van de stapel af en toont
          weer het scherm dat eronder lag (hier: Home). */}
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Terug</Text>
      </Pressable>
    </View>
  );
}

export default CatProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 32,
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
  backButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  backButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
