import { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces/700Bold";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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

// Het korte startscherm met Lara, zolang de app zijn lettertype laadt en de
// demo-data klaarzet. Het ziet er hetzelfde uit als het splashscherm (zie
// app.json), dus je merkt geen overgang.
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

// De titel van een formulier hangt af van of je een nieuwe observatie logt of
// een bestaande bewerkt (dan is route.params.observation gevuld).
function formTitle(typeName) {
  return ({ route }) => ({
    title: route.params?.observation ? `${typeName} bewerken` : `${typeName} loggen`,
  });
}

export default function App() {
  // De demo-data (Lara) moet klaarstaan voordat het eerste scherm zijn katten
  // laadt, en het lettertype van de koppen moet geladen zijn. Tot die tijd tonen
  // we het startscherm; dat duurt maar heel even.
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

  // Lukt het laden van het lettertype niet (fontError), dan gaan we toch door; de
  // koppen hebben dan gewoon het standaardlettertype.
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
  );
}

// ============================================================
// ALLES HIERONDER IS MET DE COURSE MEEDOEN
// (uitgecommentarieerd zodat WhiskerWatch nu kan draaien, maar laten
// staan zodat je er later nog naar terug kan kijken)
// ============================================================

// import { useState } from "react";
// import { StyleSheet, View, FlatList } from "react-native";
// import GoalItem from "./components/GoalItemCourse";
// import GoalInput from "./components/GoalInputCourse";

// // View is een beetje zoals een div in HTML. Het is een container die je kunt gebruiken om andere componenten in te plaatsen.
// //FlatList is voor scrollable lists en rendert alleen dingen die zichtbaar zijn. Deze is veeeeel beter voor performance. Dus gebruik DITTT

// export default function App() {
//   const [courseGoals, setCourseGoals] = useState([]);

//   function addGoalHandler(enteredGoalText) {
//     setCourseGoals((currentCourseGoals) => [
//       ...currentCourseGoals,
//       { text: enteredGoalText, id: Math.random().toString() },
//     ]);
//   }

//   function deleteGoalHandler(id) {
//     setCourseGoals((currentCourseGoals) => {
//       return currentCourseGoals.filter((goal) => goal.id !== id);
//     });
//   }

//   return (
//     <View style={styles.appContainer}>
//       <GoalInput onAddGoal={addGoalHandler} />
//       <View style={styles.goalsContainer}>
//         <FlatList
//           data={courseGoals}
//           renderItem={(itemData) => {
//             return (
//               <GoalItem
//                 text={itemData.item.text}
//                 id={itemData.item.id}
//                 onDeleteItem={deleteGoalHandler}
//               />
//             );
//           }}
//           keyExtractor={(item) => item.id}
//           alwaysBounceVertical={false}
//         />
//       </View>
//     </View>
//   );
// }

// // Je kunt herhaling in styling voorkomen door het in een StyleSheet te zetten. Dat is een object waarin je al je styles kunt zetten. Je kunt dan de styles gebruiken door ze te refereren met styles.nameOfStyle.

// const styles = StyleSheet.create({
//   appContainer: {
//     flex: 1,
//     paddingTop: 50,
//     paddingHorizontal: 16,
//   },
//   goalsContainer: {
//     flex: 5,
//   },
// });
