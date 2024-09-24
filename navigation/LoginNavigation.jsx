import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Login, Register} from "../screens";
import React from "react";

const Stack = createNativeStackNavigator();

export default function LoginNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}