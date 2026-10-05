import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";

function getWhen(observation) {
  if (observation.date !== "" || observation.time !== "") {
    return `${observation.date} ${observation.time}`.trim();
  }
  return observation.createdAt;
}

// Zet de notitie (als die er is) achter de samenvatting.
function addNote(summary, observation) {
  if (observation.note) {
    return `${summary} · ${observation.note}`;
  }
  return summary;
}


function getSummary(observation) {
  if (observation.type === "Ontlasting") {
    let summary = observation.consistency;

    if (observation.bloodSeen === "Ja") {
      summary += " · bloed";
    }
    if (observation.mucusSeen === "Ja") {
      summary += " · slijm";
    }
    if (observation.outsideLitterBox === "Ja") {
      summary += " · buiten kattenbak";
    }

    return addNote(summary, observation);
  }

  if (observation.type === "Braken") {
    return addNote(observation.vomitKind, observation);
  }

  if (observation.type === "Eten & drinken") {
    return addNote(observation.intake, observation);
  }

  if (observation.type === "Medicatie") {
    let summary = observation.medicationName;

    if (observation.dosage) {
      summary += ` · ${observation.dosage}`;
    }

    return addNote(summary, observation);
  }

  if (observation.type === "Gewicht") {
    return `${String(observation.weightKg).replace(".", ",")} kg`;
  }

  return observation.note;
}

function TimelineScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [observations, setObservations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function loadSavedObservations() {
        const savedObservations = await loadObservations();
        setObservations(savedObservations);
      }

      loadSavedObservations();
    }, [])
  );

  function editHandler(observation) {
    const observationType = OBSERVATION_TYPES.find((type) => type.label === observation.type);
    navigation.navigate(observationType.screen, { observation: observation });
  }

  function deleteHandler(observation) {
    Alert.alert("Verwijderen", "Weet je zeker dat je deze observatie wilt verwijderen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Verwijderen",
        style: "destructive",
        onPress: async () => {
          const remainingObservations = observations.filter((item) => item.id !== observation.id);
          setObservations(remainingObservations);
          await saveObservations(remainingObservations);
        },
      },
    ]);
  }


  const newestFirst = [...observations].reverse();

  return (
    <View style={styles.screen}>
      {observations.length === 0 && <Text style={styles.emptyText}>Nog geen observaties.</Text>}

      <FlatList
        data={newestFirst}
        keyExtractor={(observation) => observation.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardType}>
              {item.catName} · {item.type}
            </Text>
            <Text style={styles.cardWhen}>{getWhen(item)}</Text>
            <Text style={styles.cardDetail}>{getSummary(item)}</Text>

            {/* Alleen als er een foto is, tonen we een kleine thumbnail. Oude
                observaties hebben geen photoUri, dus daar valt dit weg. */}
            {item.photoUri && <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />}

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
                onPress={() => editHandler(item)}
              >
                <Text style={styles.editButtonText}>Bewerken</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                onPress={() => deleteHandler(item)}
              >
                <Text style={styles.deleteButtonText}>Verwijderen</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default TimelineScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: Colors.textLight,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  cardWhen: {
    color: Colors.textLight,
    marginTop: 2,
  },
  cardDetail: {
    color: Colors.text,
    marginTop: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.border,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
