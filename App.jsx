import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StartConfigProvider } from "./context/StartPracticeContext.jsx";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ClientNavigation from "./navigation/ClientNavigation.jsx";
import { SQLiteProvider, openDatabaseAsync } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import LoginNavigation from "./navigation/LoginNavigation.jsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import defaultConfig from "./assets/defaultSettings.js";
import { enableScreens } from "react-native-screens";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from 'expo-secure-store';
import { COLORS } from "./constants/theme.js";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import NetInfo from '@react-native-community/netinfo';
import { makeRequest } from "./constants/axios.js";
import * as SQLite from "expo-sqlite";

const initializeDatabase = async () => {
  const db = await openDatabaseAsync('athletics.db');

  try {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // Crear la tabla practice_attempts
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS practice_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time INTEGER,
        date DATETIME UNIQUE,
        synced TINYINT DEFAULT 0
      );
    `);

    // Verificar si la columna 'synced' existe
    const tableInfo = await db.getAllAsync("PRAGMA table_info(practice_attempts)");
    const hasSyncedColumn = tableInfo.some(column => column.name === 'synced');

    // Si la columna no existe, agregarla
    if (!hasSyncedColumn) {
      await db.runAsync(`ALTER TABLE practice_attempts ADD COLUMN synced TINYINT DEFAULT 0`);
    }

    // Eliminar filas duplicadas
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


const setLastSyncedAt = async (value) => {
  await SecureStore.setItemAsync('lastSyncedAt', value);
};

const getLastSyncedAt = async () => {
  return await SecureStore.getItemAsync('lastSyncedAt');
};

const useSyncAttemptsWithServer = (db, authState) => {
  const [isSyncing, setIsSyncing] = useState(false); // Estado para controlar la sincronización
  const syncRef = useRef(false); // Referencia para controlar el estado de sincronización

  useEffect(() => {
    const syncData = async () => {
      console.log("Pre Entre", authState)
      if (authState?.authenticated == null || authState?.authenticated == false || !authState?.token) return;
      if (syncRef.current || isSyncing) return; // Evitar ejecución si ya está sincronizando
      console.log("Entre")
      syncRef.current = true; // Marcar como en sincronización
      setIsSyncing(true); // Cambiar el estado a sincronizando

      try {
        const lastSyncedAt = await getLastSyncedAt();

        // Obtener intentos del servidor
        const response = await makeRequest.get(`/practice/sync?lastSyncedAt=${lastSyncedAt}`, {
          headers: { authorization: authState.token },
        });

        // Insertar intentos en la base de datos
        for (let attempt of response.data.attempts) {
          await db.runAsync("INSERT OR IGNORE INTO practice_attempts (time, date, synced) VALUES (?, ?, 1)", [attempt.time, attempt.date]);
        }

        // Actualizar el tiempo de última sincronización
        await setLastSyncedAt(new Date().toISOString());

        // Obtener intentos locales que no están sincronizados
        const localAttempts = await db.getAllAsync("SELECT * FROM practice_attempts WHERE synced = 0");
        console.log(localAttempts);

        // Si hay intentos locales para sincronizar, enviarlos al servidor
        if (localAttempts.length > 0) {
          await makeRequest.post("/practice/sync", { attempts: localAttempts }, {
            headers: { authorization: authState.token },
          });
          await db.runAsync("UPDATE practice_attempts SET synced = 1 WHERE synced = 0");
        }
      } catch (err) {
        console.error("Error during sync: ", err);
      } finally {
        syncRef.current = false; // Marcar como no sincronizando
        setIsSyncing(false); // Restablecer el estado de sincronización
      }
    };

    console.log("Se ejecutó la sincronización");
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !syncRef.current) { // Sincronizar solo si hay conexión y no se está sincronizando
        syncData();
      }
    });

    return () => unsubscribe(); // Limpiar suscripción
  }, [authState, db]); // Dependencias
};



export default function App() { 
  const queryClient = new QueryClient();
  enableScreens();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName="athletics.db" onInit={initializeDatabase}>
          <AuthProvider>
          <StartConfigProvider>
            <StatusBar theme="light" backgroundColor="transparent"/>
            <SafeAreaProvider>
              <Layout />
            </SafeAreaProvider>
          </StartConfigProvider>
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


  if(authState?.authenticated == null){
    return <View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: COLORS.black_01}}>
      <ActivityIndicator color={COLORS.blue_01} size="large" />
    </View>
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.black_01 }}>
      <NavigationContainer theme={{ colors: { background: COLORS.black_01 } }}>
        {authState?.authenticated == true ?
          <ClientNavigation />
        :
          <LoginNavigation />
        }
      </NavigationContainer>
    </View>
  );
}