// Ronde, aanklikbare fotoplek — hetzelfde patroon als bij het kattenprofiel
// (CatFormScreen), nu ook te gebruiken bij observaties. Tikken op de cirkel
// opent meteen de keuze "Kies een foto" of "Foto maken", in plaats van dat
// je eerst het juiste knopje tussen een paar losse knopjes moet vinden.

import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { pickPhotoFromGallery, takePhoto } from "../helpers/photoHelpers";

function PhotoField({ photoUri, onChange, photoOptions }) {
  async function pickPhotoHandler() {
    const newPhotoUri = await pickPhotoFromGallery(photoOptions);
    if (newPhotoUri) {
      onChange(newPhotoUri);
    }
  }

  async function takePhotoHandler() {
    const newPhotoUri = await takePhoto(photoOptions);
    if (newPhotoUri) {
      onChange(newPhotoUri);
    }
  }

  function photoCirclePressHandler() {
    Alert.alert("Foto", "Hoe wil je een foto toevoegen?", [
      { text: "Annuleren", style: "cancel" },
      { text: "Kies een foto", onPress: pickPhotoHandler },
      { text: "Foto maken", onPress: takePhotoHandler },
    ]);
  }

  return (
    <View style={styles.photoArea}>
      <Pressable
        onPress={photoCirclePressHandler}
        accessibilityLabel="Foto toevoegen"
        style={({ pressed }) => pressed && styles.photoCirclePressed}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoCircle} />
        ) : (
          <View style={[styles.photoCircle, styles.photoEmpty]}>
            <MaterialCommunityIcons name="camera-outline" size={32} color={Colors.textLight} />
          </View>
        )}
      </Pressable>

      <Text style={styles.photoCaption}>
        {photoUri ? "Foto wijzigen" : "Foto toevoegen"}{" "}
        <Text style={styles.photoCaptionLight}>(optioneel)</Text>
      </Text>

      {photoUri ? (
        <Pressable style={styles.pill} onPress={() => onChange(null)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.text} />
          <Text style={styles.pillText}>Foto verwijderen</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default PhotoField;

const styles = StyleSheet.create({
  photoArea: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.border,
  },
  photoCirclePressed: {
    opacity: 0.7,
  },
  photoEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  photoCaption: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  photoCaptionLight: {
    fontWeight: "normal",
    color: Colors.textLight,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
});
