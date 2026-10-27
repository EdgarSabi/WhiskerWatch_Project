import { useState, useEffect } from "react";
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
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  OBSERVATION_PHOTO_OPTIONS,
  pickPhotoFromGallery,
  takePhoto,
  savePhotoChange,
} from "../helpers/photoHelpers";
import Colors from "../constants/colors";
import FormLabel from "../components/FormLabel";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

const VOMIT_OPTIONS = ["Eenmalig", "Meerdere keren", "Haarbal", "Onbekend"];

function VomitObservationScreen({ route, navigation }) {
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
  const [vomitKind, setVomitKind] = useState(observationToEdit?.vomitKind ?? null);

  // Optionele velden
  const [note, setNote] = useState(observationToEdit?.note ?? "");
  const [photoUri, setPhotoUri] = useState(observationToEdit?.photoUri ?? null);

  // Een foto maken of uit de galerij kiezen, met bijsnijden erachter. Het adres
  // is nog tijdelijk: bij het opslaan bewaren we de foto duurzaam.
  async function takePhotoHandler() {
    const newPhotoUri = await takePhoto(OBSERVATION_PHOTO_OPTIONS);
    if (newPhotoUri) {
      setPhotoUri(newPhotoUri);
    }
  }

  async function pickPhotoHandler() {
    const newPhotoUri = await pickPhotoFromGallery(OBSERVATION_PHOTO_OPTIONS);
    if (newPhotoUri) {
      setPhotoUri(newPhotoUri);
    }
  }

  async function saveHandler() {
    if (!selectedCat || !vomitKind) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en wat voor braken het was.");
      return;
    }

    // Twee keer tikken op Opslaan mag niet twee keer opslaan.
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    // Is de foto vervangen of verwijderd, dan ruimt dit ook het oude bestand op.
    const savedPhotoUri = await savePhotoChange(photoUri, observationToEdit?.photoUri ?? null);

    const currentObservations = await loadObservations();

    if (observationToEdit) {
      const changedObservations = currentObservations.map((observation) => {
        if (observation.id === observationToEdit.id) {
          return {
            ...observation,
            catId: selectedCat.id,
            catName: selectedCat.name,
            vomitKind: vomitKind,
            observedAt: observedAt.toISOString(),
            note: note,
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
        type: "Braken",
        vomitKind: vomitKind,
        observedAt: observedAt.toISOString(),
        note: note,
        photoUri: savedPhotoUri,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert("Observatie opgeslagen", `Braken voor ${selectedCat.name}: ${vomitKind}.`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
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

        <FormLabel text="Wat voor braken?" tag="required" />
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

        <Text style={styles.sectionTitle}>Optionele details</Text>

        <FormLabel text="Notitie" tag="optional" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Extra opmerking (optioneel)"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <FormLabel text="Foto" tag="optional" />
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoPreview} /> : null}
        <View style={styles.pillRow}>
          <Pressable style={styles.pill} onPress={takePhotoHandler}>
            <MaterialCommunityIcons name="camera-outline" size={16} color={Colors.text} />
            <Text style={styles.pillText}>Foto maken</Text>
          </Pressable>
          <Pressable style={styles.pill} onPress={pickPhotoHandler}>
            <MaterialCommunityIcons name="image-outline" size={16} color={Colors.text} />
            <Text style={styles.pillText}>Uit galerij kiezen</Text>
          </Pressable>
          {photoUri ? (
            <Pressable style={styles.pill} onPress={() => setPhotoUri(null)}>
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.text} />
              <Text style={styles.pillText}>Foto verwijderen</Text>
            </Pressable>
          ) : null}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
