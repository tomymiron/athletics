import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useStartConfig } from "../context/StartPracticeContext.jsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import { COLORS, SIZES } from "../constants/theme.js";
import { Accelerometer } from "expo-sensors";
import Icon from "../constants/Icon.jsx";
import * as SQLite from "expo-sqlite";
import { Audio } from "expo-av";

const playSound = async (soundFile) => {
  const { sound } = await Audio.Sound.createAsync(soundFile);
  await sound.playAsync();
};

export default function StartPracticeProgress() {
  const [reactionTime, setReactionTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [status, setStatus] = useState(1);
  const { startConfig } = useStartConfig();

  const db = SQLite.useSQLiteContext();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const timeoutNoReactionRef = useRef(null);
  const blockInteractionRef = useRef(false);
  const timeoutRaceRef = useRef(null); 
  const timeoutShotRef = useRef(null);
  const timeoutSetRef = useRef(null); 
  const intervalIdRef = useRef(null); 
  const startTimeRef = useRef(null); 

  useEffect(() => {
    if(isFocused) {
      startRace();
    }
  }, [isFocused]);
  
  // --- Handlers For Stop Race ---
  const handleReaction = async () => {
    if (startTimeRef.current && status != 5) {
      const reactionDuration = Date.now() - startTimeRef.current;
      setReactionTime(reactionDuration);
      stopAccelerometer();
      stopElapsedTime();
      setStatus(4);

      startTimeRef.current = null;
      const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
      await db.runAsync("INSERT INTO practice_attempts (time, date, synced) VALUES (?,?,0)", [reactionDuration, currDateTime])

      setTimeout(() => {
        blockInteractionRef.current = false;
      }, 100);
    }
  };
  const handleFalseStart = async () => {
    const falseDetect = () => {
      startTimeRef.current = null;  
      stopAccelerometer();
      stopElapsedTime();
      setStatus(5);
  
      if (timeoutRaceRef.current) clearTimeout(timeoutRaceRef.current);
      if (timeoutShotRef.current) clearTimeout(timeoutShotRef.current);
      if (timeoutSetRef.current) clearTimeout(timeoutSetRef.current);
    }

    falseDetect();
    setTimeout(falseDetect, 20);
    setTimeout(falseDetect, 40);
    const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
    await db.runAsync("INSERT INTO practice_attempts (time, date, synced) VALUES (?,?,0)", [-1, currDateTime])
  };
  const handleNoReaction = () => {
    setReactionTime(null);
    stopAccelerometer();
    stopElapsedTime();
    setStatus(6);
  };
  // --- Handlers For Stop Race ---

  // --- Auxiliar For Start Race ---
  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(4);
    Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const movementMagnitude = Math.sqrt(x * x + y * y + z * z);
      if (movementMagnitude > 1.5 && startTimeRef.current) {
        handleReaction();
      } else if (movementMagnitude > 1.5 && !startTimeRef.current) {
        handleFalseStart();
      }
    });
  };
  const stopAccelerometer = () => {
    Accelerometer.removeAllListeners();
  };
  const startElapsedTime = () => {
    setElapsedTime(0);
    const start = Date.now();
    const updateElapsedTime = () => {
      setElapsedTime(Date.now() - start);
      intervalIdRef.current = requestAnimationFrame(updateElapsedTime);
    };
    updateElapsedTime();
    timeoutNoReactionRef.current = setTimeout(() => {handleNoReaction();}, 2000);
  };
  const stopElapsedTime = () => {
    if (intervalIdRef.current) cancelAnimationFrame(intervalIdRef.current);
    if (timeoutNoReactionRef.current) clearTimeout(timeoutNoReactionRef.current);
  };
  // --- Auxiliar For Start Race ---

  const startRace = async () => {
    setStatus(1);

    const files1 = [
      require("../assets/sounds/English1_01.mp3"),
      require("../assets/sounds/English1_02.mp3"),
      require("../assets/sounds/English1_03.mp3"),
      require("../assets/sounds/English1_04.mp3"),
      require("../assets/sounds/Spanish1_01.mp3"),
      require("../assets/sounds/Spanish1_02.mp3"),
      require("../assets/sounds/Spanish1_03.mp3"),
    ];
    const files2 = [
      require("../assets/sounds/English2_01.mp3"),
      require("../assets/sounds/English2_02.mp3"),
      require("../assets/sounds/English2_03.mp3"),
      require("../assets/sounds/English2_04.mp3"),
      require("../assets/sounds/Spanish2_01.mp3"),
      require("../assets/sounds/Spanish2_02.mp3"),
      require("../assets/sounds/Spanish2_03.mp3"),
    ];

    await playSound(files1[(startConfig.voice.lenguage == 1 ? 0 : 4) + startConfig.voice.variant - 1]);
    const onYourMarksRandomTime = Math.random() * (startConfig.times.onYourMarksTimeMax * 1000 - startConfig.times.onYourMarksTimeMin * 1000) + startConfig.times.onYourMarksTimeMin * 1000;

    timeoutRaceRef.current = setTimeout(async () => {
      setStatus(2);
      await playSound(files2[(startConfig.voice.lenguage == 1 ? 0 : 4) + startConfig.voice.variant - 1]);
      startAccelerometer();
      setRandomTime = Math.random() * (startConfig.times.setTimeMax * 1000 - startConfig.times.setTimeMin * 1000) + startConfig.times.setTimeMin * 1000;

      timeoutSetRef.current = setTimeout(async () => {
        await playSound(require('../assets/sounds/shot.mp3'));

        timeoutShotRef.current = setTimeout(() => {
            setStatus(3);
            startTimeRef.current = Date.now(); 
            startElapsedTime();
        }, 20);
      }, setRandomTime); 
    }, onYourMarksRandomTime);
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (!blockInteractionRef.current && (status == 2 || status == 3)){if (status === 3) handleReaction();else handleFalseStart();} else if (!blockInteractionRef.current && status != 1)startRace();}}>
      <View style={[styles.mainContainer, {backgroundColor: status == 1 || status == 2 || status == 4 ? COLORS.black_01 : status == 3 ? COLORS.blue_01 : status == 5 ? COLORS.red_01 : COLORS.white_02}]}>
        {(status == 4 || status == 5 || status == 6) &&
          <TouchableOpacity style={[styles.backButton, {backgroundColor: status == 4 ? COLORS.blue_01 : COLORS.black_01, top: insets.top + 12}]} onPress={() => navigation.navigate("PracticeScreen")}>
            <Icon name="arrow-left" color={status == 4 ? COLORS.black_01 : COLORS.white_01} size={SIZES.i3}/>
          </TouchableOpacity>
        }
        <View style={styles.container}>
          <Text style={status == 1 || status == 2 ? styles.mainText01 : status == 3 ? styles.mainText02 : status == 4 ? styles.mainText03 : styles.mainText04}>
            {status == 1
              ? "¡En sus marcas!"
              : status == 2
              ? "¡Listos!"
              : status == 3
              ? "¡Disparo!"
              : status == 4
              ? "Reaccion Detectada"
              : status == 5
              ? "Salida Falsa!"
              : "No Reaccionaste!"}
          </Text>
          {status == 4 && (
            <Text style={styles.reactionTime}>{reactionTime}ms</Text>
          )}
          {status == 3 && (
            <Text style={styles.elapsedTime}>Tiempo transcurrido: {elapsedTime.toFixed(0)}ms</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  container: {
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  mainText01: {
    fontFamily: "Inter_black",
    color: COLORS.white_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },
  mainText02: {
    fontFamily: "Inter_black",
    lineHeight: SIZES.f1 + 8,
    fontSize: SIZES.f1 + 8,
    color: COLORS.black_01,
  },
  mainText03: {
    fontFamily: "Inter_bold",
    color: COLORS.white_01,
    lineHeight: SIZES.f2,
    fontSize: SIZES.f2,
  },
  mainText04: {
    fontFamily: "Inter_black",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },
  reactionTime: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    lineHeight: 56,
    marginTop: 8,
    fontSize: 56,
  },
  elapsedTime: {
    fontFamily: "Inter_medium",
    color: COLORS.black_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    zIndex: 1000,
    height: 48,
    width: 48,
    left: 24,
  },
});