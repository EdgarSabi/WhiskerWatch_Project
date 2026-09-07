import { CatAvatar } from "./CatAvatar";
import { PixelIcon } from "./PixelArt";
import { cardStyles, radius } from "../theme";
import { formatDate, formatDateTime, formatNumber } from "../utils/locale";
import React from "react";
import { View, Text, Image, Pressable, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import { Cat, CatConfidence, Observation, ObservationType } from "../types";
import {
  observationSummary,
  typeLabels,
  generateVetSummary,
} from "../utils/observations";
import { Button, Choices, colors, styles } from "./ui";
export { EmptyState } from "./ui";
export function CatCard({
  cat,
  observations,
  onPress,
}: {
  cat: Cat;
  observations: Observation[];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${cat.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.row}>
        <CatAvatar name={cat.name} photoUri={cat.photoUri} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>{cat.name}</Text>
          <Text style={styles.muted}>
            {observations.length} observatie
            {observations.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Text style={styles.heading}>›</Text>
      </View>
      <Text style={styles.muted}>
        {observations[0]
          ? `${typeLabels[observations[0].type]} · ${formatDate(observations[0].createdAt)}`
          : "Nog geen observaties. Je kunt beginnen wanneer je wilt."}
      </Text>
      {observations[0] && (
        <Text numberOfLines={2} style={styles.text}>
          {observationSummary(observations[0])}
        </Text>
      )}
    </Pressable>
  );
}
export function ObservationCard({
  observation: o,
  neutral = false,
}: {
  observation: Observation;
  neutral?: boolean;
}) {
  return (
    <View
      style={[
        neutral ? cardStyles.neutral : styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: o.poop?.blood ? colors.warning : colors.soft,
        },
      ]}
    >
      <View style={styles.row}>
        {!neutral && (
          <View
            style={{
              padding: 10,
              borderRadius: radius.small,
              backgroundColor: colors.soft,
            }}
          >
            <PixelIcon name={o.type} />
          </View>
        )}
        <Text style={[styles.heading, { flexShrink: 1 }]}>
          {typeLabels[o.type]}
        </Text>
        <Text style={styles.muted}>
          {o.catId
            ? `${o.confidence === "probably" ? "Waarschijnlijk " : o.confidence === "unknown" ? "Onzeker · " : ""}${o.catNameSnapshot}`
            : "Kat onbekend"}
        </Text>
      </View>
      <Text style={styles.muted}>{formatDateTime(o.createdAt)}</Text>
      <Text style={styles.text}>{observationSummary(o)}</Text>
      {o.notes && (
        <View
          style={{
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={styles.text}>{o.notes}</Text>
        </View>
      )}
      {o.photoUri && (
        <Image
          accessibilityLabel="Foto bij observatie"
          source={{ uri: o.photoUri }}
          style={{ width: 100, height: 100, borderRadius: 14 }}
        />
      )}
    </View>
  );
}
export function TypeSelector({
  value,
  onChange,
}: {
  value: ObservationType;
  onChange: (v: ObservationType) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Wat viel je op?</Text>
      <View style={styles.row}>
        {(Object.keys(typeLabels) as ObservationType[]).map((t) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: value === t }}
            key={t}
            onPress={() => onChange(t)}
            style={{
              flexGrow: 1,
              flexBasis: "45%",
              minHeight: 96,
              gap: 12,
              borderWidth: 1,
              borderBottomWidth: 3,
              borderColor: value === t ? colors.primary : colors.border,
              padding: 16,
              borderRadius: 16,
              backgroundColor: value === t ? colors.primary : colors.soft,
            }}
          >
            <PixelIcon
              name={t}
              color={value === t ? colors.white : colors.primary}
            />
            <Text
              style={{
                color: value === t ? "white" : colors.ink,
                fontSize: 15,
              }}
            >
              {typeLabels[t]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function ConfidenceSelector({
  value,
  onChange,
}: {
  value: CatConfidence;
  onChange: (v: CatConfidence) => void;
}) {
  return (
    <Choices
      label="Hoe zeker weet je welke kat?"
      options={["certain", "probably", "unknown"]}
      value={value}
      onChange={onChange}
    />
  );
}
export function PhotoPicker({
  uri,
  onChange,
}: {
  uri?: string;
  onChange: (uri?: string) => void;
}) {
  async function pick() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75,
      });
      if (result.canceled) return;
      let uri = result.assets[0].uri;
      if (Platform.OS !== "web") {
        const directory = Paths.document;
        const file = new File(
          directory,
          `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
        );
        new File(uri).copy(file);
        uri = file.uri;
      }
      onChange(uri);
    } catch {
      Alert.alert(
        "Foto toevoegen is niet gelukt",
        "Probeer de foto opnieuw te kiezen.",
      );
    }
  }
  return (
    <View style={{ gap: 10 }}>
      {uri && (
        <Image
          source={{ uri }}
          style={{ width: 120, height: 120, borderRadius: 18 }}
        />
      )}
      <Button
        secondary
        title={uri ? "Foto wijzigen" : "+ Foto toevoegen (optioneel)"}
        onPress={pick}
      />
      {uri && (
        <Button
          secondary
          title="Foto verwijderen"
          onPress={() => onChange(undefined)}
        />
      )}
    </View>
  );
}
export function VetSummaryCard({
  summary: s,
}: {
  summary: ReturnType<typeof generateVetSummary>;
}) {
  return (
    <View style={cardStyles.neutral}>
      <Text style={styles.heading}>In één oogopslag</Text>
      <View
        style={{
          padding: 18,
          borderRadius: 18,
          backgroundColor: colors.soft,
          gap: 4,
        }}
      >
        <Text
          style={{ fontSize: 36, fontWeight: "700", color: colors.primary }}
        >
          {s.total}
        </Text>
        <Text style={styles.text}>
          observatie{s.total === 1 ? "" : "s"} in deze periode
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          ["Ontlasting", s.countByType.poop],
          ["Zacht / diarree", s.softDiarrheaCount],
          ["Braken", s.vomitCount],
          ["Veranderde eetlust", s.appetiteChangeCount],
          ["Medicatie", s.medicationCount],
          ["Gewichtsmetingen", s.weights.length],
        ].map(([label, count]) => (
          <View
            key={label}
            style={{
              flexGrow: 1,
              width: "46%",
              backgroundColor: colors.background,
              padding: 14,
              borderRadius: 16,
              gap: 8,
            }}
          >
            <Text style={styles.text}>{label}</Text>
            <Text style={styles.heading}>{count}</Text>
          </View>
        ))}
      </View>
      {s.weightTrend !== undefined && (
        <Text style={styles.muted}>
          Van eerste naar laatste meting: {s.weightTrend > 0 ? "+" : ""}
          {formatNumber(s.weightTrend)} kg
        </Text>
      )}
    </View>
  );
}
