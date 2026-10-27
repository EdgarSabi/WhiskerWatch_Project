// CatFormScreen is het formulier voor een kat. We gebruiken HETZELFDE scherm
// om een kat toe te voegen én om een bestaande kat te bewerken, net zoals de
// observatieformulieren dat doen:
// - komt er geen kat mee via route.params.cat, dan voeg je een nieuwe kat toe
// - komt er wel een kat mee (vanuit CatProfileScreen), dan bewerk je die kat en
//   starten de velden met de huidige waarden
//
// Alleen de naam is verplicht. Foto, geboortedatum of leeftijd, gewicht en
// medische notitie mogen leeg blijven.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { getPhotoSource } from "../helpers/photoHelpers";
import { loadCats, saveCats } from "../storage/catStorage";
import { loadObservations, saveObservations } from "../storage/observationStorage";

function CatFormScreen({ route, navigation }) {
  // Alleen gevuld als je vanuit het profiel op "Profiel bewerken" tikt.
  const catToEdit = route.params?.cat ?? null;

  const insets = useSafeAreaInsets();

  // Hoe hoog de balk bovenaan is. KeyboardAvoidingView heeft dat nodig om
  // netjes uit te rekenen hoeveel ruimte het toetsenbord inneemt.
  const headerHeight = useHeaderHeight();

  const [name, setName] = useState(catToEdit?.name ?? "");
  const [photoUri, setPhotoUri] = useState(catToEdit?.photoUri ?? null);
  const [birthInfo, setBirthInfo] = useState(catToEdit?.birthInfo ?? "");
  // Het gewicht staat in het veld als tekst (bijv. "4,2"). Het opgeslagen getal
  // (4.2) zetten we terug om naar tekst met een komma.
  const [weightText, setWeightText] = useState(
    catToEdit?.weightKg ? String(catToEdit.weightKg).replace(".", ",") : ""
  );
  const [medicalNote, setMedicalNote] = useState(catToEdit?.medicalNote ?? "");

  // Zelfde aanpak als bij de observatiefoto's: de galerij openen en het adres
  // (de URI) van de gekozen foto bewaren. Met allowsEditing kun je de foto
  // eerst bijsnijden. Een vierkante, ronde crop past precies in het ronde
  // profielplaatje, dus zet het hoofd van de kat in het midden.
  async function pickPhotoHandler() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      shape: "oval",
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function saveHandler() {
    // trim() haalt spaties voor en na de naam weg.
    const trimmedName = name.trim();

    if (trimmedName === "") {
      Alert.alert("Niet compleet", "Vul de naam van de kat in.");
      return;
    }

    // Het gewicht is optioneel. Is het ingevuld, dan moet het een getal groter
    // dan 0 zijn. Een komma (4,2) zetten we eerst om naar een punt (4.2).
    let weightKg = null;
    if (weightText.trim() !== "") {
      weightKg = Number(weightText.replace(",", "."));

      if (isNaN(weightKg) || weightKg <= 0) {
        Alert.alert("Ongeldig gewicht", "Vul het gewicht in kilo's in, bijvoorbeeld 4,2.");
        return;
      }
    }

    // De gegevens van de kat. Lege optionele velden blijven gewoon leeg.
    const catData = {
      name: trimmedName,
      initial: trimmedName.charAt(0).toUpperCase(),
      photoUri: photoUri,
      birthInfo: birthInfo.trim(),
      weightKg: weightKg,
      medicalNote: medicalNote.trim(),
    };

    const savedCats = await loadCats();

    if (catToEdit) {
      // Bewerken: de kat met hetzelfde id krijgt de nieuwe gegevens. Het id
      // verandert niet, dus de koppeling met de observaties (catId) blijft werken.
      const changedCats = savedCats.map((cat) => {
        if (cat.id === catToEdit.id) {
          return { ...cat, ...catData };
        }
        return cat;
      });
      await saveCats(changedCats);

      // In de observaties staat ook de NAAM van de kat (catName), voor weergave
      // in de tijdlijn. Die werken we bij zodat daar niet de oude naam blijft staan.
      const savedObservations = await loadObservations();
      const changedObservations = savedObservations.map((observation) => {
        if (observation.catId === catToEdit.id) {
          return { ...observation, catName: trimmedName };
        }
        return observation;
      });
      await saveObservations(changedObservations);
    } else {
      // Nieuw: Date.now() is het aantal milliseconden sinds 1970, dus elke
      // nieuwe kat krijgt een eigen, unieke id.
      const newCat = { id: Date.now().toString(), ...catData };
      await saveCats([...savedCats, newCat]);
    }

    navigation.goBack();
  }

  return (
    // KeyboardAvoidingView schuift de inhoud omhoog als het toetsenbord opent,
    // zodat het veld waar je in typt en de Opslaan-knop zichtbaar blijven.
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Naam</Text>
        <TextInput
          style={styles.input}
          placeholder="Naam van de kat"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.sectionTitle}>Optioneel</Text>

        <Text style={styles.label}>Foto</Text>
        {photoUri ? (
          <View>
            <Image source={getPhotoSource(photoUri)} style={styles.photoPreview} />
            <View style={styles.pillRow}>
              <Pressable style={styles.pill} onPress={pickPhotoHandler}>
                <Text style={styles.pillText}>Foto vervangen</Text>
              </Pressable>
              <Pressable style={styles.pill} onPress={() => setPhotoUri(null)}>
                <Text style={styles.pillText}>Foto verwijderen</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.pillRow}>
            <Pressable style={styles.pill} onPress={pickPhotoHandler}>
              <Text style={styles.pillText}>Foto kiezen uit galerij</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.label}>Geboortedatum of leeftijd</Text>
        <TextInput
          style={styles.input}
          placeholder="bijv. 12-03-2021 of 3 jaar"
          value={birthInfo}
          onChangeText={setBirthInfo}
        />

        <Text style={styles.label}>Gewicht (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="bijv. 4,2"
          value={weightText}
          onChangeText={setWeightText}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Medische notitie</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="bijv. allergie of vaste medicatie (optioneel)"
          value={medicalNote}
          onChangeText={setMedicalNote}
          multiline
        />
      </ScrollView>

      {/* De Opslaan-knop blijft onderaan staan, boven de Android-navigatiebalk. */}
      <View style={{ paddingBottom: insets.bottom }}>
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
          onPress={saveHandler}
        >
          <Text style={styles.saveButtonText}>Opslaan</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export default CatFormScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  photoPreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
    backgroundColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    margin: 16,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
