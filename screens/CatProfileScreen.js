// CatProfileScreen toont de gegevens van ÉÉN kat.
//
// React Navigation geeft elk scherm twee props automatisch mee:
// - navigation: om naar een ander scherm te gaan (navigation.navigate, navigation.goBack)
// - route: bevat route.params, de data die is meegegeven bij het navigeren
//   hiernaartoe (in dit geval: { cat: ... }, zie HomeScreen.js)
//
// Fase 3: nog geen echte observatielijst of database, alleen de basisgegevens
// van de kat die je vanuit HomeScreen hebt meegekregen.

import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function CatProfileScreen({ route, navigation }) {
  // De kat die is meegegeven via navigation.navigate("CatProfile", { cat: item })
  const { cat } = route.params;

  return (
    <View style={styles.screen}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{cat.initial}</Text>
      </View>

      <Text style={styles.name}>{cat.name}</Text>
      <Text style={styles.observation}>{cat.lastObservation}</Text>

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
