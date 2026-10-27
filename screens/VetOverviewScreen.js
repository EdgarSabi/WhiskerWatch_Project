// VetOverviewScreen toont voor ÉÉN kat en één periode een overzicht van de
// observaties die je zelf hebt ingevoerd, bedoeld om aan de dierenarts te laten
// zien. Het scherm geeft alleen weer wat is ingevoerd: geen diagnose, advies
// of waarschuwingen.

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "../constants/colors";
import Fonts from "../constants/fonts";
import TabBar from "../components/TabBar";
import { loadObservations } from "../storage/observationStorage";
import { loadCats } from "../storage/catStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import {
  PERIOD_OPTIONS,
  getWhen,
  getSummary,
  isInPeriod,
  getSortValue,
} from "../helpers/observationHelpers";

// Voor de dierenarts bieden we maar drie periodes aan, in deze volgorde.
const VET_PERIODS = ["7days", "30days", "all"].map((id) =>
  PERIOD_OPTIONS.find((option) => option.id === id)
);

function VetOverviewScreen({ navigation }) {
  const [observations, setObservations] = useState([]);
  const [cats, setCats] = useState([]);

  const [selectedCatId, setSelectedCatId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

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

  const selectedCat = cats.find((cat) => cat.id === selectedCatId);
  const periodLabel = PERIOD_OPTIONS.find((option) => option.id === selectedPeriod).label;

  // Alleen de observaties van de gekozen kat in de gekozen periode, van oud naar
  // nieuw (chronologisch). .filter() en [...] maken kopieën, dus de opgeslagen
  // lijst verandert niet.
  const overviewObservations = observations
    .filter((observation) => observation.catId === selectedCatId)
    .filter((observation) => isInPeriod(observation, selectedPeriod));
  const chronological = [...overviewObservations].sort((a, b) => getSortValue(a) - getSortValue(b));

  // Hoeveel observaties per type? Voor elk type tellen we de observaties met dat type.
  const typeCounts = OBSERVATION_TYPES.map((type) => ({
    label: type.label,
    count: overviewObservations.filter((observation) => observation.type === type.label).length,
  }));

  const total = overviewObservations.length;

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kat</Text>
        <View style={styles.chipRow}>
          {cats.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCatId(cat.id)}
              style={[styles.chip, selectedCatId === cat.id && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selectedCatId === cat.id && styles.chipTextSelected]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Periode</Text>
        <View style={styles.chipRow}>
          {VET_PERIODS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedPeriod(option.id)}
              style={[styles.chip, selectedPeriod === option.id && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selectedPeriod === option.id && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {!selectedCat && (
          <Text style={styles.hint}>
            {cats.length === 0
              ? "Er zijn nog geen katten."
              : "Kies een kat om het overzicht te zien."}
          </Text>
        )}

        {selectedCat && (
          <View>
            <View style={styles.summaryCard}>
              <Text style={styles.catName}>{selectedCat.name}</Text>
              <Text style={styles.summaryLine}>Periode: {periodLabel}</Text>
              <Text style={styles.summaryLine}>
                Totaal: {total} {total === 1 ? "observatie" : "observaties"}
              </Text>

              <View style={styles.countList}>
                {typeCounts.map((item) => (
                  <View key={item.label} style={styles.countRow}>
                    <Text style={[styles.countLabel, item.count === 0 && styles.countZero]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.countNumber, item.count === 0 && styles.countZero]}>
                      {item.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {total === 0 && (
              <Text style={styles.hint}>
                Geen observaties voor {selectedCat.name} in deze periode.
              </Text>
            )}

            {chronological.map((observation) => (
              <View key={observation.id} style={styles.card}>
                <Text style={styles.cardWhen}>{getWhen(observation)}</Text>
                <Text style={styles.cardType}>{observation.type}</Text>
                <Text style={styles.cardDetail}>{getSummary(observation)}</Text>

                {observation.photoUri && (
                  <Image source={{ uri: observation.photoUri }} style={styles.thumbnail} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Home, Tijdlijn en Overzicht (het dierenartsoverzicht) */}
      <TabBar active="VetOverview" navigation={navigation} />
    </View>
  );
}

export default VetOverviewScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  label: {
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
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
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
  hint: {
    color: Colors.textLight,
    fontSize: 16,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  catName: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 17,
    color: Colors.text,
    marginTop: 2,
  },
  countList: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  countLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  countNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  countZero: {
    color: Colors.textLight,
    fontWeight: "normal",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardWhen: {
    fontSize: 15,
    color: Colors.textLight,
  },
  cardType: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 2,
  },
  cardDetail: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 6,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: Colors.border,
  },
});
