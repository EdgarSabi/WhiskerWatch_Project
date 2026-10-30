import { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces/700Bold";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";
import CatProfileScreen from "./screens/CatProfileScreen";
import CatFormScreen from "./screens/CatFormScreen";
import AddObservationScreen from "./screens/AddObservationScreen";
import PoopObservationScreen from "./screens/PoopObservationScreen";
import VomitObservationScreen from "./screens/VomitObservationScreen";
import FoodObservationScreen from "./screens/FoodObservationScreen";
import BehaviourObservationScreen from "./screens/BehaviourObservationScreen";
import MedicationObservationScreen from "./screens/MedicationObservationScreen";
import WeightObservationScreen from "./screens/WeightObservationScreen";
import NoteObservationScreen from "./screens/NoteObservationScreen";
import TimelineScreen from "./screens/TimelineScreen";
import VetOverviewScreen from "./screens/VetOverviewScreen";
import AppTitle from "./components/AppTitle";
import Colors from "./constants/colors";
import Fonts from "./constants/fonts";
import { seedDemoData } from "./storage/demoData";

const Stack = createNativeStackNavigator();
const startStyles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECE0",
  },
  image: {
    width: 320,
    height: 320,
  },
});

// "loggen" bij een nieuwe observatie, "bewerken" als je een bestaande opent
function formTitle(typeName) {
  return ({ route }) => ({
    title: route.params?.observation ? `${typeName} bewerken` : `${typeName} loggen`,
  });
}

export default function App() {
  // demo-data moet er staan voordat het dashboard laadt, anders is het even leeg
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ Fraunces_700Bold });

  useEffect(() => {
    async function prepare() {
      try {
        await seedDemoData();
      } catch (error) {
        console.warn("Demo-data kon niet worden klaargezet", error);
      }
      setIsReady(true);
    }

    prepare();
  }, []);

  // lettertype laden mislukt? Dan gewoon doorgaan met het standaardlettertype
  if (!isReady || !(fontsLoaded || fontError)) {
    return (
      <View style={startStyles.screen}>
        <Image
          source={require("./assets/splash-lara.png")}
          style={startStyles.image}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerShadowVisible: false,
            headerTintColor: Colors.text,
            headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.text },
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "WhiskerWatch", headerTitle: () => <AppTitle /> }}
          />
          <Stack.Screen
            name="CatProfile"
            component={CatProfileScreen}
            options={{ title: "Kattenprofiel" }}
          />
          <Stack.Screen
            name="CatForm"
            component={CatFormScreen}
            options={({ route }) => ({
              title: route.params?.cat ? "Profiel bewerken" : "Kat toevoegen",
            })}
          />
          <Stack.Screen
            name="AddObservation"
            component={AddObservationScreen}
            options={{ title: "Observatie toevoegen" }}
          />
          <Stack.Screen
            name="PoopObservation"
            component={PoopObservationScreen}
            options={formTitle("Ontlasting")}
          />
          <Stack.Screen
            name="VomitObservation"
            component={VomitObservationScreen}
            options={formTitle("Braken")}
          />
          <Stack.Screen
            name="FoodObservation"
            component={FoodObservationScreen}
            options={formTitle("Eten & drinken")}
          />
          <Stack.Screen
            name="BehaviourObservation"
            component={BehaviourObservationScreen}
            options={formTitle("Gedrag")}
          />
          <Stack.Screen
            name="MedicationObservation"
            component={MedicationObservationScreen}
            options={formTitle("Medicatie")}
          />
          <Stack.Screen
            name="WeightObservation"
            component={WeightObservationScreen}
            options={formTitle("Gewicht")}
          />
          <Stack.Screen
            name="NoteObservation"
            component={NoteObservationScreen}
            options={formTitle("Algemene notitie")}
          />
          <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: "Tijdlijn" }} />
          <Stack.Screen
            name="VetOverview"
            component={VetOverviewScreen}
            options={{ title: "Dierenartsoverzicht" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
