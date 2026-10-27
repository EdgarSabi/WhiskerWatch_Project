// CatFormScreen is het formulier voor een kat. We gebruiken HETZELFDE scherm
// om een kat toe te voegen én om een bestaande kat te bewerken, net zoals de
// observatieformulieren dat doen:
// - komt er geen kat mee via route.params.cat, dan voeg je een nieuwe kat toe
// - komt er wel een kat mee (vanuit CatProfileScreen), dan bewerk je die kat en
//   starten de velden met de huidige waarden
//
// Alleen de naam is verplicht. Foto, geboortedatum, gewicht en medische notitie
// mogen leeg blijven.

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
  // Alleen gevuld als je vanuit het profiel op "Profiel bewerken" tikt.
  const catToEdit = route.params?.cat ?? null;

  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  // Hoe hoog de balk bovenaan is. KeyboardAvoidingView heeft dat nodig om
  // netjes uit te rekenen hoeveel ruimte het toetsenbord inneemt.
  const headerHeight = useHeaderHeight();

  const [name, setName] = useState(catToEdit?.name ?? "");
  const [photoUri, setPhotoUri] = useState(catToEdit?.photoUri ?? null);
  // De geboortedatum als tekst "2022-04-04", of null als die niet is ingevuld.
  const [birthDate, setBirthDate] = useState(catToEdit?.birthDate ?? null);
  // Het gewicht staat in het veld als tekst (bijv. "4,2"). Het opgeslagen getal
  // (4.2) zetten we terug om naar tekst met een komma.
  const [weightText, setWeightText] = useState(
    catToEdit?.weightKg ? String(catToEdit.weightKg).replace(".", ",") : ""
  );
  const [medicalNote, setMedicalNote] = useState(catToEdit?.medicalNote ?? "");

  // Een foto maken of uit de galerij kiezen. Na het kiezen kun je hem eerst
  // bijsnijden: een vierkante, ronde crop past precies in het ronde profielplaatje,
  // dus zet het hoofd van de kat in het midden. Het adres dat we hier krijgen
  // is nog tijdelijk. Bij het opslaan (saveHandler) wordt de foto duurzaam bewaard.
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

  // Dezelfde datumkiezer als bij de observaties. Een geboortedatum kan niet in
  // de toekomst liggen.
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

    // Twee keer tikken op Opslaan mag niet twee keer opslaan.
    if (isSaving) {
      return;
    }
    setIsSaving(true);

    // De foto duurzaam bewaren. Is de foto vervangen of verwijderd, dan wordt het
    // oude bestand hier ook opgeruimd.
    const savedPhotoUri = await savePhotoChange(photoUri, catToEdit?.photoUri ?? null);

    // De gegevens van de kat. Lege optionele velden blijven gewoon leeg.
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
        {/* De foto staat bovenaan, zoals in het ontwerp: een ronde plek met een
            camera erin zolang er nog geen foto is. */}
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
              <Text style={styles.pillText}>Uit galerij kiezen</Text>
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
            placeholder="bijv. 4,2"
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
          />
          <Text style={styles.suffix}>kg</Text>
        </View>

        <FormLabel text="Medische notitie" tag="optional" />
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
  // Het gewichtsveld met "kg" erachter: ziet eruit als een gewoon invoerveld.
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
