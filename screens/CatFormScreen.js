// naam van katten is verplicht. rest niet 

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
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import FormLabel from "../components/FormLabel";
import {
  CAT_PHOTO_OPTIONS,
  getPhotoSource,
  pickPhotoFromGallery,
  takePhoto,
  savePhotoChange,
} from "../helpers/photoHelpers";
import { birthDateToText, parseBirthDate, formatBirthDate } from "../helpers/catHelpers";
import { loadCats, saveCats } from "../storage/catStorage";
import { loadObservations, saveObservations } from "../storage/observationStorage";

function CatFormScreen({ route, navigation }) {
  // alleen gevuld bij Profiel bewerken
  const catToEdit = route.params?.cat ?? null;

  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  // KeyboardAvoidingView heeft dit nodig, anders schuift het formulier te ver omhoog
  const headerHeight = useHeaderHeight();

  const [name, setName] = useState(catToEdit?.name ?? "");
  const [photoUri, setPhotoUri] = useState(catToEdit?.photoUri ?? null);
  const [birthDate, setBirthDate] = useState(catToEdit?.birthDate ?? null);
  const [weightText, setWeightText] = useState(
    catToEdit?.weightKg ? String(catToEdit.weightKg).replace(".", ",") : ""
  );
  const [medicalNote, setMedicalNote] = useState(catToEdit?.medicalNote ?? "");

  //foto kan worden gemaakt of gekozen 
  async function takePhotoHandler() {
    const newPhotoUri = await takePhoto(CAT_PHOTO_OPTIONS);
    if (newPhotoUri) {
      setPhotoUri(newPhotoUri);
    }
  }

  async function pickPhotoHandler() {
    const newPhotoUri = await pickPhotoFromGallery(CAT_PHOTO_OPTIONS);
    if (newPhotoUri) {
      setPhotoUri(newPhotoUri);
    }
  }

  // geboortedatum kan niet in de toekomst 
  function pickBirthDateHandler() {
    DateTimePickerAndroid.open({
      value: parseBirthDate(birthDate) ?? new Date(),
      mode: "date",
      maximumDate: new Date(),
      onValueChange: (event, selectedDate) => {
        setBirthDate(birthDateToText(selectedDate));
      },
    });
  }

  async function saveHandler() {
    const trimmedName = name.trim();

    if (trimmedName === "") {
      Alert.alert("Nog niet alles ingevuld", "Vul de naam van de kat in.");
      return;
    }

    let weightKg = null;
    if (weightText.trim() !== "") {
      weightKg = Number(weightText.replace(",", "."));

      if (isNaN(weightKg) || weightKg <= 0) {
        Alert.alert("Vul een geldig gewicht in", "Gebruik cijfers, bijvoorbeeld 4,2.");
        return;
      }
    }

    // niet twee keer opslaan als je twee keer tikt
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    // pas hier gaat de foto naar de vaste map, en een oude foto wordt opgeruimd
    const savedPhotoUri = await savePhotoChange(photoUri, catToEdit?.photoUri ?? null);

    const catData = {
      name: trimmedName,
      initial: trimmedName.charAt(0).toUpperCase(),
      photoUri: savedPhotoUri,
      birthDate: birthDate,
      weightKg: weightKg,
      medicalNote: medicalNote.trim(),
    };

    const savedCats = await loadCats();

    if (catToEdit) {
      const changedCats = savedCats.map((cat) => {
        if (cat.id === catToEdit.id) {
          return { ...cat, ...catData };
        }
        return cat;
      });
      await saveCats(changedCats);

      const savedObservations = await loadObservations();
      const changedObservations = savedObservations.map((observation) => {
        if (observation.catId === catToEdit.id) {
          return { ...observation, catName: trimmedName };
        }
        return observation;
      });
      await saveObservations(changedObservations);
    } else {
      const newCat = { id: Date.now().toString(), ...catData };
      await saveCats([...savedCats, newCat]);
    }

    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoArea}>
          {photoUri ? (
            <Image source={getPhotoSource(photoUri)} style={styles.photoCircle} />
          ) : (
            <View style={[styles.photoCircle, styles.photoEmpty]}>
              <MaterialCommunityIcons name="camera-outline" size={32} color={Colors.textLight} />
            </View>
          )}
          <Text style={styles.photoCaption}>
            Foto toevoegen <Text style={styles.photoCaptionLight}>(optioneel)</Text>
          </Text>

          <View style={styles.photoButtons}>
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
        </View>

        <FormLabel text="Naam" tag="required" />
        <TextInput
          style={styles.input}
          placeholder="Naam van de kat"
          value={name}
          onChangeText={setName}
        />

        <FormLabel text="Geboortedatum" tag="optional" />
        <View style={styles.pillRow}>
          <Pressable style={styles.pill} onPress={pickBirthDateHandler}>
            <Text style={styles.pillText}>
              {birthDate ? formatBirthDate(birthDate) : "Datum kiezen"}
            </Text>
          </Pressable>
          {birthDate ? (
            <Pressable style={styles.pill} onPress={() => setBirthDate(null)}>
              <Text style={styles.pillText}>Wissen</Text>
            </Pressable>
          ) : null}
        </View>

        <FormLabel text="Gewicht" tag="optional" />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputInRow}
            placeholder="Bijv. 4,2"
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
          />
          <Text style={styles.suffix}>kg</Text>
        </View>

        <FormLabel text="Medische notitie" tag="optional" />
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Bijv. allergie of vaste medicatie"
          value={medicalNote}
          onChangeText={setMedicalNote}
          multiline
        />
      </ScrollView>

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
  photoArea: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.border,
  },
  photoEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  photoCaption: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  photoCaptionLight: {
    fontWeight: "normal",
    color: Colors.textLight,
  },
  photoButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
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
  pillText: {
    color: Colors.text,
    fontWeight: "600",
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  inputInRow: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  suffix: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textLight,
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
