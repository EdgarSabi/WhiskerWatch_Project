// DateTimeFields is de datum- en tijdkeuze voor alle observatieformulieren.
// Je typt niets meer: je kiest "Vandaag" of "Andere datum", en "Nu" of
// "Andere tijd". De andere keuzes openen de native kiezer van Android.
//
// Het formulier bewaart het moment als één Date (value). Wij geven een gewijzigde
// Date terug via onValueChange. Het formulier slaat hem op als observedAt.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import Colors from "../constants/colors";
import { formatDate, formatTime } from "../helpers/observationHelpers";

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// isNew: true bij een nieuwe observatie (dan staat "Nu" aan), false bij bewerken.
function DateTimeFields({ value, onValueChange, isNew }) {
  const [useNow, setUseNow] = useState(isNew);
  const isToday = isSameDay(value, new Date());

  // Elke keuze verandert maar een deel van value: de datum of de tijd. We maken
  // eerst een kopie, zodat de oude Date niet wordt aangepast.
  function setDatePart(newDate) {
    const changed = new Date(value);
    changed.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

    // Een observatie kan niet in de toekomst liggen. Kiezen we vandaag terwijl de
    // tijd nog later is dan nu (bijv. 20:00 terwijl het 10:00 is), dan wordt
    // het tijdstip "nu".
    if (changed.getTime() > Date.now()) {
      setUseNow(true);
      onValueChange(new Date());
      return;
    }

    onValueChange(changed);
  }

  function setTimePart(newTime, seconds) {
    const changed = new Date(value);
    changed.setHours(newTime.getHours(), newTime.getMinutes(), seconds, 0);
    onValueChange(changed);
  }

  function todayHandler() {
    setDatePart(new Date());
  }

  // De callbacks heten onValueChange (bij kiezen). Bij annuleren hoeft er niets
  // te gebeuren, dus onDismiss en onNeutralButtonPress gebruiken we niet.
  function otherDateHandler() {
    // De datum van een observatie kan niet in de toekomst liggen.
    DateTimePickerAndroid.open({
      value: value,
      mode: "date",
      maximumDate: new Date(),
      onValueChange: (event, selectedDate) => {
        setDatePart(selectedDate);
      },
    });
  }

  function nowHandler() {
    setUseNow(true);
    const now = new Date();
    setTimePart(now, now.getSeconds());
  }

  function otherTimeHandler() {
    DateTimePickerAndroid.open({
      value: value,
      mode: "time",
      is24Hour: true,
      onValueChange: (event, selectedTime) => {
        // De tijdkiezer kan geen maximum afdwingen, dus controleren we het zelf.
        // Is de datum vandaag, dan mag de tijd niet later zijn dan nu.
        const chosen = new Date(value);
        chosen.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

        if (chosen.getTime() > Date.now()) {
          Alert.alert("Tijd in de toekomst", "Kies een tijd die niet later is dan nu.");
          return;
        }

        setUseNow(false);
        onValueChange(chosen);
      },
    });
  }

  return (
    <View>
      <Text style={styles.label}>Datum</Text>
      <View style={styles.pillRow}>
        <Pressable style={[styles.pill, isToday && styles.pillSelected]} onPress={todayHandler}>
          <Text style={[styles.pillText, isToday && styles.pillTextSelected]}>Vandaag</Text>
        </Pressable>
        <Pressable style={[styles.pill, !isToday && styles.pillSelected]} onPress={otherDateHandler}>
          <Text style={[styles.pillText, !isToday && styles.pillTextSelected]}>Andere datum</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Tijd</Text>
      <View style={styles.pillRow}>
        <Pressable style={[styles.pill, useNow && styles.pillSelected]} onPress={nowHandler}>
          <Text style={[styles.pillText, useNow && styles.pillTextSelected]}>Nu</Text>
        </Pressable>
        <Pressable style={[styles.pill, !useNow && styles.pillSelected]} onPress={otherTimeHandler}>
          <Text style={[styles.pillText, !useNow && styles.pillTextSelected]}>Andere tijd</Text>
        </Pressable>
      </View>

      {/* Zo zie je altijd precies welk moment je hebt gekozen. */}
      <Text style={styles.summary}>
        {formatDate(value)} om {formatTime(value)}
      </Text>
    </View>
  );
}

export default DateTimeFields;

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  summary: {
    color: Colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
});
