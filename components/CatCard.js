import { View, Text, StyleSheet } from "react-native";

export default function CatCard({ name, lastObservation, initial }) {
  return (
    <View style={styles.catCard}>
      <View style={styles.catAvatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>

      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.observation}>{lastObservation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
  },

  catAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E6EFE4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  initial: {
    fontSize: 20,
    fontWeight: "bold",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  observation: {
    color: "#777",
    marginTop: 4,
  },
});