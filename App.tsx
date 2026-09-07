import React from "react";
import { ActivityIndicator, Text, Pressable } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DataProvider, useData } from "./src/storage/DataProvider";
import { Page, Button, colors, styles } from "./src/components/ui";
import { RootStackParamList } from "./src/types/navigation";
import HomeScreen from "./src/screens/HomeScreen";
import AddCatScreen from "./src/screens/AddCatScreen";
import CatDetailScreen from "./src/screens/CatDetailScreen";
import AddObservationScreen from "./src/screens/AddObservationScreen";
import TimelineScreen from "./src/screens/TimelineScreen";
import VetSummaryScreen from "./src/screens/VetSummaryScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();
function Navigation() {
  const { loading, error, refresh } = useData();
  if (loading)
    return (
      <Page>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>
          De gegevens van je katten worden geopend…
        </Text>
      </Page>
    );
  if (error)
    return (
      <Page>
        <Text style={styles.text}>{error}</Text>
        <Button title="Probeer opnieuw" onPress={() => void refresh()} />
      </Page>
    );
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.background,
          text: colors.ink,
          border: colors.border,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShadowVisible: false,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Terug"
                onPress={() => navigation.goBack()}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 26, color: colors.ink }}>‹</Text>
              </Pressable>
            ) : null,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "WhiskerWatch" }}
        />
        <Stack.Screen
          name="AddCat"
          component={AddCatScreen}
          options={{ title: "Katprofiel" }}
        />
        <Stack.Screen
          name="CatDetail"
          component={CatDetailScreen}
          options={{ title: "Jouw kat" }}
        />
        <Stack.Screen
          name="AddObservation"
          component={AddObservationScreen}
          options={{ title: "Nieuwe observatie" }}
        />
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{ title: "Tijdlijn" }}
        />
        <Stack.Screen
          name="VetSummary"
          component={VetSummaryScreen}
          options={{ title: "Dierenartsoverzicht" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="dark" />
        <Navigation />
      </DataProvider>
    </SafeAreaProvider>
  );
}
