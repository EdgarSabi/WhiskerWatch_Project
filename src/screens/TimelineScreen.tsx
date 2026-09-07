import React, { useState } from "react";
import { Text } from "react-native";
import { Page, styles } from "../components/ui";
import {
  CatSelector,
  PeriodSelector,
  ButtonChoices,
} from "../components/form-controls";
import { ObservationCard, EmptyState } from "../components";
import { useData } from "../storage/DataProvider";
import { ObservationType, Period } from "../types";
import { filterObservations, typeLabels } from "../utils/observations";
export default function TimelineScreen() {
  const { observations, cats } = useData();
  const [catId, setCat] = useState(""),
    [type, setType] = useState<ObservationType>(),
    [period, setPeriod] = useState<Period>("all");
  const items = filterObservations(observations, { catId, type, period });
  return (
    <Page>
      <Text style={styles.title}>Tijdlijn</Text>
      <Text style={styles.muted}>
        Wat je opviel, overzichtelijk bij elkaar.
      </Text>
      <CatSelector cats={cats} mode="filter" value={catId} onChange={setCat} />
      <PeriodSelector
        options={["all", "7", "30"]}
        value={period}
        onChange={setPeriod}
      />
      <ButtonChoices
        label="Soort observatie"
        value={type ?? ""}
        onChange={(v) => setType(v || undefined)}
        options={[
          { value: "", label: "Alles" },
          ...(Object.keys(typeLabels) as ObservationType[]).map((t) => ({
            value: t,
            label: typeLabels[t],
          })),
        ]}
      />
      <Text style={styles.muted}>
        {items.length} observaties · nieuwste eerst
      </Text>
      {items.map((o) => (
        <ObservationCard key={o.id} observation={o} />
      ))}
      {!items.length && (
        <EmptyState
          title="Nog geen observaties"
          description="Kies een ander filter of voeg iets toe wanneer het je opvalt."
        />
      )}
    </Page>
  );
}
