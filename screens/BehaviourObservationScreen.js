//wellicht hier nog wat opties toevoegen voor soorten gedrag dat vreemd is? 
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
import Colors from "../constants/colors";
import FormLabel from "../components/FormLabel";
import CatPicker from "../components/CatPicker";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

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

        <FormLabel text="Wat heb je opgemerkt?" tag="required" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Bijv. verstopt zich meer dan normaal"
          value={note}
          onChangeText={setNote}
          multiline
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
