// alleen vastleggen wat er is gegeven, geen schema's of herinneringen

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

function MedicationObservationScreen({ route, navigation }) {
  // alleen gevuld bij Bewerken
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
  const [medicationName, setMedicationName] = useState(observationToEdit?.medicationName ?? "");

  const [dosage, setDosage] = useState(observationToEdit?.dosage ?? "");
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  async function saveHandler() {
    if (!selectedCat || medicationName.trim() === "") {
      Alert.alert("Nog niet alles ingevuld", "Kies een kat en vul de naam van de medicatie in.");
      return;
    }

    // niet twee keer opslaan als je twee keer tikt
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
            medicationName: medicationName.trim(),
            dosage: dosage.trim(),
            observedAt: observedAt.toISOString(),
            note: note,
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
        type: "Medicatie",
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        observedAt: observedAt.toISOString(),
        note: note,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Medicatie van ${selectedCat.name} is opgeslagen.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
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

        <FormLabel text="Naam medicatie" tag="required" />
        <TextInput
          style={styles.input}
          placeholder="Naam van de medicatie"
          value={medicationName}
          onChangeText={setMedicationName}
        />

        <Text style={styles.sectionTitle}>Optionele details</Text>
        <Text style={styles.sectionHint}>Vul alleen in wat je weet — de rest mag je overslaan.</Text>

        <FormLabel text="Dosering" tag="optional" />
        <TextInput
          style={styles.input}
          placeholder="Bijv. 1 tablet of 0,5 ml"
          value={dosage}
          onChangeText={setDosage}
        />

        <FormLabel text="Notitie" tag="optional" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Schrijf een korte notitie"
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

export default MedicationObservationScreen;

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
    minHeight: 80,
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
