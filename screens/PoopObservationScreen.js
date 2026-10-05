import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";

const CONSISTENCY_OPTIONS = ["Normaal", "Zacht", "Diarree", "Hard", "Onbekend"];

function PoopObservationScreen({ route, navigation }) {
  // Alleen gevuld als je vanuit de tijdlijn op "Bewerken" tikt. Bij een
  // nieuwe observatie is dit null.
  const observationToEdit = route.params?.observation ?? null;

  const insets = useSafeAreaInsets();

  let preselectedCat = route.params?.cat ?? null;
  if (observationToEdit) {
    preselectedCat = { id: observationToEdit.catId, name: observationToEdit.catName };
  }

  // De katten voor de keuzeknoppen komen uit de opslag. Aan het begin is de
  // lijst leeg; zodra het laden klaar is, vult useEffect hem.
  const [cats, setCats] = useState([]);

  useEffect(() => {
    async function loadSavedCats() {
      const savedCats = await loadCats();
      setCats(savedCats);
    }

    loadSavedCats();
  }, []);

  const [selectedCat, setSelectedCat] = useState(preselectedCat);
  // "?? ''" betekent: als er niets is om te bewerken, begin dan met leeg.
  const [date, setDate] = useState(observationToEdit?.date ?? "");
  const [time, setTime] = useState(observationToEdit?.time ?? "");
  const [consistency, setConsistency] = useState(observationToEdit?.consistency ?? null);

  // Optionele velden
  const [color, setColor] = useState(observationToEdit?.color ?? "");
  const [mucusSeen, setMucusSeen] = useState(observationToEdit?.mucusSeen ?? null); // "Nee" | "Ja" | null
  const [bloodSeen, setBloodSeen] = useState(observationToEdit?.bloodSeen ?? null);
  const [outsideLitterBox, setOutsideLitterBox] = useState(observationToEdit?.outsideLitterBox ?? null);
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  const [photoUri, setPhotoUri] = useState(observationToEdit?.photoUri ?? null);

  async function pickPhotoHandler() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function saveHandler() {
    if (!selectedCat || !consistency) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en een consistentie.");
      return;
    }

    const currentObservations = await loadObservations();

    if (observationToEdit) {

      const changedObservations = currentObservations.map((observation) => {
        if (observation.id === observationToEdit.id) {
          return {
            ...observation,
            catId: selectedCat.id,
            catName: selectedCat.name,
            consistency: consistency,
            date: date,
            time: time,
            color: color,
            mucusSeen: mucusSeen,
            bloodSeen: bloodSeen,
            outsideLitterBox: outsideLitterBox,
            note: note,
            photoUri: photoUri,
          };
        }
        return observation;
      });

      await saveObservations(changedObservations);
    } else {

      const newObservation = {
        id: Math.random().toString(),
        catId: selectedCat.id,
        catName: selectedCat.name,
        type: "Ontlasting",
        consistency: consistency,
        date: date,
        time: time,
        color: color,
        mucusSeen: mucusSeen,
        bloodSeen: bloodSeen,
        outsideLitterBox: outsideLitterBox,
        note: note,
        photoUri: photoUri,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Ontlasting voor ${selectedCat.name}: ${consistency}.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {/* ScrollView zorgt dat je het hele formulier kunt scrollen als het
          niet allemaal op het scherm past (bijv. bij een klein toestel of
          als het toetsenbord open staat). */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kat</Text>
        <View style={styles.pillRow}>
          {/* Alle opgeslagen katten, plus "Kat onbekend" als laatste keuze. */}
          {[...cats, UNKNOWN_CAT].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedCat(option)}
              // Dit is het "selected state"-patroon: we vergelijken het id van
              // deze knop met het id van de gekozen kat (selectedCat).
              // Zijn ze gelijk, dan tellen we een extra stijl erbij op.
              style={[styles.pill, selectedCat?.id === option.id && styles.pillSelected]}
            >
              <Text
                style={[styles.pillText, selectedCat?.id === option.id && styles.pillTextSelected]}
              >
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Datum</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. 29-09-2026"
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Tijd</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. 14:32"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <Text style={styles.label}>Consistentie</Text>
        <View style={styles.pillRow}>
          {CONSISTENCY_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setConsistency(option)}
              style={[styles.pill, consistency === option && styles.pillSelected]}
            >
              <Text style={[styles.pillText, consistency === option && styles.pillTextSelected]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Optioneel</Text>

        <Text style={styles.label}>Kleur</Text>
        <TextInput
          style={styles.input}
          placeholder="bijv. bruin"
          value={color}
          onChangeText={setColor}
        />

        <View style={styles.yesNoRow}>
          <Text style={styles.label}>Slijm gezien</Text>
          <View style={styles.pillRow}>
            {["Nee", "Ja"].map((option) => (
              <Pressable
                key={option}
                onPress={() => setMucusSeen(option)}
                style={[styles.pill, mucusSeen === option && styles.pillSelected]}
              >
                <Text style={[styles.pillText, mucusSeen === option && styles.pillTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.yesNoRow}>
          <Text style={styles.label}>Bloed gezien</Text>
          <View style={styles.pillRow}>
            {["Nee", "Ja"].map((option) => (
              <Pressable
                key={option}
                onPress={() => setBloodSeen(option)}
                style={[styles.pill, bloodSeen === option && styles.pillSelected]}
              >
                <Text style={[styles.pillText, bloodSeen === option && styles.pillTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.yesNoRow}>
          <Text style={styles.label}>Buiten kattenbak</Text>
          <View style={styles.pillRow}>
            {["Nee", "Ja"].map((option) => (
              <Pressable
                key={option}
                onPress={() => setOutsideLitterBox(option)}
                style={[styles.pill, outsideLitterBox === option && styles.pillSelected]}
              >
                <Text
                  style={[styles.pillText, outsideLitterBox === option && styles.pillTextSelected]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Notitie</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Extra opmerking (optioneel)"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={styles.label}>Foto</Text>
        {/* Is er een foto? Dan tonen we een preview met knoppen om te
            vervangen of te verwijderen. Zo niet, dan alleen de keuzeknop. */}
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
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
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        onPress={saveHandler}
      >
        <Text style={styles.saveButtonText}>Opslaan</Text>
      </Pressable>
    </View>
  );
}

export default PoopObservationScreen;

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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
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
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#FFFFFF",
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
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: Colors.border,
  },
  yesNoRow: {
    marginBottom: 4,
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
