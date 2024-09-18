import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { ClientNavigation } from "./ClientNavigation.jsx";
import { COLORS } from "./constants/theme.js";
import * as SQLite from "expo-sqlite";

const initializeDatabase = async (db) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS practice_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        time INTEGER, 
        date DATETIME
      );
    `);
    await db.execAsync(`
      DELETE FROM practice_attempts WHERE date IS NULL OR time IS NULL 
    `);
    console.log("Database initialized!");
  } catch (error) {
    console.log("Error initializing the database", error);
  }
};

export default function App() { 

  return (
    <SQLite.SQLiteProvider databaseName="athletics.db" onInit={initializeDatabase}>
      <SafeAreaProvider>
        <NavigationContainer theme={{ colors: { background: COLORS.black_01 } }}>
          <ClientNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </SQLite.SQLiteProvider>
  );
}