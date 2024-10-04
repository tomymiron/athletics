import { NewRoom, Rooms, StartPractice, StartPracticeConfig, StartPracticeProgress, StartPracticeRanking, StartPracticeRankingGlobal, StartPracticeRankingMonthly, StartPracticeStats } from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

const Stack = createNativeStackNavigator();

export default function ClientNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="PracticeScreen"
        component={StartPractice}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeProgressScreen"
        component={StartPracticeProgress}
        options={{ animation: "slide_from_right", gestureEnabled: false }}
      />
      <Stack.Screen
        name="PracticeConfigScreen"
        component={StartPracticeConfig}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeStatsScreen"
        component={StartPracticeStats}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeRankingScreen"
        component={StartPracticeRanking}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeRankingGlobalScreen"
        component={StartPracticeRankingGlobal}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PracticeRankingMonthlyScreen"
        component={StartPracticeRankingMonthly}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="RoomsScreen"
        component={Rooms}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="NewRoomScreen"
        component={NewRoom}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}