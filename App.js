import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import CatProfileScreen from "./screens/CatProfileScreen";
import AddObservationScreen from "./screens/AddObservationScreen";
import TimelineScreen from "./screens/TimelineScreen";
import Colors from "./constants/colors";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "WhiskerWatch" }} />
        <Stack.Screen
          name="CatProfile"
          component={CatProfileScreen}
          options={{ title: "Kattenprofiel" }}
        />
        <Stack.Screen
          name="AddObservation"
          component={AddObservationScreen}
          options={{ title: "Observatie toevoegen" }}
        />
        <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: "Tijdlijn" }} />
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
