import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, ScrollView, Alert } from "react-native";
import { useStartConfig } from "../context/StartPracticeContext.jsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import defaultConfig from "../assets/defaultSettings";
import { useAuth } from "../context/AuthContext.jsx";
import SelectInput from "../components/SelectInput";
import Slider from "@react-native-community/slider";
import React, { useState, useEffect } from "react";
import { COLORS, SIZES } from "../constants/theme";
import Icon from "../constants/Icon";

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

export default function StartPracticeConfig() {
  const [onYourMarksTimeMin, setOnYourMarksTimeMin] = useState(defaultConfig.times.onYourMarksTimeMin);
  const [onYourMarksTimeMax, setOnYourMarksTimeMax] = useState(defaultConfig.times.onYourMarksTimeMax);
  const [setTimeMin, setSetTimeMin] = useState(defaultConfig.times.setTimeMin);
  const [setTimeMax, setSetTimeMax] = useState(defaultConfig.times.setTimeMax);
  const [lenguage, setLenguage] = useState(defaultConfig.voice.lenguage);
  const [variant, setVariant] = useState(defaultConfig.voice.variant);

  const { startConfig, updateConfig } = useStartConfig();
  const { authState, logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (onYourMarksTimeMax < onYourMarksTimeMin + 1.5) {
      setOnYourMarksTimeMax(onYourMarksTimeMin + 1.5);
    }
  }, [onYourMarksTimeMax, onYourMarksTimeMin]);
  useEffect(() => {
    if (setTimeMax < setTimeMin + 1.5) {
      setSetTimeMax(setTimeMin + 1.5);
    }
  }, [setTimeMin, setTimeMax]);

  // --- StartUp Config and Update ---
  useEffect(() => {
    setOnYourMarksTimeMin(startConfig.times.onYourMarksTimeMin);
    setOnYourMarksTimeMax(startConfig.times.onYourMarksTimeMax);
    setSetTimeMin(startConfig.times.setTimeMin);
    setSetTimeMax(startConfig.times.setTimeMax);
    setLenguage(startConfig.voice.lenguage);
    setVariant(startConfig.voice.variant);
  }, []);
  useEffect(() => {
    updateConfig({
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
    });
  }, [onYourMarksTimeMax, onYourMarksTimeMin, setTimeMax, setTimeMin, lenguage, variant]);
  // --- StartUp Config and Update ---

  const logoutConfirmation = () => {
    Alert.alert("Confirmación", "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aceptar", onPress: () => logout(), style: "default" }
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={[styles.mainContainer, {paddingTop: insets.top + 12}]}>

      <TouchableOpacity style={[styles.backButton, {backgroundColor: COLORS.black_01}]} onPress={() => navigation.navigate("PracticeScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3}/>
      </TouchableOpacity>

      <Text style={styles.configurationTitle}>Configuracion</Text>

      <View style={styles.boxContainer01}>
        <View style={styles.accountContainer}>
          <Text style={styles.accountTitle}>Tu cuenta</Text>
          <Text style={styles.account}>{authState.user.email.length > 24 ? authState.user.email.slice(0, 24) + "..." : authState.user.email}</Text>
        </View>
        <TouchableOpacity style={styles.accountIcon} onPress={logoutConfirmation}>
          <Icon name="logout" color={COLORS.red_01} size={SIZES.i2}/>
        </TouchableOpacity>
      </View>

      <View style={[styles.boxContainer02, {zIndex: 100}]}>
        <Text style={[styles.boxTitle, {marginBottom: 8}]}>Voz de Partida</Text>
        <View style={styles.selectsContainer}>
          <View style={styles.firstSelectInput}>
            <SelectInput
              onSelectItem={() => setVariant(1)}
              itemsUsed={lenguageOptions}
              setValue={setLenguage}
              placeholder="Lenguaje"
              value={lenguage}
              lightTheme
            />
          </View>
          <View style={{zIndex: -1}}>
            <SelectInput
              itemsUsed={lenguage == 1 ? englishVoiceVariant : spanishVoiceVariant}
              setValue={setVariant}
              placeholder="Variante"
              value={variant}
              lightTheme
            />
          </View>
        </View>
      </View>

      <View style={styles.boxContainer02}>
        <Text style={styles.boxTitle}>Tiempo en Preparacion</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderContainerLeft}>
            <Text style={styles.timeTitle}>Tiempo <Text style={styles.timeTitleBold}>Minimo</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
              onValueChange={(value) => setOnYourMarksTimeMin(value)}
              maximumTrackTintColor={COLORS.black_02}
              minimumTrackTintColor={COLORS.blue_01}
              thumbTintColor={COLORS.blue_01}
              value={onYourMarksTimeMin}
              maximumValue={10}
              minimumValue={1}
              step={0.5}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{onYourMarksTimeMin}s</Text>
          </View>
        </View>
        <View style={[styles.sliderContainer, {marginTop: 12}]}>
          <View style={styles.sliderContainerLeft}>
            <Text style={styles.timeTitle}>Tiempo <Text style={styles.timeTitleBold}>Maximo</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
              onValueChange={(value) => setOnYourMarksTimeMax(value)}
              maximumTrackTintColor={COLORS.black_02}
              minimumTrackTintColor={COLORS.blue_01}
              minimumValue={onYourMarksTimeMin + 1.5}
              thumbTintColor={COLORS.blue_01}
              value={onYourMarksTimeMax}
              maximumValue={15}
              step={0.5}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{onYourMarksTimeMax}s</Text>
          </View>
        </View>
      </View>

      <View style={styles.boxContainer02}>
        <Text style={styles.boxTitle}>Tiempo en Listos</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderContainerLeft}>
            <Text style={styles.timeTitle}>Tiempo <Text style={styles.timeTitleBold}>Minimo</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
              onValueChange={(value) => setSetTimeMin(value)}
              maximumTrackTintColor={COLORS.black_02}
              minimumTrackTintColor={COLORS.blue_01}
              thumbTintColor={COLORS.blue_01}
              value={setTimeMin}
              maximumValue={3}
              minimumValue={1}
              step={0.5}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{setTimeMin}s</Text>
          </View>
        </View>
        <View style={[styles.sliderContainer, {marginTop: 12}]}>
          <View style={styles.sliderContainerLeft}>
            <Text style={styles.timeTitle}>Tiempo <Text style={styles.timeTitleBold}>Maximo</Text></Text>
            <Slider
              style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
              onValueChange={(value) => setSetTimeMax(value)}
              maximumTrackTintColor={COLORS.black_02}
              minimumTrackTintColor={COLORS.blue_01}
              thumbTintColor={COLORS.blue_01}
              minimumValue={setTimeMin + 1.5}
              value={setTimeMax}
              maximumValue={5}
              step={0.5}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{setTimeMax}s</Text>
          </View>
        </View>
      </View>
      <View style={{height: 200}}/>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.blue_01,
    paddingHorizontal: 24,
    flex: 1,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  configurationTitle: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    fontSize: SIZES.f1,
    marginTop: 28,
  },
  boxContainer01: {
    backgroundColor: COLORS.black_01,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 34,
    marginTop: 24,
    width: "100%",
    height: 68,
  },
  accountContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 24,
  },
  accountTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.white_01,
    lineHeight: SIZES.f5,
    fontSize: SIZES.f5,
  },
  account: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    lineHeight: SIZES.f4,
    fontSize: SIZES.f4,
  },
  accountIcon: {
    borderColor: COLORS.red_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    paddingRight: 1,
    marginRight: 10,
    borderWidth: 2,
    height: 48,
    width: 48,
  },
  boxContainer02: {
    backgroundColor: COLORS.black_01,
    flexDirection: "column",
    borderRadius: 20,
    marginTop: 8,
    padding: 24,
  },
  boxTitle: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
    marginBottom: 24,
  },
  sliderContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  sliderContainerLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  timeTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.blue_01,
    lineHeight: SIZES.f6,
    fontSize: SIZES.f6,
  },
  timeTitleBold: {
    fontFamily: "Inter_extraBold",
  },
  timeContainer: {
    backgroundColor: COLORS.black_02,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    width: 68,
  },
  time: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  firstSelectInput: {
    marginBottom: 8,
    zIndex: 1000,
  }

});