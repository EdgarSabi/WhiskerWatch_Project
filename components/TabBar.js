// TabBar is de balk onderaan met Home, Tijdlijn en Overzicht (het dierenartsoverzicht),
// zoals in het ontwerp. Het is gewoon een rij knoppen die naar de bestaande
// schermen gaat. De schermen zelf blijven in dezelfde stapel (stack) als eerst.
//
// - active: welke van de drie nu open is ("Home", "Timeline" of "VetOverview")
// - navigation: de navigation-prop van het scherm waarop de balk staat

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

  // Home is het eerste scherm van de stapel, de andere twee komen erbovenop:
  // - naar Home: terug naar het bestaande Home-scherm (popTo)
  // - van Home naar een ander scherm: dat scherm erbovenop zetten (navigate)
  // - tussen Tijdlijn en Overzicht: het huidige scherm vervangen (replace), zodat
  //   de stapel niet steeds hoger wordt
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
