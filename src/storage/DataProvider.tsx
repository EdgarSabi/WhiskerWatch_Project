import React, { createContext, useContext, useEffect, useState } from "react";
import { Cat, Observation } from "../types";
import * as storage from "./index";
type Data = {
  cats: Cat[];
  observations: Observation[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveCat: (cat: Cat) => Promise<void>;
  saveObservation: (o: Observation) => Promise<void>;
};
const Context = createContext<Data>(null!);
export const useData = () => useContext(Context);
export function DataProvider({ children }: React.PropsWithChildren) {
  const [cats, setCats] = useState<Cat[]>([]),
    [observations, setObservations] = useState<Observation[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function refresh() {
    try {
      const [c, o] = await Promise.all([
        storage.getCats(),
        storage.getObservations(),
      ]);
      setCats(c);
      setObservations(o);
      setError("");
    } catch {
      setError("Je gegevens konden niet worden geladen. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  return (
    <Context.Provider
      value={{
        cats,
        observations,
        loading,
        error,
        refresh,
        saveCat: async (cat) => {
          await storage.saveCat(cat);
          await refresh();
        },
        saveObservation: async (o) => {
          await storage.saveObservation(o);
          await refresh();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
