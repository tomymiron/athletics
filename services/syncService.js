import NetInfo from "@react-native-community/netinfo";
import { makeRequest } from "../constants/axios.js";
import * as SecureStore from "expo-secure-store";

let isSyncing = false;
let syncRef = false;

// Funciton to sync attempts
export const syncData = async (db, authState) => {
  if (authState?.authenticated == null || authState?.authenticated == false || !authState?.token) return;
  if (syncRef || isSyncing) return;
  isSyncing = true;
  syncRef = true;

  try {
    const localAttempts = await db.getAllAsync("SELECT * FROM practice_attempts WHERE synced = 0");

    const lastSyncedAt = await SecureStore.getItemAsync("lastSyncedAt");
    const response = await makeRequest.get(`/practice/sync?lastSyncedAt=${lastSyncedAt}`, { headers: { authorization: authState.token }});
    for (let attempt of response.data.attempts) await db.runAsync("INSERT OR IGNORE INTO practice_attempts (time, date, synced) VALUES (?, ?, 1)", [attempt.time, attempt.date]);

    await SecureStore.setItemAsync("lastSyncedAt", new Date().toISOString());
    if (localAttempts.length > 0) {
      await makeRequest.post("/practice/sync", { attempts: localAttempts }, { headers: { authorization: authState.token }});

      await db.runAsync("UPDATE practice_attempts SET synced = 1 WHERE synced = 0");
    }
  } catch (err) {
    console.log("Section Sync: \n", err);
  } finally {
    console.log("Se ejecutó la sincronización");
    isSyncing = false;
    syncRef = false;
  }
};

// Funciton to verify and sync attempts
export const useSyncAttemptsWithServer = (db, authState) => {
  NetInfo.addEventListener(state => {
    if (state.isConnected && !syncRef) {
      syncData(db, authState);
    }
  });
};

// Async Function to verify and sync attempts
export const useAsyncSyncAttemptsWithServer = async (db, authState) => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && !syncRef) {
        await syncData(db, authState);
      }
    });
  
    return () => {unsubscribe();};
  };