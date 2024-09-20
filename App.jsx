import { SafeAreaProvider } from "react-native-safe-area-context";
import { SQLiteProvider, openDatabaseAsync } from "expo-sqlite";
import { NavigationContainer } from "@react-navigation/native";
import { ClientNavigation } from "./ClientNavigation.jsx";
import { COLORS } from "./constants/theme.js";
import { enableScreens } from 'react-native-screens';


const defaultConfig = {
  voice: {
    lenguage: 1,
    variant: 1,
  },
  times: {
    onYourMarksTimeMin: 2,
    onYourMarksTimeMax: 5,
    setTimeMin: 1,
    setTimeMax: 3,
  },
};

const initializeDatabase = async () => {
  const db = await openDatabaseAsync('athletics.db');

  try {
    await db.execAsync(`PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS practice_attempts ( id INTEGER PRIMARY KEY AUTOINCREMENT, time INTEGER, date DATETIME);`);
    await db.execAsync(`DELETE FROM practice_attempts WHERE date IS NULL OR time IS NULL`);
    await db.runAsync("CREATE TABLE IF NOT EXISTS practice_config (key TEXT PRIMARY KEY, value TEXT);");
    await db.runAsync("INSERT INTO practice_config (key, value) VALUES ('practiceConfig', ?);", [JSON.stringify(defaultConfig)]);
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error initializing the database", error);
  }
};

export default function App() { 
  enableScreens();

  return (
    <SQLiteProvider databaseName="athletics.db" onInit={initializeDatabase}>
      <SafeAreaProvider>
        <NavigationContainer theme={{ colors: { background: COLORS.black_01 } }}>
          <ClientNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}