import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";

// View is een beetje zoals een div in HTML. Het is een container die je kunt gebruiken om andere componenten in te plaatsen.

export default function App() {
  return (
    <View style={styles.container}>
      <View>
        <Text
          style={styles.dummyText}
        >
          Another piece of text
        </Text>
      </View>
      <Text
        style={styles.dummyText}
      >
        Hello World!
      </Text>
      <Button title="Click me!" onPress={() => alert("You clicked me!")} />
    </View>
  );
}

// Je kunt herhaling in styling voorkomen door het in een StyleSheet te zetten. Dat is een object waarin je al je styles kunt zetten. Je kunt dan de styles gebruiken door ze te refereren met styles.nameOfStyle.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  //Volgorde maakt niet uit
  dummyText: {
    margin: 16,
    borderWidth: 2,
    borderColor: "blue",
    padding: 16,
  },
});
