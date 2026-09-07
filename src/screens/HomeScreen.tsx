import { CatAvatar } from "../components/CatAvatar";
import { PixelIcon } from "../components/PixelArt";
import React from "react";
import { View, Text } from "react-native";
import { Page, styles, colors, Button, SectionCard } from "../components/ui";
import { CatCard, EmptyState, ObservationCard } from "../components";
import { useData } from "../storage/DataProvider";
import { ScreenProps } from "../types/navigation";
export default function HomeScreen({ navigation }: ScreenProps<"Home">) {
  const { cats, observations } = useData();
  return (
    <Page>
      <SectionCard warm>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <CatAvatar name="WhiskerWatch" size={80} />
          <View style={{ gap: 8, alignItems: "flex-end" }}>
            <PixelIcon name="heart" color={colors.accent} />
            <Text style={[styles.muted, { fontSize: 12 }]}>
              Een beetje aandacht.
            </Text>
          </View>
        </View>
        <Text style={styles.title}>Kleine signalen,{"\n"}helder bewaard.</Text>
        <Text style={styles.muted}>
          Log iets wanneer je iets opvalt. Geen dagelijkse check-in nodig.
        </Text>
      </SectionCard>
      <Button
        title="+ Observatie toevoegen"
        onPress={() => navigation.navigate("AddObservation")}
      />
      <View
        style={[styles.row, { justifyContent: "space-between", marginTop: 8 }]}
      >
        <Text style={styles.heading}>Jouw katten</Text>
        <Text style={styles.muted}>{cats.length} katten</Text>
      </View>
      {cats.map((cat) => (
        <CatCard
          key={cat.id}
          cat={cat}
          observations={observations.filter((o) => o.catId === cat.id)}
          onPress={() => navigation.navigate("CatDetail", { catId: cat.id })}
        />
      ))}
      {!cats.length && (
        <EmptyState
          title="Welkom bij WhiskerWatch"
          description="Voeg je eerste kat toe om observaties bij te houden."
        />
      )}
      <Button
        secondary
        title="+ Kat toevoegen"
        onPress={() => navigation.navigate("AddCat")}
      />
      <SectionCard>
        <Text style={styles.heading}>
          Met een gerust overzicht naar de dierenarts
        </Text>
        <Text style={styles.muted}>
          Alle details bij elkaar, zodat je niets hoeft te onthouden.
        </Text>
        <Button
          secondary
          title="Dierenartsoverzicht →"
          onPress={() => navigation.navigate("VetSummary")}
        />
      </SectionCard>
      <Text style={styles.heading}>Recente observaties</Text>
      {observations.length ? (
        observations
          .slice(0, 3)
          .map((o) => <ObservationCard key={o.id} observation={o} />)
      ) : (
        <EmptyState
          title="Nog geen observaties"
          description="Nog niets gelogd. Voeg een observatie toe wanneer je iets wilt onthouden."
        />
      )}
      <Button
        secondary
        title="Bekijk de tijdlijn"
        onPress={() => navigation.navigate("Timeline")}
      />
      <Text style={[styles.muted, { textAlign: "center" }]}>
        Op dit apparaat bewaard · Voor jou en je katten
      </Text>
    </Page>
  );
}
