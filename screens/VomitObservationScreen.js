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

const VOMIT_OPTIONS = ["Eenmalig", "Meerdere keren", "Haarbal", "Onbekend"];

function VomitObservationScreen({ route, navigation }) {
  const observationToEdit = route.params?.observation ?? null;

  const insets = useSafeAreaInsets();

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
  const [date, setDate] = useState(observationToEdit?.date ?? "");
  const [time, setTime] = useState(observationToEdit?.time ?? "");
  const [vomitKind, setVomitKind] = useState(observationToEdit?.vomitKind ?? null);

  // Optionele velden
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
    if (!selectedCat || !vomitKind) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en wat voor braken het was.");
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
            vomitKind: vomitKind,
            date: date,
            time: time,
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
        type: "Braken",
        vomitKind: vomitKind,
        date: date,
        time: time,
        note: note,
        photoUri: photoUri,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert("Observatie opgeslagen", `Braken voor ${selectedCat.name}: ${vomitKind}.`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kat</Text>
        <View style={styles.pillRow}>
          {[...cats, UNKNOWN_CAT].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedCat(option)}
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

        <Text style={styles.label}>Wat voor braken?</Text>
        <View style={styles.pillRow}>
          {VOMIT_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setVomitKind(option)}
              style={[styles.pill, vomitKind === option && styles.pillSelected]}
            >
              <Text style={[styles.pillText, vomitKind === option && styles.pillTextSelected]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Optioneel</Text>

        <Text style={styles.label}>Notitie</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Extra opmerking (optioneel)"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={styles.label}>Foto</Text>
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

export default VomitObservationScreen;

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
