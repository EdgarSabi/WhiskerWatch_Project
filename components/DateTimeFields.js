// datum en tijd kiezen zonder typen, de "Andere ..." knoppen openen de Android-kiezer

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

// bij een nieuwe observatie (isNew) staat Nu standaard aan
function DateTimeFields({ value, onValueChange, isNew }) {
  const [useNow, setUseNow] = useState(isNew);
  const isToday = isSameDay(value, new Date());

  // een keuze verandert maar een deel (datum of tijd), dus eerst een kopie maken
  function setDatePart(newDate) {
    const changed = new Date(value);
    changed.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

    // vandaag kiezen terwijl de tijd nog later is dan nu (20:00 terwijl het 10:00 is)? Dan wordt het nu
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

  // bij annuleren hoeft er niets te gebeuren, dus geen onDismiss
  function otherDateHandler() {
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
        // de tijdkiezer kent geen maximum, daarom hier zelf checken
        const chosen = new Date(value);
        chosen.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

        if (chosen.getTime() > Date.now()) {
          Alert.alert("Die tijd ligt in de toekomst", "Kies een tijd van nu of eerder.");
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
