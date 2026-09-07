import React from "react";
import { View, Text, Switch } from "react-native";
import { Cat, Period } from "../types";
import { Button, Choices, styles } from "./ui";

export function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={[styles.row, { justifyContent: "space-between" }]}>
      <Text style={styles.text}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

export function ButtonChoices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Button
            key={option.value}
            title={option.label}
            secondary={value !== option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

// Filter values follow the storage API; observation drafts use an empty ID for unknown.
export function CatSelector({
  cats,
  value,
  onChange,
  mode = "observation",
}: {
  cats: readonly Cat[];
  value: string;
  onChange: (value: string) => void;
  mode?: "observation" | "filter";
}) {
  return (
    <ButtonChoices
      label={mode === "filter" ? "Kat" : "Welke kat?"}
      value={value}
      onChange={onChange}
      options={[
        ...(mode === "filter" ? [{ value: "", label: "Alle katten" }] : []),
        { value: mode === "filter" ? "unknown" : "", label: "Kat onbekend" },
        ...cats.map((cat) => ({ value: cat.id, label: cat.name })),
      ]}
    />
  );
}

const periodLabels: Record<Period, string> = {
  all: "Alles",
  "7": "Laatste 7 dagen",
  "30": "Laatste 30 dagen",
};
export function PeriodSelector<T extends Period>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <Choices
      label="Periode"
      options={options}
      value={value}
      onChange={onChange}
      getLabel={(option) => periodLabels[option]}
    />
  );
}
