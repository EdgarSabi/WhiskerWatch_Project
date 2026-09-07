import { CatAvatar } from "../components/CatAvatar";
import { formatDate, formatNumber } from "../utils/locale";
import React from "react";
import { Text, View } from "react-native";
import { Page, styles, Button } from "../components/ui";
import { ObservationCard, EmptyState } from "../components";
import { useData } from "../storage/DataProvider";
import { ScreenProps } from "../types/navigation";
export default function CatDetailScreen({
  navigation,
  route,
}: ScreenProps<"CatDetail">) {
  const { cats, observations } = useData();
  const cat = cats.find((c) => c.id === route.params.catId);
  if (!cat)
    return (
      <Page>
        <Text style={styles.text}>Deze kat is niet meer beschikbaar.</Text>
      </Page>
    );
  const items = observations.filter((o) => o.catId === cat.id);
  return (
    <Page>
      <CatAvatar name={cat.name} photoUri={cat.photoUri} size={100} />
      <Text style={styles.title}>{cat.name}</Text>
      <View style={styles.card}>
        {cat.birthDate && (
          <Text style={styles.text}>
            Geboren op {formatDate(cat.birthDate)}
          </Text>
        )}
        {cat.weight && (
          <Text style={styles.text}>
            Profielgewicht · {formatNumber(cat.weight)} kg
          </Text>
        )}
        {cat.normalFood && (
          <Text style={styles.text}>
            Gebruikelijke voeding · {cat.normalFood}
          </Text>
        )}
        <Text style={styles.text}>
          {cat.medicalNotes || "Nog geen medische notities."}
        </Text>
      </View>
      <Button
        title="+ Observatie toevoegen"
        onPress={() => navigation.navigate("AddObservation", { catId: cat.id })}
      />
      <Button
        secondary
        title="Kat bewerken"
        onPress={() => navigation.navigate("AddCat", { catId: cat.id })}
      />
      <Button
        secondary
        title="Dierenartsoverzicht"
        onPress={() => navigation.navigate("VetSummary", { catId: cat.id })}
      />
      <Text style={styles.heading}>Tijdlijn</Text>
      {items.map((o) => (
        <ObservationCard key={o.id} observation={o} />
      ))}
      {!items.length && (
        <EmptyState
          title="Hier begint het verhaal"
          description="Leg iets vast wanneer het je opvalt. Je hoeft niets dagelijks bij te houden."
        />
      )}
    </Page>
  );
}
