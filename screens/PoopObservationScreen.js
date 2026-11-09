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
import CatPicker from "../components/CatPicker";
import YesNoSwitch from "../components/YesNoSwitch";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

const CONSISTENCY_OPTIONS = ["Normaal", "Zacht", "Diarree", "Hard", "Onbekend"];

function PoopObservationScreen({ route, navigation }) {
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
  const [consistency, setConsistency] = useState(observationToEdit?.consistency ?? null);

  const [color, setColor] = useState(observationToEdit?.color ?? "");
  // schuifjes staan standaard uit ("Nee"), dan hoef je voor het gewone geval niets aan te raken
  const [mucusSeen, setMucusSeen] = useState(observationToEdit?.mucusSeen ?? "Nee");
  const [bloodSeen, setBloodSeen] = useState(observationToEdit?.bloodSeen ?? "Nee");
  const [outsideLitterBox, setOutsideLitterBox] = useState(observationToEdit?.outsideLitterBox ?? "Nee");
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  const [photoUri, setPhotoUri] = useState(observationToEdit?.photoUri ?? null);

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
    if (!selectedCat || !consistency) {
      Alert.alert("Nog niet alles ingevuld", "Kies een kat en een consistentie.");
      return;
    }

    // niet twee keer opslaan als je twee keer tikt
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
            consistency: consistency,
            observedAt: observedAt.toISOString(),
            color: color,
            mucusSeen: mucusSeen,
            bloodSeen: bloodSeen,
            outsideLitterBox: outsideLitterBox,
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
        type: "Ontlasting",
        consistency: consistency,
        observedAt: observedAt.toISOString(),
        color: color,
        mucusSeen: mucusSeen,
        bloodSeen: bloodSeen,
        outsideLitterBox: outsideLitterBox,
        note: note,
        photoUri: savedPhotoUri,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Ontlasting van ${selectedCat.name} is opgeslagen.`,
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

        <FormLabel text="Consistentie" tag="required" />
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

        <Text style={styles.sectionTitle}>Optionele details</Text>
        <Text style={styles.sectionHint}>Vul alleen in wat je weet — de rest mag je overslaan.</Text>

        <FormLabel text="Kleur" tag="optional" />
        <TextInput
          style={styles.input}
          placeholder="Bijv. bruin"
          value={color}
          onChangeText={setColor}
        />

        <View style={styles.switchGroup}>
          <YesNoSwitch label="Slijm gezien" value={mucusSeen} onValueChange={setMucusSeen} />
          <YesNoSwitch label="Bloed gezien" value={bloodSeen} onValueChange={setBloodSeen} />
          <YesNoSwitch
            label="Buiten kattenbak"
            value={outsideLitterBox}
            onValueChange={setOutsideLitterBox}
          />
        </View>

        <FormLabel text="Notitie" tag="optional" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Schrijf een korte notitie"
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
            <Text style={styles.pillText}>Kies een foto</Text>
          </Pressable>
          {photoUri ? (
            <Pressable style={styles.pill} onPress={() => setPhotoUri(null)}>
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.text} />
              <Text style={styles.pillText}>Foto verwijderen</Text>
            </Pressable>
          ) : null}
        </View>
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
  switchGroup: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
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
