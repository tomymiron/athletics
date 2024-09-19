import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import SelectInput from "../components/SelectInput";
import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from "react";
import { COLORS, SIZES } from "../constants/theme";
import * as SQLite from "expo-sqlite";
import Icon from "../constants/Icon";

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

export default function StartPracticeConfig() {
  const [onYourMarksTimeMin, setOnYourMarksTimeMin] = useState(defaultConfig.times.onYourMarksTimeMin);
  const [onYourMarksTimeMax, setOnYourMarksTimeMax] = useState(defaultConfig.times.onYourMarksTimeMax);
  const [setTimeMin, setSetTimeMin] = useState(defaultConfig.times.setTimeMin);
  const [setTimeMax, setSetTimeMax] = useState(defaultConfig.times.setTimeMax);
  const [lenguage, setLenguage] = useState(defaultConfig.voice.lenguage);
  const [variant, setVariant] = useState(defaultConfig.voice.variant);
  const db = SQLite.useSQLiteContext();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (onYourMarksTimeMax < onYourMarksTimeMin) {
      setOnYourMarksTimeMax(onYourMarksTimeMin);
    }
  }, [onYourMarksTimeMax, onYourMarksTimeMin]);

  useEffect(() => {
    if (setTimeMax < setTimeMin) {
      setSetTimeMax(setTimeMin);
    }
  }, [setTimeMin, setTimeMax]);

  const lenguageOptions = [
    { label: "English", value: 1 },
    { label: "Español", value: 2 },
  ];
  const englishVoiceVariant = [
    { label: "Voice 01", value: 1 },
    { label: "Voice 02", value: 2 },
    { label: "Voice 03", value: 3 },
    { label: "Voice 04", value: 4 },
  ];
  const spanishVoiceVariant = [
    { label: "Voz 01", value: 1 },
    { label: "Voz 02", value: 2 },
    { label: "Voz 03", value: 3 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await db.getFirstAsync("SELECT value FROM practice_config WHERE key = 'practiceConfig';");
        const data = result ? result.value : null;

        if (data == null) {
          await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(defaultConfig)]);
        } else {
          const parsedConfig = JSON.parse(data);
          updateConfig(parsedConfig);
        }
      } catch (e) {
        console.log("Error al obtener los datos", e);
      }
    };

    const updateConfig = (config) => {
      setOnYourMarksTimeMax(config?.times.onYourMarksTimeMax);
      setOnYourMarksTimeMin(config?.times.onYourMarksTimeMin);
      setSetTimeMin(config?.times.setTimeMin);
      setSetTimeMax(config?.times.setTimeMax);
      setLenguage(config?.voice.lenguage);
      setVariant(config?.voice.variant);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const saveConfig = async () => {
      const config = {
        voice: {
          lenguage: lenguage,
          variant: variant,
        },
        times: {
          onYourMarksTimeMin: onYourMarksTimeMin,
          onYourMarksTimeMax: onYourMarksTimeMax,
          setTimeMin: setTimeMin,
          setTimeMax: setTimeMax,
        },
      };
      await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(config)]);
    };

    saveConfig();
  }, [onYourMarksTimeMax, onYourMarksTimeMin, setTimeMax, setTimeMin, lenguage, variant]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={() => navigation.navigate("PracticeScreen")} >
        <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3} />
      </TouchableOpacity>

      <Text style={[styles.screenTitle, {marginTop: insets.top + 72}]}>Configuracion</Text>

      <View style={[styles.boxContainer, {zIndex: 1000}]}>
        <Text style={styles.boxTitle}>Voz de partida</Text>
        <View style={{ zIndex: 1000 }}>
          <SelectInput
            onSelectItem={() => setVariant(1)}
            itemsUsed={lenguageOptions}
            setValue={setLenguage}
            placeholder="Lenguaje"
            value={lenguage}
            lightTheme
          />
        </View>
        <View style={{ zIndex: -1 }}>
          <SelectInput
            itemsUsed={lenguage == 1 ? englishVoiceVariant : spanishVoiceVariant}
            style={{ marginTop: 4 }}
            setValue={setVariant}
            placeholder="Variante"
            value={variant}
            lightTheme
          />
        </View>
      </View>

      <View style={styles.boxContainer}>
        <Text style={styles.boxTitle}>Tiempo en Preparacion</Text>
        <View style={styles.subBoxContainer}>
          <View>
            <Slider
              style={{width: Dimensions.get("screen").width * .8, height: 40}}
              onValueChange={(value) => setOnYourMarksTimeMin(value)}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              value={onYourMarksTimeMin}
              maximumValue={10}
              minimumValue={1}
              step={0.5}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.time}>1s</Text>
              <Text style={styles.time}>10s</Text>
            </View>
            <Text style={styles.min}>MINIMO <Text style={styles.bold}>{onYourMarksTimeMin}s</Text>
            </Text>
          </View>
        </View>

        <View style={styles.subBoxContainer}>
          <View>
            <View style={styles.timeContainer2}>
              <Text style={styles.time}>{onYourMarksTimeMin}s</Text>
              <Text style={styles.time}>15s</Text>
            </View>
            <Text style={styles.max}>MAXIMO <Text style={styles.bold}>{onYourMarksTimeMax}s</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .8, height: 40}}
              onValueChange={(value) => setOnYourMarksTimeMax(value)}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              minimumValue={onYourMarksTimeMin}
              value={onYourMarksTimeMax}
              maximumValue={15}
              step={0.5}
            />
          </View>
        </View>
      </View>

      <View style={styles.boxContainer}>
        <Text style={styles.boxTitle}>Tiempo en Listos</Text>
        <View style={styles.subBoxContainer}>
          <View>
            <Slider
              style={{width: Dimensions.get("screen").width * .8, height: 40}}
              onValueChange={(value) => setSetTimeMin(value)}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              value={setTimeMin}
              maximumValue={3}
              minimumValue={1}
              step={0.5}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.time}>1s</Text>
              <Text style={styles.time}>3s</Text>
            </View>
            <Text style={styles.min}>MINIMO <Text style={styles.bold}>{setTimeMin}s</Text>
            </Text>
          </View>
        </View>

        <View style={styles.subBoxContainer}>
          <View>
            <View style={styles.timeContainer2}>
              <Text style={styles.time}>{setTimeMin}s</Text>
              <Text style={styles.time}>5s</Text>
            </View>
            <Text style={styles.max}>MAXIMO <Text style={styles.bold}>{setTimeMax}s</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .8, height: 40}}
              onValueChange={(value) => setSetTimeMax(value)}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              minimumValue={setTimeMin}
              value={setTimeMax}
              maximumValue={5}
              step={0.5}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black_01,
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    backgroundColor: COLORS.purple_01,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    height: 48,
    width: 48,
    left: 32,
  },
  screenTitle: {
    color: COLORS.white_01,
    fontSize: SIZES.f2,
    fontWeight: "700",
    paddingLeft: 24,
    width: "100%",
  },
  boxContainer: {
    backgroundColor: COLORS.black_02,
    borderRadius: 12,
    marginTop: 6,
    width: "90%",
    padding: 24,
    zIndex: 100,
  },
  boxTitle: {
    color: COLORS.white_01,
    fontSize: SIZES.f4,
    fontWeight: "500",
    marginBottom: 8,
    width: "100%",
  },
  subBoxContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  timeContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "flex-end",
    flexDirection: "row",
    marginTop: 8,
  },
  timeContainer2: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    alignItems: "flex-end",
    flexDirection: "row",
    marginBottom: 8,
  },
  time: {
    color: COLORS.white_01,
  },
  min: {
    color: COLORS.white_01,
    maxHeight: SIZES.f6,
    textAlign: "center",
    fontSize: SIZES.f7,
    fontWeight: "400",
    marginTop: -14,
    flex: 1,
  },
  max: {
    color: COLORS.white_01,
    maxHeight: SIZES.f6,
    textAlign: "center",
    fontSize: SIZES.f7,
    fontWeight: "400",
    marginBottom: 8,
    marginTop: -22,
    flex: 1,
  },
  bold: {
    fontWeight: "700"
  },
});