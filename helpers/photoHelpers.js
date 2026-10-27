// Alles rond foto's op één plek: kiezen of maken, bijsnijden, duurzaam bewaren
// en opruimen.
//
// Een kat of observatie heeft een photoUri. Dat is meestal het adres van een
// foto die WhiskerWatch zelf heeft opgeslagen (een tekst zoals
// "file:///.../whiskerwatch/photos/photo-123.jpg"). Een standaardkat zoals Lara
// heeft een foto die in de app zelf zit (assets/lara.jpeg). Die kan niet als
// adres worden bewaard, dus bewaren we een vaste naam, en vertaalt
// getPhotoSource die naam naar het bestand in de app.

import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from "expo-file-system";

export const LARA_PHOTO = "default:lara";

const DEFAULT_PHOTOS = {
  [LARA_PHOTO]: require("../assets/lara.jpeg"),
};

// Geeft de source terug die <Image source={...}> nodig heeft, voor beide soorten.
export function getPhotoSource(photoUri) {
  if (DEFAULT_PHOTOS[photoUri]) {
    return DEFAULT_PHOTOS[photoUri];
  }

  return { uri: photoUri };
}

// ---------- Kiezen of maken ----------

// Na het kiezen of maken van een foto kun je hem bijsnijden (allowsEditing).
// Voor een kat een vierkante, ronde crop, zodat het gezicht precies in het ronde
// profielplaatje past. Voor een observatie een gewone rechthoek van 4 bij 3.
export const CAT_PHOTO_OPTIONS = { allowsEditing: true, aspect: [1, 1], shape: "oval" };
export const OBSERVATION_PHOTO_OPTIONS = { allowsEditing: true, aspect: [4, 3] };

// Open de galerij. Je krijgt het adres van de (bijgesneden) foto terug, of null
// als je annuleert. Dit adres wijst nog naar een tijdelijke plek: de foto wordt
// pas duurzaam bewaard als je het formulier opslaat (zie savePhotoChange).
export async function pickPhotoFromGallery(options) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    ...options,
  });

  return result.canceled ? null : result.assets[0].uri;
}

// Open de camera. De toestemming vragen we alleen als we die nog niet hebben.
export async function takePhoto(options) {
  let permission = await ImagePicker.getCameraPermissionsAsync();
  if (!permission.granted) {
    permission = await ImagePicker.requestCameraPermissionsAsync();
  }

  if (!permission.granted) {
    Alert.alert(
      "Geen toegang tot de camera",
      "Sta de camera toe in de instellingen van je telefoon om een foto te maken."
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
    Alert.alert("Camera niet beschikbaar", "De camera kon niet worden geopend.");
    return null;
  }
}

// ---------- Duurzaam bewaren en opruimen ----------

// De foto's die WhiskerWatch zelf opslaat staan in de documentmap van de app, in
// de submap whiskerwatch/photos. Die map wordt niet door Android leeggemaakt,
// anders dan de cache-map waar de picker zijn foto's neerzet.
const PHOTOS_FOLDER_NAME = "/whiskerwatch/photos/";

// Kopieert een foto naar de vaste map, onder een unieke bestandsnaam, en geeft
// het nieuwe adres terug. Lukt het kopiëren niet, dan geven we het oude adres
// terug: de foto blijft dan werken zolang de cache hem bewaart.
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

// Verwijdert het bestand van een foto, maar ALLEEN als WhiskerWatch het zelf in
// zijn eigen fotomap heeft gezet. De standaardfoto's (assets/lara.jpeg), een lege
// waarde of een adres ergens anders laten we met rust. Faalt het verwijderen,
// dan loggen we dat alleen: de app crasht er niet door.
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

// Wordt aangeroepen als je een formulier opslaat. newUri is wat er nu in het
// formulier staat, oldUri wat er eerder was opgeslagen. Dit geeft het adres
// terug dat in de kat of observatie moet komen:
// - niets veranderd: hetzelfde adres, er gebeurt niets;
// - nieuwe foto: die wordt gekopieerd naar de vaste map, en de oude wordt opgeruimd;
// - foto verwijderd: null, en de oude wordt opgeruimd.
// Doordat we pas bij het opslaan kopiëren, blijven er geen losse bestanden
// achter als je het formulier verlaat zonder op te slaan.
export async function savePhotoChange(newUri, oldUri) {
  if (newUri === oldUri) {
    return newUri;
  }

  const savedUri = newUri ? await copyToPhotosFolder(newUri) : null;
  deletePhotoFile(oldUri);
  return savedUri;
}
