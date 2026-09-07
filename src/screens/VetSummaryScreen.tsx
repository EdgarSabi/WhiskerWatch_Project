import { cardStyles, colors } from "../theme";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Page, styles } from "../components/ui";
import { VetSummaryCard, ObservationCard, EmptyState } from "../components";
import { CatSelector, PeriodSelector } from "../components/form-controls";
import { useData } from "../storage/DataProvider";
import { generateVetSummary } from "../utils/observations";
import { ScreenProps } from "../types/navigation";
export default function VetSummaryScreen({ route }: ScreenProps<"VetSummary">) {
  const { observations, cats } = useData();
  const [catId, setCat] = useState(route.params?.catId ?? ""),
    [period, setPeriod] = useState<"7" | "30">("30");
  const summary = generateVetSummary(observations, catId, period);
  const cat = cats.find((c) => c.id === catId);
  const catLabel =
    cat?.name ?? (catId === "unknown" ? "Kat onbekend" : "Alle katten");
  return (
    <Page>
      <View
        style={[
          cardStyles.neutral,
          { borderTopWidth: 3, borderTopColor: colors.primary },
        ]}
      >
        <Text style={styles.label}>VOOR HET GESPREK MET JE DIERENARTS</Text>
        <Text style={[styles.title, { fontSize: 25 }]}>
          Dierenartsoverzicht
        </Text>
        <Text style={styles.muted}>
          Feitelijk overzicht van wat je hebt vastgelegd.
        </Text>
      </View>
      <CatSelector cats={cats} mode="filter" value={catId} onChange={setCat} />
      <PeriodSelector
        options={["7", "30"]}
        value={period}
        onChange={setPeriod}
      />
      <Text style={styles.heading}>
        {catLabel} · Laatste {period} dagen
      </Text>
      <Text style={styles.muted} accessibilityLiveRegion="polite">
        {summary.total} observatie{summary.total === 1 ? "" : "s"} · nieuwste
        eerst
      </Text>
      {cat && (
        <Text style={styles.text}>
          {cat.name}
          {cat.medicalNotes ? " · " + cat.medicalNotes : ""}
          {cat.normalFood ? "\nGebruikelijke voeding: " + cat.normalFood : ""}
        </Text>
      )}
      <VetSummaryCard
        summary={{
          ...summary,
          weightTrend:
            catId && catId !== "unknown" ? summary.weightTrend : undefined,
        }}
      />
      <Text style={styles.heading}>Om te bespreken</Text>
      <Text style={styles.muted}>
        Uitgelicht: bloed, diarree, geen eetlust en meermaals braken binnen 24
        uur bij dezelfde kat in deze periode. Dit is geen medische beoordeling.
        Onzekere toewijzingen blijven zichtbaar.
      </Text>
      {summary.important.map((o) => (
        <ObservationCard neutral key={o.id} observation={o} />
      ))}
      {!summary.important.length && (
        <EmptyState
          neutral
          title="Geen observaties uitgelicht"
          description="Je kunt elke observatie met je dierenarts bespreken."
        />
      )}
      <Text style={styles.heading}>Gewichtsmetingen</Text>
      {summary.weights.map((o) => (
        <ObservationCard neutral key={o.id} observation={o} />
      ))}
      {!summary.weights.length && (
        <Text style={styles.muted}>Geen gewichtsmetingen in deze periode.</Text>
      )}
      <Text style={styles.heading}>Alle observaties en foto’s</Text>
      {summary.items.map((o) => (
        <ObservationCard neutral key={o.id} observation={o} />
      ))}
      {!summary.items.length && (
        <EmptyState
          neutral
          title="Geen observaties in deze periode"
          description={`Niets vastgelegd voor ${catLabel} in de laatste ${period} dagen. Kies een andere kat of periode.`}
        />
      )}
      <Text style={styles.muted}>
        WhiskerWatch stelt geen diagnose en vervangt geen dierenarts. De app
        helpt alleen om observaties overzichtelijk te bewaren.
      </Text>
    </Page>
  );
}
