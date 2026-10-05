//hier nog later een mooiere modal van maken
import { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";

function AddCatModal({ visible, onClose, onAddCat }) {
  const [enteredName, setEnteredName] = useState("");

  function confirmHandler() {
    if (enteredName.trim().length === 0) {
      return; //kat zonder naam wordt niet toegevoegd
    }
    onAddCat(enteredName.trim());
    setEnteredName("");
  }

  function cancelHandler() {
    setEnteredName("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={cancelHandler}>
      {/* Halfdoorzichtige, donkere achtergrond achter de kaart */}
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Kat toevoegen</Text>

          <TextInput
            style={styles.input}
            placeholder="Naam van de kat"
            value={enteredName}
            onChangeText={setEnteredName}
          />

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={cancelHandler}>
              <Text style={styles.cancelButtonText}>Annuleren</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.confirmButton]} onPress={confirmHandler}>
              <Text style={styles.confirmButtonText}>Toevoegen</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AddCatModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  card: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
