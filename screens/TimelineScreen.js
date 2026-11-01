import { useState, useCallback } from "react";
import { View, Text, SectionList, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import ConfirmModal from "../components/ConfirmModal";
import TabBar from "../components/TabBar";
import TypeBadge from "../components/TypeBadge";
import { deletePhotoFile } from "../helpers/photoHelpers";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import {
  PERIOD_OPTIONS,
  getTimeText,
  getSummary,
  isInPeriod,
  getSortValue,
  groupByDay,
} from "../helpers/observationHelpers";

const ALL_TYPES = "Alle types";

function TimelineScreen({ route, navigation }) {
  const [observations, setObservations] = useState([]);
  const [cats, setCats] = useState([]);

  // "all" / "Alle types" = filter staat uit. Vanuit een kattenprofiel staat de kat al ingesteld
  const [selectedCat, setSelectedCat] = useState(route.params?.catId ?? "all");
  const [selectedType, setSelectedType] = useState(ALL_TYPES);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    // uit de volledige lijst verwijderen, niet uit de gefilterde
    const remainingObservations = observations.filter((item) => item.id !== observation.id);
    setObservations(remainingObservations);
    await saveObservations(remainingObservations);

    deletePhotoFile(observation.photoUri);
  }

  function clearFilters() {
    setSelectedCat("all");
    setSelectedType(ALL_TYPES);
    setSelectedPeriod("all");
  }

  const filteredObservations = observations.filter((observation) => {
    const catMatches = selectedCat === "all" || observation.catId === selectedCat;
    const typeMatches = selectedType === ALL_TYPES || observation.type === selectedType;
    const periodMatches = isInPeriod(observation, selectedPeriod);

    return catMatches && typeMatches && periodMatches;
  });

  // sorteren op wanneer het gebeurde, niet op wanneer het is opgeslagen
  // eerst omdraaien zodat bij hetzelfde moment de laatst opgeslagen bovenaan komt
  const newestFirst = [...filteredObservations]
    .reverse()
    .sort((a, b) => getSortValue(b) - getSortValue(a));

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

  // verwijderde katten zijn weg uit de kattenlijst maar hun observaties blijven,
  // dus maken we er een filterkeuze van (op catId) zodat je ze kunt terugvinden
  const deletedCatOptions = [];
  for (const observation of observations) {
    const isActiveCat =
      observation.catId === UNKNOWN_CAT.id || cats.some((cat) => cat.id === observation.catId);
    const isListed = deletedCatOptions.some((option) => option.id === observation.catId);

    if (!isActiveCat && !isListed) {
      deletedCatOptions.push({ id: observation.catId, name: `${observation.catName} (verwijderd)` });
    }
  }

  const catOptions = [{ id: "all", name: "Alle katten" }, ...cats, UNKNOWN_CAT, ...deletedCatOptions];
  const typeOptions = [ALL_TYPES, ...OBSERVATION_TYPES.map((type) => type.label)];

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

  const filterHeader = (
    <View style={styles.filterArea}>
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setIsFilterOpen(!isFilterOpen)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={18}
            color={activeFilterCount > 0 ? "#FFFFFF" : Colors.text}
          />
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
      <SectionList
        sections={groupByDay(newestFirst)}
        keyExtractor={(observation) => observation.id}
        stickySectionHeadersEnabled={false}
        // kopjes tellen mee, anders blijft de lijst even half leeg
        initialNumToRender={20}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        ListHeaderComponent={filterHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {observations.length === 0
              ? "Nog geen observaties."
              : "Geen observaties gevonden."}
          </Text>
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const summary = getSummary(item);

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => editHandler(item)}
            >
              {/* met foto staat die op de plek van het icoon */}
              <TypeBadge type={item.type} photoUri={item.photoUri} />

              <View style={styles.cardTexts}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardType}>{item.type}</Text>
                  <Text style={styles.cardTime}>{getTimeText(item)}</Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardSummary} numberOfLines={2}>
                    {item.catName}
                    {summary ? ` · ${summary}` : ""}
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      hitSlop={10}
                      accessibilityLabel="Bewerken"
                      style={({ pressed }) => pressed && styles.buttonPressed}
                      onPress={() => editHandler(item)}
                    >
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={19}
                        color={Colors.textLight}
                      />
                    </Pressable>

                    <Pressable
                      hitSlop={10}
                      accessibilityLabel="Verwijderen"
                      style={({ pressed }) => pressed && styles.buttonPressed}
                      onPress={() => setObservationToDelete(item)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={19}
                        color={Colors.textLight}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <TabBar active="Timeline" navigation={navigation} />

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
  },
  // padding hier en niet op het hele scherm, anders loopt de tabbalk niet over de volle breedte
  list: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardTexts: {
    flex: 1,
    marginLeft: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardType: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  cardTime: {
    color: Colors.textLight,
    fontSize: 13,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 2,
  },
  cardSummary: {
    flex: 1,
    color: Colors.textLight,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
