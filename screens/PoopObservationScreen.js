// PoopObservationScreen is het formulier om een ontlasting-observatie vast
// te leggen. Dit is de EERSTE volledig werkende observatieflow — de andere
// types (Braken, Gedrag, ...) krijgen later hun eigen scherm, op dezelfde
// manier opgebouwd.
//
// Fase 4: nog geen database. Opslaan zet het observatie-object voorlopig
// alleen in useState (in memory), en laat daarna een Alert zien.

import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import Colors from "../constants/colors";

const CAT_OPTIONS = ["Mia", "Elsa", "Hoop", "Lara", "Billy", "Kat onbekend"];
const CONSISTENCY_OPTIONS = ["Normaal", "Zacht", "Diarree", "Hard", "Onbekend"];

function PoopObservationScreen({ route, navigation }) {
  // Als je vanuit CatProfileScreen komt, staat er al een kat klaar.
  const preselectedCat = route.params?.cat?.name ?? null;

  // We gebruiken hier bewust VEEL losse useState-hooks in plaats van één
  // groot object. Dat is voor een formulier als dit makkelijker te lezen:
  // elk veld heeft zijn eigen simpele setter (setDate, setConsistency, ...),
  // in plaats van dat je steeds een groot object moet spreaden om één
  // eigenschap aan te passen.
  const [selectedCat, setSelectedCat] = useState(preselectedCat);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [consistency, setConsistency] = useState(null);

  // Optionele velden
  const [color, setColor] = useState("");
  const [mucusSeen, setMucusSeen] = useState(null); // "Nee" | "Ja" | null
  const [bloodSeen, setBloodSeen] = useState(null);
  const [outsideLitterBox, setOutsideLitterBox] = useState(null);
  const [note, setNote] = useState("");

  // Alle observaties die je tijdens deze sessie hebt opgeslagen. Dit leeft
  // alleen in het geheugen van dit scherm — er is nog geen database en nog
  // geen plek waar HomeScreen of TimelineScreen dit kunnen uitlezen. Dat
  // komt pas als we lokale opslag toevoegen.
  const [savedObservations, setSavedObservations] = useState([]);

  function saveHandler() {
    // Kat en consistentie zijn verplicht, de rest is optioneel.
    if (!selectedCat || !consistency) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en een consistentie.");
      return;
    }

    // Dit is het observatie-object: een simpel, plat object met alle
    // ingevulde waarden. Geen aparte "modellen" of classes, gewoon een
    // object letterlijk opgebouwd uit de useState-waarden hierboven.
    const newObservation = {
      id: Math.random().toString(),
      catName: selectedCat,
      type: "Ontlasting",
      consistency: consistency,
      date: date,
      time: time,
      color: color,
      mucusSeen: mucusSeen,
      bloodSeen: bloodSeen,
      outsideLitterBox: outsideLitterBox,
      note: note,
    };

    setSavedObservations((current) => [...current, newObservation]);

    Alert.alert(
      "Observatie opgeslagen",
      `Ontlasting voor ${selectedCat}: ${consistency}.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={styles.screen}>
      {/* ScrollView zorgt dat je het hele formulier kunt scrollen als het
          niet allemaal op het scherm past (bijv. bij een klein toestel of
          als het toetsenbord open staat). */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kat</Text>
        <View style={styles.pillRow}>
          {CAT_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setSelectedCat(option)}
              // Dit is het "selected state"-patroon: we vergelijken de
              // waarde van deze knop met de huidige state (selectedCat).
              // Zijn ze gelijk, dan tellen we een extra stijl erbij op.
              style={[styles.pill, selectedCat === option && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selectedCat === option && styles.pillTextSelected]}>
                {option}
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
