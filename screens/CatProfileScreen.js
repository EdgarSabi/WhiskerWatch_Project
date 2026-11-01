import { useState, useCallback } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import Fonts from "../constants/fonts";
import ConfirmModal from "../components/ConfirmModal";
import TypeBadge from "../components/TypeBadge";
import { getPhotoSource, deletePhotoFile } from "../helpers/photoHelpers";
import { loadObservations } from "../storage/observationStorage";
import { loadCats, saveCats } from "../storage/catStorage";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import {
  getRecentObservations,
  getRelativeText,
  getSummary,
} from "../helpers/observationHelpers";
import { formatBirthDate, getAgeText, getLatestWeight } from "../helpers/catHelpers";

// max drie observaties terugzien in het scherm
const RECENT_COUNT = 3;

function CatProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const [cat, setCat] = useState(route.params.cat);
  const [observationCount, setObservationCount] = useState(0);
  const [recentObservations, setRecentObservations] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // elke keer opnieuw laden, anders klopt het profiel niet na bewerken of een nieuwe observatie
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const savedCats = await loadCats();
        const savedCat =
          savedCats.find((item) => item.id === route.params.cat.id) ?? route.params.cat;
        setCat(savedCat);

        const savedObservations = await loadObservations();
        const catObservations = savedObservations.filter(
          (observation) => observation.catId === route.params.cat.id
        );
        setObservationCount(catObservations.length);
        setRecentObservations(getRecentObservations(catObservations, RECENT_COUNT));
        setLatestWeight(getLatestWeight(savedCat, catObservations));
      }

      loadProfile();
    }, [route.params.cat])
  );

  function openObservationHandler(observation) {
    const observationType = OBSERVATION_TYPES.find((type) => type.label === observation.type);
    navigation.navigate(observationType.screen, { observation: observation });
  }

  async function confirmDeleteHandler() {
    setIsDeleteModalOpen(false);

    const savedCats = await loadCats();
    const remainingCats = savedCats.filter((item) => item.id !== cat.id);
    await saveCats(remainingCats);
    deletePhotoFile(cat.photoUri);

    navigation.popToTop();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.avatar}>
        {cat.photoUri ? (
          <Image source={getPhotoSource(cat.photoUri)} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{cat.initial}</Text>
        )}
      </View>

      <Text style={styles.name}>{cat.name}</Text>

      {/* leeftijd wordt niet opgeslagen maar uit de geboortedatum berekend */}
      <View style={styles.pillRow}>
        {cat.birthDate ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{getAgeText(cat.birthDate)}</Text>
          </View>
        ) : null}

        {latestWeight ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{String(latestWeight).replace(".", ",")} kg</Text>
          </View>
        ) : null}
      </View>

      {cat.birthDate ? (
        <Text style={styles.birthText}>Geboren {formatBirthDate(cat.birthDate)}</Text>
      ) : null}

      {cat.medicalNote ? (
        <View style={styles.noteCard}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={20}
            color={Colors.inkGold}
            style={styles.noteIcon}
          />
          <View style={styles.noteTextContainer}>
            <Text style={styles.noteTitle}>Medische notitie</Text>
            <Text style={styles.noteText}>{cat.medicalNote}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("AddObservation", { cat: cat })}
      >
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Observatie toevoegen</Text>
      </Pressable>

      <View style={styles.secondaryRow}>
        {/* tijdlijn opent al gefilterd op deze kat */}
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("Timeline", { catId: cat.id })}
        >
          <Text style={styles.secondaryButtonText}>Tijdlijn bekijken</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate("CatForm", { cat: cat })}
        >
          <Text style={styles.secondaryButtonText}>Profiel bewerken</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recente observaties</Text>
        <Text style={styles.sectionCount}>Totaal: {observationCount}</Text>
      </View>

      {recentObservations.length === 0 ? (
        <Text style={styles.emptyText}>Nog geen observaties</Text>
      ) : (
        recentObservations.map((observation) => (
          <Pressable
            key={observation.id}
            style={({ pressed }) => [styles.recentCard, pressed && styles.buttonPressed]}
            onPress={() => openObservationHandler(observation)}
          >
            <TypeBadge type={observation.type} photoUri={observation.photoUri} />

            <View style={styles.recentTexts}>
              <View style={styles.recentTop}>
                <Text style={styles.recentType}>{observation.type}</Text>
                <Text style={styles.recentWhen}>{getRelativeText(observation)}</Text>
              </View>
              <Text style={styles.recentSummary} numberOfLines={2}>
                {getSummary(observation)}
              </Text>
            </View>
          </Pressable>
        ))
      )}

      {/* bewust klein, geen grote rode knop */}
      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
        onPress={() => setIsDeleteModalOpen(true)}
      >
        <Text style={styles.deleteButtonText}>Kat verwijderen</Text>
      </Pressable>

      <ConfirmModal
        visible={isDeleteModalOpen}
        title="Kat verwijderen?"
        message={`Weet je zeker dat je ${cat.name} wilt verwijderen? De observaties van ${cat.name} blijven bewaard in de tijdlijn.`}
        confirmText="Verwijderen"
        onConfirm={confirmDeleteHandler}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </ScrollView>
  );
}

export default CatProfileScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.avatarPink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarText: {
    fontFamily: Fonts.heading,
    fontSize: 44,
    color: Colors.primary,
  },
  name: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.text,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.text,
  },
  birthText: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 8,
  },
  noteCard: {
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: Colors.avatarGold,
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.inkGold,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 15,
    color: Colors.text,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "stretch",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginTop: 28,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  emptyText: {
    alignSelf: "flex-start",
    color: Colors.textLight,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  recentTexts: {
    flex: 1,
    marginLeft: 12,
  },
  recentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentType: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
  recentWhen: {
    fontSize: 12,
    color: Colors.textLight,
  },
  recentSummary: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  deleteButton: {
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "stretch",
  },
  deleteButtonText: {
    color: Colors.textLight,
    textDecorationLine: "underline",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
