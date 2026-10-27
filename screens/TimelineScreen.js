// Fase 8: de tijdlijn kan nu gefilterd worden op kat, type en periode.
//
// De filters veranderen NIETS aan de opgeslagen observaties. We bewaren de
// volledige lijst in `observations` en maken met .filter() een tweede lijst
// (`filteredObservations`) die alleen laat zien wat bij de filters past.

import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import ConfirmModal from "../components/ConfirmModal";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import {
  PERIOD_OPTIONS,
  getWhen,
  getSummary,
  isInPeriod,
  getSortValue,
} from "../helpers/observationHelpers";

const ALL_TYPES = "Alle types";

function TimelineScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [observations, setObservations] = useState([]);
  const [cats, setCats] = useState([]);

  // De drie filters. "all" (of "Alle types") betekent: dit filter staat uit.
  // Kom je vanuit een kattenprofiel, dan staat het kat-filter al op die kat.
  const [selectedCat, setSelectedCat] = useState(route.params?.catId ?? "all"); // het id van een kat, of "all"
  const [selectedType, setSelectedType] = useState(ALL_TYPES);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Is het paneel met filterknoppen open of dicht?
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // De observatie waarvoor de bevestigingsvraag open staat (null = geen vraag).
  const [observationToDelete, setObservationToDelete] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function loadSavedData() {
        const savedObservations = await loadObservations();
        const savedCats = await loadCats();
        setObservations(savedObservations);
        setCats(savedCats);
      }

      loadSavedData();
    }, [])
  );

  function editHandler(observation) {
    const observationType = OBSERVATION_TYPES.find((type) => type.label === observation.type);
    navigation.navigate(observationType.screen, { observation: observation });
  }

  async function confirmDeleteHandler() {
    const observation = observationToDelete;
    setObservationToDelete(null);

    // We verwijderen uit de VOLLEDIGE lijst, niet uit de gefilterde.
    const remainingObservations = observations.filter((item) => item.id !== observation.id);
    setObservations(remainingObservations);
    await saveObservations(remainingObservations);
  }

  function clearFilters() {
    setSelectedCat("all");
    setSelectedType(ALL_TYPES);
    setSelectedPeriod("all");
  }

  // ---------- Filteren ----------

  // .filter() geeft een NIEUWE lijst terug met alleen de observaties waarvoor
  // alle drie de controles kloppen. De originele lijst blijft zoals hij was.
  const filteredObservations = observations.filter((observation) => {
    const catMatches = selectedCat === "all" || observation.catId === selectedCat;
    const typeMatches = selectedType === ALL_TYPES || observation.type === selectedType;
    const periodMatches = isInPeriod(observation, selectedPeriod);

    return catMatches && typeMatches && periodMatches;
  });

  // Sorteren op het moment waarop het gebeurde (observedAt), niet op het moment
  // van opslaan: de recentste bovenaan. Met [...lijst] maken we een kopie.
  // De kopie draaien we eerst om, zodat bij hetzelfde moment de laatst
  // opgeslagen observatie bovenaan komt (sort() verandert de volgorde van
  // gelijke waarden niet).
  const newestFirst = [...filteredObservations]
    .reverse()
    .sort((a, b) => getSortValue(b) - getSortValue(a));

  // Hoeveel filters staan er aan? Dat tonen we in de knop: "Filters (2)".
  let activeFilterCount = 0;
  if (selectedCat !== "all") {
    activeFilterCount += 1;
  }
  if (selectedType !== ALL_TYPES) {
    activeFilterCount += 1;
  }
  if (selectedPeriod !== "all") {
    activeFilterCount += 1;
  }

  // De keuzes per filter: "alles" eerst, daarna de echte opties.
  const catOptions = [{ id: "all", name: "Alle katten" }, ...cats, UNKNOWN_CAT];
  const typeOptions = [ALL_TYPES, ...OBSERVATION_TYPES.map((type) => type.label)];

  // Korte tekst die laat zien welke filters actief zijn.
  const activeCat = catOptions.find((option) => option.id === selectedCat);
  const activePeriod = PERIOD_OPTIONS.find((option) => option.id === selectedPeriod);
  const activeFilterTexts = [];
  if (selectedCat !== "all") {
    activeFilterTexts.push(activeCat ? activeCat.name : "Onbekende kat");
  }
  if (selectedType !== ALL_TYPES) {
    activeFilterTexts.push(selectedType);
  }
  if (selectedPeriod !== "all") {
    activeFilterTexts.push(activePeriod.label);
  }

  // Bovenaan de lijst: de filterknop en (als die open is) het filterpaneel.
  const filterHeader = (
    <View style={styles.filterArea}>
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Text
            style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}
          >
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
          </Text>
        </Pressable>

        {activeFilterCount > 0 && (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Filters wissen</Text>
          </Pressable>
        )}
      </View>

      {activeFilterCount > 0 && (
        <Text style={styles.activeFiltersText}>
          {activeFilterTexts.join(" · ")} — {filteredObservations.length} van {observations.length}{" "}
          observaties
        </Text>
      )}

      {isFilterOpen && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Kat</Text>
          <View style={styles.chipRow}>
            {catOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedCat(option.id)}
                style={[styles.chip, selectedCat === option.id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selectedCat === option.id && styles.chipTextSelected]}>
                  {option.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.chipRow}>
            {typeOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedType(option)}
                style={[styles.chip, selectedType === option && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selectedType === option && styles.chipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Periode</Text>
          <View style={styles.chipRow}>
            {PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedPeriod(option.id)}
                style={[styles.chip, selectedPeriod === option.id && styles.chipSelected]}
              >
                <Text
                  style={[styles.chipText, selectedPeriod === option.id && styles.chipTextSelected]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.panelButtonRow}>
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Filters wissen</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.doneButtonText}>Klaar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={newestFirst}
        keyExtractor={(observation) => observation.id}
        ListHeaderComponent={filterHeader}
        // Wordt getoond als de lijst leeg is: óf er zijn nog helemaal geen
        // observaties, óf de filters laten niets over.
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {observations.length === 0
              ? "Nog geen observaties."
              : "Geen observaties gevonden voor deze filters."}
          </Text>
        }
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
                onPress={() => setObservationToDelete(item)}
              >
                <Text style={styles.deleteButtonText}>Verwijderen</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <ConfirmModal
        visible={observationToDelete !== null}
        title="Observatie verwijderen?"
        message="Weet je zeker dat je deze observatie wilt verwijderen?"
        confirmText="Verwijderen"
        onConfirm={confirmDeleteHandler}
        onCancel={() => setObservationToDelete(null)}
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
    marginTop: 8,
    marginBottom: 12,
  },
  filterArea: {
    marginBottom: 12,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  activeFiltersText: {
    color: Colors.textLight,
    marginTop: 8,
  },
  filterPanel: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  panelButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
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
