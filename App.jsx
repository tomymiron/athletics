import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClientNavigation } from "./ClientNavigation.jsx";
import { COLORS } from "./constants/theme.js";


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{ colors: { background: COLORS.black_01 } }}>
        <ClientNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}