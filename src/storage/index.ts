import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cat, Observation, Filters } from "../types";
import { filterObservations } from "../utils/observations";
const KEY = "@whiskerwatch/v1";
type Database = { cats: Cat[]; observations: Observation[] };
let queue: Promise<unknown> = Promise.resolve();
export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
async function read(): Promise<Database> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const date = new Date().toISOString();
  const data: Database = {
    cats: ["Mia", "Elsa", "Hoop", "Lara", "Billy"].map((name) => ({
      id: newId(),
      name,
      medicalNotes: name === "Mia" ? "Spijsverteringsklachten" : undefined,
      createdAt: date,
      updatedAt: date,
    })),
    observations: [],
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
  return data;
}
function transaction<T>(
  operation: (data: Database) => T,
  write = false,
): Promise<T> {
  const result = queue.then(async () => {
    const data = await read();
    const value = operation(data);
    if (write) await AsyncStorage.setItem(KEY, JSON.stringify(data));
    return value;
  });
  queue = result.catch(() => undefined);
  return result;
}
export const getCats = () => transaction((d) => d.cats);
export const getObservations = () =>
  transaction((d) => filterObservations(d.observations, {}));
export const saveCat = (cat: Cat) =>
  transaction((d) => {
    d.cats = [...d.cats.filter((c) => c.id !== cat.id), cat];
  }, true);
export const updateCat = saveCat;
export const deleteCat = (catId: string) =>
  transaction((d) => {
    d.cats = d.cats.filter((c) => c.id !== catId);
    d.observations = d.observations.map((o) =>
      o.catId === catId ? { ...o, catId: undefined, confidence: "unknown" } : o,
    );
  }, true);
export const saveObservation = (observation: Observation) =>
  transaction((d) => {
    d.observations = [
      ...d.observations.filter((o) => o.id !== observation.id),
      observation,
    ];
  }, true);
export const updateObservation = saveObservation;
export const deleteObservation = (id: string) =>
  transaction((d) => {
    d.observations = d.observations.filter((o) => o.id !== id);
  }, true);
export const getObservationsForCat = (catId: string) =>
  getFilteredObservations({ catId });
export const getFilteredObservations = (filters: Filters) =>
  transaction((d) => filterObservations(d.observations, filters));
