# WhiskerWatch

Android-app om gezondheidsobservaties van katten bij te houden. React Native met Expo (SDK 57). Alles blijft lokaal op de telefoon: geen backend en geen accounts.

## Het project

- JavaScript/JSX, geen TypeScript. Niets omzetten naar TypeScript.
- Navigatie met React Navigation (native-stack). Alle routes staan in `App.js`. Er is geen Expo Router.
- Schermen in `screens/`, losse onderdelen in `components/`, hulpfuncties in `helpers/`, opslag in `storage/` en vaste waarden in `constants/`.
- Opslag: AsyncStorage (sleutels `cats`, `observations` en `demoDataSeeded`) en foto's in de documentmap van de app, in `whiskerwatch/photos`.

## Commando's

```bash
npx expo start             # dev server, werkt met Expo Go
npx expo lint
npx expo install <pakket>  # niet npm install, anders kloppen de versies niet
npx expo install --check
npx expo-doctor
```

Voor een APK (EAS) staat `eas.json` op de branch `temporary-release`.

## Let op

- Expo verandert vaak. Kijk bij Expo- en React Native-API's eerst in de docs van de juiste versie (https://docs.expo.dev/versions/v57.0.0/) in plaats van uit je hoofd te werken.
- Sommige strings zijn ook data. De namen in `constants/observationTypes.js` worden als `type` bij een observatie opgeslagen, en ook "Kat onbekend" en de waarden van de keuzeknoppen (bijv. "Diarree", "Ja"). Niet zomaar hernoemen.
- Observaties hebben een `observedAt` (ISO-tekst). Oudere hebben nog losse `date` en `time`. Lees eerst `helpers/observationHelpers.js` voordat je iets aan datums verandert.
- Foto's worden pas bij opslaan naar de vaste map gekopieerd. Verwijder alleen bestanden uit die map (zie `helpers/photoHelpers.js`).
- `android/` en `ios/` worden gegenereerd en staan in `.gitignore`. Niet met de hand aanpassen; `app.json` en de plugins zijn de bron.
- `storage/demoData.js` (Lara met nepobservaties) is alleen voor de presentatie.

Draai `npx expo lint` voordat je iets af noemt.
