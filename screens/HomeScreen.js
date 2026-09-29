import { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";

import CatCard from "../components/CatCard";

export default function HomeScreen() {
  const [enteredCatName, setEnteredCatName] = useState("");

  const [cats, setCats] = useState([
    {
      id: "1",
      name: "Elsa",
      lastObservation: "Laatst: Niesen · gisteren",
      initial: "E",
    },
    {
      id: "2",
      name: "Hoop",
      lastObservation: "Nog geen observaties",
      initial: "H",
    },
  ]);

  function catInputHandler(enteredText) {
    setEnteredCatName(enteredText);
  }

  function addCatHandler() {
    setCats((currentCats) => [
      ...currentCats,
      {
        id: Math.random().toString(),
        name: enteredCatName,
        lastObservation: "Nog geen observaties",
        initial: enteredCatName.charAt(0).toUpperCase(),
      },
    ]);

    setEnteredCatName("");
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cats}
        keyExtractor={(item) => item.id}
        renderItem={(itemData) => (
          <CatCard
            name={itemData.item.name}
            lastObservation={itemData.item.lastObservation}
            initial={itemData.item.initial}
          />
        )}
        ListFooterComponent={
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Naam van kat"
              value={enteredCatName}
              onChangeText={catInputHandler}
            />

            <Button title="Kat toevoegen" onPress={addCatHandler} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "#FBF6F1",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D7CEC8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
});