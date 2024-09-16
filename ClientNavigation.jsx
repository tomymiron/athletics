import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StartPractice, StartPracticeConfig } from "./screens";
import React from "react";

const Stack = createNativeStackNavigator();

export function ClientNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="PracticeScreen"
        component={StartPractice}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeScreenConfig"
        component={StartPracticeConfig}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}