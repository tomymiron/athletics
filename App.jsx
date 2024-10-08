import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StartConfigProvider } from "./context/StartPracticeContext.jsx";
import { useSyncAttemptsWithServer } from "./services/syncService.js";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ClientNavigation from "./navigation/ClientNavigation.jsx";
import { SQLiteProvider, openDatabaseAsync } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import LoginNavigation from "./navigation/LoginNavigation.jsx";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import defaultConfig from "./assets/defaultSettings.js";
import { enableScreens } from "react-native-screens";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "./constants/theme.js";
import { StatusBar } from "expo-status-bar";
import * as SQLite from "expo-sqlite";
import { useFonts } from "expo-font";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { RoomProvider } from "./context/RoomContext.jsx";

const initializeDatabase = async () => {
  const db = await openDatabaseAsync('athletics.db');

  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    await db.runAsync(`CREATE TABLE IF NOT EXISTS practice_attempts ( id INTEGER PRIMARY KEY AUTOINCREMENT, time INTEGER, date DATETIME UNIQUE, synced TINYINT DEFAULT 0);`);

    const tableInfo = await db.getAllAsync("PRAGMA table_info(practice_attempts)");
    const hasSyncedColumn = tableInfo.some(column => column.name === 'synced');
    if (!hasSyncedColumn) await db.runAsync(`ALTER TABLE practice_attempts ADD COLUMN synced TINYINT DEFAULT 0`);

    await db.runAsync(`DELETE FROM practice_attempts WHERE id NOT IN ( SELECT MIN(id) FROM practice_attempts GROUP BY date);`);
    await db.runAsync(`CREATE TABLE IF NOT EXISTS practice_config (key TEXT PRIMARY KEY, value TEXT);`);
    await db.runAsync(`DELETE FROM practice_attempts WHERE date IS NULL OR time IS NULL`);

    const result = await db.getFirstAsync("SELECT key FROM practice_config WHERE key = 'practiceConfig';");
    if (!result) await db.runAsync("INSERT INTO practice_config (key, value) VALUES ('practiceConfig', ?);", [JSON.stringify(defaultConfig)]);
    
    console.log("database ok");
  } catch (error) {
    console.log("Error initializing the database", error);
  }
};

export default function App() { 
  const queryClient = new QueryClient();
  enableScreens();
  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      // if (status === 'granted') {
      //   console.log('Yay! I have user permission to track data');
      // }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName="athletics.db" onInit={initializeDatabase}>
          <AuthProvider>
            <RoomProvider>
              <StartConfigProvider>
                <StatusBar translucent theme="light" backgroundColor="transparent"/>
                <SafeAreaProvider>
                  <Layout />
                </SafeAreaProvider>
              </StartConfigProvider>
            </RoomProvider>
          </AuthProvider>
        </SQLiteProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export function Layout() {
  const [splashShowed, setSplashShowed] = useState(false);
  const db = SQLite.useSQLiteContext();
  const { authState } = useAuth();

  useSyncAttemptsWithServer(db, authState);

  const [fontsLoaded] = useFonts({
    Inter_black: require("./assets/fonts/Inter_24pt-Black.ttf"),
    Inter_extraBold: require("./assets/fonts/Inter_24pt-ExtraBold.ttf"),
    Inter_bold: require("./assets/fonts/Inter_24pt-Bold.ttf"),

    Inter_semiBold: require("./assets/fonts/Inter_24pt-SemiBold.ttf"),
    Inter_medium: require("./assets/fonts/Inter_24pt-Medium.ttf"),
    Inter_regular: require("./assets/fonts/Inter_24pt-Regular.ttf"),

    Inter_light: require("./assets/fonts/Inter_24pt-Light.ttf"),
    Inter_extraLight: require("./assets/fonts/Inter_24pt-ExtraLight.ttf"),
    Inter_thin: require("./assets/fonts/Inter_24pt-Thin.ttf"),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && splashShowed === false) {
      try {
        setSplashShowed(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.log("Error hiding splash screen", e);
      }
    }
  }, [fontsLoaded, splashShowed]);
  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);
  if (!fontsLoaded) return null;

  const deleteData = async () => {
    try {
      await db.runAsync(`DELETE FROM practice_attempts;`);
      await db.runAsync(`DELETE FROM practice_config WHERE key = 'practiceConfig';`);
      await SecureStore.deleteItemAsync("lastSyncedAt");
      console.log("Cleaned db.");
    } catch (error) {console.log("Error deleting", error);}
  }

  if(authState?.authenticated == false){
    deleteData();
  }

  

  if(authState?.authenticated == null){
    return <View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.black_01}}>
      <ActivityIndicator color={COLORS.blue_01} size="large" />
    </View>
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.black_01 }}>
      <NavigationContainer theme={{ colors: { background: COLORS.black_01 } }}>
        {authState?.authenticated == true ? <ClientNavigation /> : <LoginNavigation />}
      </NavigationContainer>
    </View>
  );
}