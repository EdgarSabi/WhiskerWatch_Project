// Home, Tijdlijn en Overzicht (dierenartsoverzicht) onderaan, gewoon knoppen naar de bestaande schermen
// active = welke van de drie nu open is ("Home", "Timeline" of "VetOverview")

import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";

const TABS = [
  { route: "Home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { route: "Timeline", label: "Tijdlijn", icon: "format-list-bulleted", activeIcon: "format-list-bulleted" },
  {
    route: "VetOverview",
    label: "Overzicht",
    icon: "clipboard-check-outline",
    activeIcon: "clipboard-check-outline",
  },
];

function TabBar({ active, navigation }) {
  const insets = useSafeAreaInsets();

  // Home is het eerste scherm in de stapel, de andere twee komen erbovenop
  // tussen Tijdlijn en Overzicht vervangen we het scherm (replace), anders groeit de stapel
  function tabPressHandler(route) {
    if (route === active) {
      return;
    }

    if (route === "Home") {
      navigation.popTo("Home");
    } else if (active === "Home") {
      navigation.navigate(route);
    } else {
      navigation.replace(route);
    }
  }

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {TABS.map((tab) => {
        const isActive = tab.route === active;

        return (
          <Pressable
            key={tab.route}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            onPress={() => tabPressHandler(tab.route)}
          >
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? Colors.primary : Colors.textLight}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default TabBar;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  tabPressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textLight,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
