// alles rond foto's: kiezen, maken, bijsnijden, bewaren en opruimen
//
// photoUri is meestal het adres van een foto in onze eigen fotomap. Lara (demo) heeft
// een foto die in de app zelf zit, daarom bewaren we daar een vaste naam voor
// ("default:lara") en zoekt getPhotoSource het bestand erbij

import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from "expo-file-system";

export const LARA_PHOTO = "default:lara";

const DEFAULT_PHOTOS = {
  [LARA_PHOTO]: require("../assets/lara.jpeg"),
};

export function getPhotoSource(photoUri) {
  if (DEFAULT_PHOTOS[photoUri]) {
    return DEFAULT_PHOTOS[photoUri];
  }

  return { uri: photoUri };
}

// bijsnijden na kiezen of maken: een kat vierkant en rond (past in het profielplaatje),
// een observatie 4 bij 3
export const CAT_PHOTO_OPTIONS = { allowsEditing: true, aspect: [1, 1], shape: "oval" };
export const OBSERVATION_PHOTO_OPTIONS = { allowsEditing: true, aspect: [4, 3] };

// geeft het adres van de bijgesneden foto, of null als je annuleert
// dat adres is nog tijdelijk, pas bij opslaan gaat de foto naar de vaste map (savePhotoChange)
export async function pickPhotoFromGallery(options) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    ...options,
  });

  return result.canceled ? null : result.assets[0].uri;
}

// toestemming alleen vragen als we die nog niet hebben
export async function takePhoto(options) {
  let permission = await ImagePicker.getCameraPermissionsAsync();
  if (!permission.granted) {
    permission = await ImagePicker.requestCameraPermissionsAsync();
  }

  if (!permission.granted) {
    Alert.alert(
      "Geen toegang tot de camera",
      "Geef WhiskerWatch toegang tot de camera in de instellingen van je telefoon."
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      ...options,
    });

    return result.canceled ? null : result.assets[0].uri;
  } catch {
    Alert.alert("Camera niet beschikbaar", "De camera kon niet worden geopend. Probeer het nog een keer.");
    return null;
  }
}

// eigen foto's staan in de documentmap (die ruimt Android niet op, de cache wel)
const PHOTOS_FOLDER_NAME = "/whiskerwatch/photos/";

// lukt kopiëren niet? Dan het oude adres teruggeven, werkt zolang de cache de foto bewaart
async function copyToPhotosFolder(sourceUri) {
  try {
    const folder = new Directory(Paths.document, "whiskerwatch", "photos");
    folder.create({ intermediates: true, idempotent: true });

    const source = new File(sourceUri);
    const extension = source.extension || ".jpg";
    const uniqueName = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
    const destination = new File(folder, uniqueName);

    await source.copy(destination);
    return destination.uri;
  } catch (error) {
    console.warn("Foto kon niet duurzaam worden opgeslagen", error);
    return sourceUri;
  }
}

// alleen onze eigen fotobestanden verwijderen, nooit de standaardfoto
// mislukt het verwijderen? Dan alleen loggen, de app mag niet crashen
export function deletePhotoFile(photoUri) {
  if (!photoUri || !photoUri.includes(PHOTOS_FOLDER_NAME)) {
    return;
  }

  try {
    const file = new File(photoUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn("Foto kon niet worden opgeruimd", error);
  }
}

// newUri = wat nu in het formulier staat, oldUri = wat eerder was opgeslagen
// geeft het adres voor in de kat of observatie. Pas bij opslaan kopiëren, anders
// blijven er losse bestanden achter als je het formulier annuleert
export async function savePhotoChange(newUri, oldUri) {
  if (newUri === oldUri) {
    return newUri;
  }

  const savedUri = newUri ? await copyToPhotosFolder(newUri) : null;
  deletePhotoFile(oldUri);
  return savedUri;
}
