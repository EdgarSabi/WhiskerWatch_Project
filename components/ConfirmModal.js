// ConfirmModal is een eenvoudige bevestigingsvraag in de stijl van de app, voor
// belangrijke acties zoals verwijderen. Het scherm dat hem gebruikt bepaalt
// zelf met een true/false-state of hij zichtbaar is (visible).

import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../constants/colors";
import Fonts from "../constants/fonts";

function ConfirmModal({ visible, title, message, confirmText, onConfirm, onCancel }) {
  return (
    // transparent: de rest van het scherm blijft zichtbaar achter de donkere laag.
    // onRequestClose: de Android-terugknop sluit de vraag (= annuleren).
    // De translucent-opties laten de donkere laag ook onder de statusbalk en
    // navigatiebalk doorlopen. De kaart staat in het midden, dus nooit eronder.
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Annuleren</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.confirmButton, pressed && styles.buttonPressed]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ConfirmModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(43, 33, 28, 0.5)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
