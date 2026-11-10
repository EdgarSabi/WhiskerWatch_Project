import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OBSERVATION_PHOTO_OPTIONS, savePhotoChange } from "../helpers/photoHelpers";
import Colors from "../constants/colors";
import FormLabel from "../components/FormLabel";
import CatPicker from "../components/CatPicker";
import PhotoField from "../components/PhotoField";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

// snelkeuze-chips: tikken voegt het toe aan de notitie, nog een keer tikken
// haalt het er weer uit. Gewoon een hulpje bovenop het vrije tekstveld,
// dat blijft gewoon beschikbaar voor alles wat hier niet tussen staat.
const BEHAVIOUR_SUGGESTIONS = [
  "Verstopt zich",
  "Lusteloos",
  "Onrustig",
  "Miauwt veel",
  "Agressief",
  "Krabt veel",
];

function BehaviourObservationScreen({ route, navigation }) {
  const observationToEdit = route.params?.observation ?? null;

  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);
  const headerHeight = useHeaderHeight();

  let preselectedCat = route.params?.cat ?? null;
  if (observationToEdit) {
    preselectedCat = { id: observationToEdit.catId, name: observationToEdit.catName };
  }

  const [cats, setCats] = useState([]);

  useEffect(() => {
    async function loadSavedCats() {
      const savedCats = await loadCats();
      setCats(savedCats);
    }

    loadSavedCats();
  }, []);

  const [selectedCat, setSelectedCat] = useState(preselectedCat);
  const [observedAt, setObservedAt] = useState(getInitialObservedAt(observationToEdit));
  const [note, setNote] = useState(observationToEdit?.note ?? "");
  const [photoUri, setPhotoUri] = useState(observationToEdit?.photoUri ?? null);

  // de notitie als los te herkennen stukjes, zodat we kunnen zien welke
  // snelkeuzes er al in staan (en ze er ook weer uit kunnen halen)
  const noteParts = note
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  function toggleSuggestionHandler(suggestion) {
    const isSelected = noteParts.includes(suggestion);
    const newParts = isSelected
      ? noteParts.filter((part) => part !== suggestion)
      : [...noteParts, suggestion];

    setNote(newParts.join(", "));
  }

  async function saveHandler() {
    // kat en beschrijving verplicht
    if (!selectedCat || note.trim() === "") {
      Alert.alert("Nog niet alles ingevuld", "Kies een kat en vertel kort wat je hebt opgemerkt.");
      return;
    }

    // voorkom twee keer opslaan na twee keer drukken
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    // pas hier gaat de foto naar de vaste map, en een oude foto wordt opgeruimd
    const savedPhotoUri = await savePhotoChange(photoUri, observationToEdit?.photoUri ?? null);

    const currentObservations = await loadObservations();

    if (observationToEdit) {
      const changedObservations = currentObservations.map((observation) => {
        if (observation.id === observationToEdit.id) {
          return {
            ...observation,
            catId: selectedCat.id,
            catName: selectedCat.name,
            observedAt: observedAt.toISOString(),
            note: note.trim(),
            photoUri: savedPhotoUri,
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
        type: "Gedrag",
        observedAt: observedAt.toISOString(),
        note: note.trim(),
        photoUri: savedPhotoUri,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert("Observatie opgeslagen", `Gedrag van ${selectedCat.name} is opgeslagen.`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  }

  return (
    // anders komt het toetsenbord over het tekstveld en Opslaan heen
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CatPicker cats={cats} selectedCat={selectedCat} onSelect={setSelectedCat} />

        <DateTimeFields value={observedAt} onValueChange={setObservedAt} isNew={!observationToEdit} />

        <FormLabel text="Snelkeuze" tag="optional" />
        <View style={styles.pillRow}>
          {BEHAVIOUR_SUGGESTIONS.map((suggestion) => {
            const isSelected = noteParts.includes(suggestion);

            return (
              <Pressable
                key={suggestion}
                onPress={() => toggleSuggestionHandler(suggestion)}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {suggestion}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FormLabel text="Wat heb je opgemerkt?" tag="required" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Bijv. verstopt zich meer dan normaal"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={styles.sectionTitle}>Optionele details</Text>
        <Text style={styles.sectionHint}>Vul alleen in wat je weet — de rest mag je overslaan.</Text>

        <PhotoField
          photoUri={photoUri}
          onChange={setPhotoUri}
          photoOptions={OBSERVATION_PHOTO_OPTIONS}
        />
      </ScrollView>

      {/* padding hier en niet op de KeyboardAvoidingView, die overschrijft zijn eigen paddingBottom */}
      <View style={{ paddingBottom: insets.bottom + 8 }}>
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

export default BehaviourObservationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 14,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
  },
  noteInput: {
    minHeight: 120,
    textAlignVertical: "top",
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
