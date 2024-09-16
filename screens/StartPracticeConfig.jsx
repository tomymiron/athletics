import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";
import Icon from "../constants/Icon";
import Slider from "@candlefinance/slider";
import SelectInput from "../components/SelectInput";
import { getData, storeData } from "../constants/dataExchange";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

export default function StartPracticeConfig() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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

  const [onYourMarksTimeMin, setOnYourMarksTimeMin] = useState(defaultConfig.times.onYourMarksTimeMin);
  const [onYourMarksTimeMax, setOnYourMarksTimeMax] = useState(defaultConfig.times.onYourMarksTimeMax);
  const [setTimeMin, setSetTimeMin] = useState(defaultConfig.times.setTimeMin);
  const [setTimeMax, setSetTimeMax] = useState(defaultConfig.times.setTimeMax);
  const [lenguage, setLenguage] = useState(defaultConfig.voice.lenguage);
  const [variant, setVariant] = useState(defaultConfig.voice.variant);

  useEffect(() => {
    if (onYourMarksTimeMax > onYourMarksTimeMin) {
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
        const data = await getData("practiceConfig");
        console.log("HOLA: ", data);

        if (data == undefined) {
          await storeData("practiceConfig", JSON.stringify(defaultConfig));
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
      console.log("CONFIG: ", config);
      await storeData("practiceConfig", JSON.stringify(config));
    };

    saveConfig();
  }, [onYourMarksTimeMax, onYourMarksTimeMin, setTimeMax, setTimeMin, lenguage, variant]);





  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={() => navigation.navigate("PracticeScreen")} >
        <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3} />
      </TouchableOpacity>

      <Text style={{ width: "100%", color: COLORS.white_01, fontSize: SIZES.f2, paddingLeft: 24, marginTop: insets.top + 72, fontWeight: "700", }}>Configuracion</Text>

      <View style={{ marginTop: 6, padding: 24, backgroundColor: COLORS.black_02, width: "90%", borderRadius: 12, zIndex: 1000, }}>
        <Text style={{ color: COLORS.white_01, marginBottom: 8, width: "100%", fontSize: SIZES.f4, fontWeight: "500", }}>Voz de partida</Text>
        <View style={{ zIndex: 1000 }}>
          <SelectInput
            itemsUsed={lenguageOptions}
            value={lenguage}
            setValue={setLenguage}
            placeholder="Lenguaje"
            lightTheme
          />
        </View>
        <View style={{ zIndex: -1 }}>
          <SelectInput
            itemsUsed={lenguage == 1 ? englishVoiceVariant : spanishVoiceVariant}
            value={variant}
            setValue={setVariant}
            placeholder="Variante"
            lightTheme
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      <View style={{ marginTop: 6, padding: 24, backgroundColor: COLORS.black_02, width: "90%", borderRadius: 12, }}>
        <View style={{ justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
          <Text style={{ color: COLORS.white_01, marginBottom: 8, width: "100%", fontSize: SIZES.f4, fontWeight: "500", }}>Tiempo en Preparacion</Text>

          <View>
            <MultiSlider
                onValuesChange={(value) => setOnYourMarksTimeMin(value)}
                unselectedStyle={{ backgroundColor: COLORS.black_01 }}
                selectedStyle={{ backgroundColor: COLORS.blue_01 }}
                sliderLength={Dimensions.get("screen").width * .8}
                markerStyle={{backgroundColor: COLORS.white_01}}
                trackStyle={{ height: 38, borderRadius: 24, }}
                values={[setOnYourMarksTimeMin]}
                markerOffsetY={19}
                allowOverlap
                step={0.5}
                min={1}
                max={10}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 12, marginTop: 8, }}>
              <Text style={{ color: COLORS.white_01 }}>1s</Text>
              <Text style={{ color: COLORS.white_01 }}>10s</Text>
            </View>
            <Text style={{ color: COLORS.white_01, fontSize: SIZES.f7, fontWeight: "400", flex: 1, maxHeight: SIZES.f6, textAlign: "center", marginTop: -14, }}>MINIMO <Text style={{ fontWeight: "700" }}>{onYourMarksTimeMin}s</Text>
            </Text>
          </View>
        </View>

        <View style={{ justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 12, marginBottom: 8, }}>
              <Text style={{ color: COLORS.white_01 }}>{onYourMarksTimeMin}s</Text>
              <Text style={{ color: COLORS.white_01 }}>15s</Text>
            </View>
            <Text style={{ color: COLORS.white_01, fontSize: SIZES.f7, fontWeight: "400", flex: 1, maxHeight: SIZES.f6, textAlign: "center", marginTop: -22, marginBottom: 8, }}>MAXIMO <Text style={{ fontWeight: "700" }}>{onYourMarksTimeMax}s</Text>
            </Text>
            <MultiSlider
              onValuesChange={(value) => setOnYourMarksTimeMax(value)}
              unselectedStyle={{ backgroundColor: COLORS.black_01 }}
              selectedStyle={{ backgroundColor: COLORS.blue_01 }}
              sliderLength={Dimensions.get("screen").width * 0.8}
              markerStyle={{ backgroundColor: COLORS.white_01 }}
              trackStyle={{ height: 38, borderRadius: 24 }}
              values={[setOnYourMarksTimeMax]}
              markerOffsetY={19}
              allowOverlap
              step={0.5}
              min={setOnYourMarksTimeMin[0]}
              max={15}
            />
{/* 
            <Slider
              onChange={(value) => setOnYourMarksTimeMax(value)}
              width={Dimensions.get("screen").width * 0.8}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              value={onYourMarksTimeMax}
              showBallIndicator={false}
              min={onYourMarksTimeMin}
              disabled={false}
              height={38}
              step={0.5}
              max={15}
            /> */}
          </View>
        </View>
      </View>

      <View style={{ marginTop: 6, padding: 24, backgroundColor: COLORS.black_02, width: "90%", borderRadius: 12, }}>
        <View style={{ justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
          <Text style={{ color: COLORS.white_01, marginBottom: 8, width: "100%", fontSize: SIZES.f4, fontWeight: "500", }}>Tiempo en Listos</Text>
          <View>
            <Slider
              onChange={(value) => setSetTimeMin(value)}
              width={Dimensions.get("screen").width * 0.8}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              value={setTimeMin}
              showBallIndicator={false}
              disabled={false}
              height={38}
              step={0.5}
              max={3}
              min={1}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 12, marginTop: 8, }}>
              <Text style={{ color: COLORS.white_01 }}>1s</Text>
              <Text style={{ color: COLORS.white_01 }}>3s</Text>
            </View>
            <Text style={{ color: COLORS.white_01, fontSize: SIZES.f7, fontWeight: "400", flex: 1, maxHeight: SIZES.f6, textAlign: "center", marginTop: -14, }}>MINIMO <Text style={{ fontWeight: "700" }}>{setTimeMin}s</Text>
            </Text>
          </View>
        </View>

        <View style={{ justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 12, marginBottom: 8, }}>
              <Text style={{ color: COLORS.white_01 }}>{setTimeMin}s</Text>
              <Text style={{ color: COLORS.white_01 }}>5s</Text>
            </View>
            <Text style={{ color: COLORS.white_01, fontSize: SIZES.f7, fontWeight: "400", flex: 1, maxHeight: SIZES.f6, textAlign: "center", marginTop: -22, marginBottom: 8, }}>MAXIMO <Text style={{ fontWeight: "700" }}>{setTimeMax}s</Text></Text>
            <Slider
              onChange={(value) => setSetTimeMax(value)}
              width={Dimensions.get("screen").width * 0.8}
              maximumTrackTintColor={COLORS.black_01}
              minimumTrackTintColor={COLORS.blue_01}
              value={setTimeMax}
              showBallIndicator={false}
              min={setTimeMin}
              disabled={false}
              height={38}
              step={0.5}
              max={5}
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
});
