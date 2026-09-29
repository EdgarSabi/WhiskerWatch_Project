import { View, Text, FlatList, StyleSheet } from "react-native";
import Colors from "../constants/colors";

const PLACEHOLDER_OBSERVATIONS = [
  { id: "1", type: "Eten & drinken", detail: "Mia · Normaal gegeten en gedronken · 14:20" },
  { id: "2", type: "Braken", detail: "Kat onbekend · 11:05" },
  { id: "3", type: "Gedrag", detail: "Hoop · Verstopt zich meer dan gebruikelijk · gisteren" },
];

function TimelineScreen() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={PLACEHOLDER_OBSERVATIONS}
        keyExtractor={(observation) => observation.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardType}>{item.type}</Text>
            <Text style={styles.cardDetail}>{item.detail}</Text>
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
  cardDetail: {
    color: Colors.textLight,
    marginTop: 4,
  },
});
