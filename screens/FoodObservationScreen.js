// FoodObservationScreen is het formulier voor een eten & drinken-observatie.
// Zelfde opbouw als PoopObservationScreen: kat kiezen, datum en tijd, een keuze,
// optionele notitie en opslaan (nieuw of bewerken).

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
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

const INTAKE_OPTIONS = ["Normaal", "Minder", "Meer", "Niet gegeten", "Niet gedronken"];

function FoodObservationScreen({ route, navigation }) {
  // Alleen gevuld als je vanuit de tijdlijn op "Bewerken" tikt.
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
  const [intake, setIntake] = useState(observationToEdit?.intake ?? null);

  // Optioneel veld
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  async function saveHandler() {
    // Kat en keuze zijn verplicht, de rest is optioneel.
    if (!selectedCat || !intake) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en hoe het eten en drinken ging.");
      return;
    }

    // Twee keer tikken op Opslaan mag niet twee keer opslaan.
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
            intake: intake,
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
        type: "Eten & drinken",
        intake: intake,
        observedAt: observedAt.toISOString(),
        note: note,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Eten & drinken voor ${selectedCat.name}: ${intake}.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    // KeyboardAvoidingView schuift de inhoud omhoog als het toetsenbord opent, zodat
    // het tekstveld en de Opslaan-knop zichtbaar blijven (zoals in CatFormScreen).
    <KeyboardAvoidingView
      style={[styles.screen, { paddingBottom: insets.bottom }]}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormLabel text="Kat" tag="required" />
        <View style={styles.pillRow}>
          {[...cats, UNKNOWN_CAT].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedCat(option)}
              style={[
                styles.pill,
                option.id === UNKNOWN_CAT.id && styles.pillDashed,
                selectedCat?.id === option.id && styles.pillSelected,
              ]}
            >
              <Text
                style={[styles.pillText, selectedCat?.id === option.id && styles.pillTextSelected]}
              >
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <DateTimeFields value={observedAt} onValueChange={setObservedAt} isNew={!observationToEdit} />

        <FormLabel text="Eten en drinken" tag="required" />
        <View style={styles.pillRow}>
          {INTAKE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setIntake(option)}
              style={[styles.pill, intake === option && styles.pillSelected]}
            >
              <Text style={[styles.pillText, intake === option && styles.pillTextSelected]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Optionele details</Text>

        <FormLabel text="Notitie" tag="optional" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Extra opmerking (optioneel)"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        onPress={saveHandler}
      >
        <Text style={styles.saveButtonText}>Opslaan</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

export default FoodObservationScreen;

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
  pillDashed: {
    borderStyle: "dashed",
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
