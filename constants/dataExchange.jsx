import AsyncStorage from "@react-native-async-storage/async-storage";

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) return value;
  } catch (e) {
    console.log("Error al leer los datos", e);
  }
};

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error("Error al guardar los datos", e);
  }
};
