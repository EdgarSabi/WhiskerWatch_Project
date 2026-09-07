# WhiskerWatch

De appinterface is volledig Nederlandstalig, met Nederlandse datums en ondersteuning voor gewichten zoals `4,25`. Bestaande eigen notities en opgeslagen gegevens blijven behouden. Het visuele thema staat in `src/theme`; Nederlandse weergavelabels staan in `src/utils/locale.ts`.

Starten: `npm install`, gevolgd door `npm start`. Gebruik `npm run android` voor een Android-emulator of `npm run web` voor een browserpreview. De mobiele weergave is in de browser gecontroleerd; test fotoselectie ook op een echt Android-apparaat.

A calm, Android-first cat observation app built with React Native, Expo SDK 57, TypeScript and React Navigation. All records stay on the device using AsyncStorage. No backend, accounts, reminders or diagnosis features.

## Install and run

Use Node.js 22.13+ (a current LTS is recommended) and npm.

```sh
npm install
npm start
```

Open the QR code in an Expo Go version compatible with SDK 57. For a running Android emulator with Android Studio configured:

```sh
npm run android
```

Optional browser preview:

```sh
npm run web
```

To build a native Android development app locally (requires Android SDK and Java):

```sh
npx expo run:android
```

## Checks

```sh
npm run typecheck
npm test
npx expo install --check
npx expo export --platform android
```

## Included

- Home with five first-launch sample cats: Mia, Elsa, Hoop, Lara and Billy. Mia has a digestive-issues profile note; no fabricated observations are seeded.
- Add and edit cat profiles, including optional birthday, profile weight, food, medical notes and photo.
- All eight observation types, conditional fields, photos, notes, cat confidence and unknown-cat attribution.
- Per-cat and household timelines with cat/type/rolling 7-day or 30-day filters.
- Vet summaries with counts, weight entries, photo thumbnails and relevant observation highlights.
- Local storage helpers for create, read, update, delete and filtering. Writes are serialized to prevent lost simultaneous updates; failures do not overwrite existing records.

## Structure

`App.tsx` wires navigation and the data provider. `src/screens` contains the six screens, `src/components` contains reusable cards and form controls, `src/types` defines data/navigation contracts, `src/storage` manages persistence, and `src/utils` contains filtering and summary logic. `tests` covers summary and filtering behavior.

## MVP behavior and limits

- Observation time is the save time. Medication also records a manually entered local given date/time. Weight uses kg.
- A summary includes uncertain assignments, visibly labeled. Unknown-cat records are separate. Repeated vomiting means multiple entries attributed to the same cat within 24 hours inside the selected period; this is an organizational rule, not a medical assessment.
- Weight change is first-to-latest recorded weight and is shown only for an individual cat, never combined across cats. Profile weight is separate from the observation history.
- Android photos are copied into the app document directory. Browser previews retain the picker URI and are not a substitute for native device validation.
- Data has no sync or backup/export. Clearing app data or uninstalling can remove records and photos. AsyncStorage is not encrypted. Do not treat this MVP as your only copy of important information.
- Deletion/update helpers are implemented; observation editing and deletion controls, photo file cleanup and PDF export are outside this starter UI. Deleting a cat through the helper preserves observations and the name snapshot, moving them to unknown attribution.
- The vet summary is intended to be shown on-screen. There are no medical recommendations.

Photo selection follows the [Expo ImagePicker documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/).

Before release, test on a physical Android device: select/cancel a photo, restart to check persistence, test keyboard and system back navigation, add every observation type, and compare a vet summary with the timeline.
