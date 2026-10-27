// Een kat heeft een photoUri. Dat is meestal het adres van een foto die je zelf
// hebt gekozen (een tekst zoals "file:///..."). Een standaardkat zoals Lara heeft
// een foto die in de app zelf zit (assets/lara.jpeg). Die kan niet als adres
// worden bewaard, dus bewaren we een vaste naam, en vertaalt getPhotoSource
// die naam naar het bestand in de app.

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
