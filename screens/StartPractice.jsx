import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect, useRef } from "react";
import { getData } from "../constants/dataExchange.jsx";
import { COLORS, SIZES } from "../constants/theme.js";
import { Accelerometer } from "expo-sensors";
import * as SQLite from "expo-sqlite";
import Icon from "../constants/Icon.jsx";
import { Audio } from "expo-av";

export default function StartPractice() {
  const [reactionTime, setReactionTime] = useState(null);
  const [isCounting, setIsCounting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [isFalse, setIsFalse] = useState(false);
  const [status, setStatus] = useState(0);
  const [config, setConfig] = useState({});
  const db = SQLite.useSQLiteContext();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const intervalIdRef = useRef(null); 
  const startTimeRef = useRef(null); 

  const timeoutRaceRef = useRef(null); 
  const timeoutShotRef = useRef(null);
  const timeoutSetRef = useRef(null); 
  const navigation = useNavigation();

  const [amountAttemps, setAmountAttemps] = useState(0);
  const [aspectFalseAttemps, setAspectFalseAttemps] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getData("practiceConfig");

        if (data == undefined) {
          await storeData("practiceConfig", JSON.stringify(defaultConfig));
        } else {
          const parsedConfig = JSON.parse(data);
          setConfig(parsedConfig);
        }
      } catch (e) {
        console.log("Error al obtener los datos", e);
        setConfig({
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
        });
      }
    };

    const getStats = async () => {
      const totalAmountAttemps = await db.getFirstAsync(`SELECT count(id) as "amount" FROM practice_attempts`,);
      const notFalseAmountAttemps = await db.getFirstAsync(`SELECT COUNT(id) as "notFalseCount" FROM practice_attempts WHERE time != -1`);
      const percentageValidStarts = totalAmountAttemps.amount > 0 ? (notFalseAmountAttemps.notFalseCount / totalAmountAttemps.amount) * 100 : 0;
      setAmountAttemps(totalAmountAttemps.amount);
      setAspectFalseAttemps(parseInt(percentageValidStarts));
    }

    fetchData();
    getStats();
  }, [isFocused, isRacing]);

  useEffect(() => {
    return () => {
      Accelerometer.removeAllListeners();
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, []);

  const playSound = async (soundFile) => {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  };

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
    intervalIdRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1);
  };

  const stopElapsedTime = () => {
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
  };

  const startRace = async () => {
    setStatus(1);
    setIsFalse(false);
    setIsRacing(true);
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

    await playSound(files1[(config.voice.lenguage == 1 ? 0 : 4) + config.voice.variant - 1]);
    const onYourMarksRandomTime = Math.random() * (config.times.onYourMarksTimeMax * 1000 - config.times.onYourMarksTimeMin * 1000) + config.times.onYourMarksTimeMin * 1000;

    timeoutRaceRef.current = setTimeout(async () => {
      setStatus(2);
      await playSound(files2[(config.voice.lenguage == 1 ? 0 : 4) + config.voice.variant - 1]);
      startAccelerometer();
      setRandomTime = Math.random() * (config.times.setTimeMax * 1000 - config.times.setTimeMin * 1000) + config.times.setTimeMin * 1000;

      timeoutSetRef.current = setTimeout(async () => {
        await playSound(require('../assets/sounds/shot.mp3'));

        timeoutShotRef.current = setTimeout(() => {
          setStatus(3);
          setIsCounting(true);
          startTimeRef.current = Date.now(); 
          startElapsedTime();
        }, 40);
      }, setRandomTime); 
    }, onYourMarksRandomTime);
  };

  const handleReaction = async () => {
    if (startTimeRef.current) {
      const reactionDuration = Date.now() - startTimeRef.current;
      setReactionTime(reactionDuration);
      setIsCounting(false);
      stopAccelerometer();
      setStatus(4);
      setIsRacing(false);
      stopElapsedTime();
      startTimeRef.current = null;
      const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
      await db.runAsync("INSERT INTO practice_attempts (time, date) VALUES (?,?)", [reactionDuration, currDateTime])
    }
  };

  const handleFalseStart = async () => {
    startTimeRef.current = null;  
    setStatus(5);
    setIsCounting(false);
    stopAccelerometer();
    setIsRacing(false);
    stopElapsedTime();
    setIsFalse(true);

    if (timeoutRaceRef.current) clearTimeout(timeoutRaceRef.current);
    if (timeoutShotRef.current) clearTimeout(timeoutShotRef.current);
    if (timeoutSetRef.current) clearTimeout(timeoutSetRef.current);

    const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
    await db.runAsync("INSERT INTO practice_attempts (time, date) VALUES (?,?)", [-1, currDateTime])
  };

  const handleBackToStart = () => {
    setReactionTime(null);
    setIsFalse(false);
    setStatus(0);
  };

  useEffect(() => {
    if(status == 0) setIsFalse(false);
  }, [status])
 
  return (
    <TouchableWithoutFeedback onPress={() => { if (isRacing) { if (status === 3) handleReaction(); else handleFalseStart(); } else startRace(); }}>
      <View style={[styles.container, { backgroundColor: isFalse ? COLORS.red_01 : isCounting ? COLORS.blue_01 : COLORS.black_02, }, ]}>

        {status == 0 && (<View style={[styles.topContainer, {paddingTop: insets.top + 18}]}>
            <TouchableOpacity style={[styles.statsBtn, {top: insets.top + 8}]} onPress={() => navigation.navigate("PracticeStatsScreen")}>
                <View style={{transform: "rotate(-45deg)"}}>
                    <Icon name="arrow-right" size={SIZES.i3}/>
                </View>
            </TouchableOpacity>
            <View>
                <Text style={styles.title}>Pruebas Realizadas</Text>
                <Text style={styles.subTitle}>/athletic's app</Text>
            </View>
            <View style={styles.attempsContainer}>
                <Text style={styles.attemps}>{amountAttemps}</Text>
                <View style={styles.flag}>
                    <Icon name="flag" color={COLORS.black_01} size={SIZES.i1}/>
                </View>
            </View>
            <Text style={styles.falseStarts}>El <Text style={styles.falseStartsBold}>{aspectFalseAttemps}%</Text> de las pruebas fueron validas</Text>
        </View>)}

        {(status == 4 || status == 5) && (
          <TouchableOpacity style={[styles.backButton, {backgroundColor: isFalse ? COLORS.white_01 : COLORS.purple_01,top: insets.top}]} onPress={handleBackToStart}>
            <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3}/>
          </TouchableOpacity>
        )}

        <View style={styles.messagesContainer}>
          <Text style={styles.mainText}>
            {status == 0
              ? "Esperando inicio..."
              : status == 1
              ? "¡En sus marcas!"
              : status == 2
              ? "¡Listos!"
              : status == 3
              ? "¡Disparo!"
              : status == 4
              ? "Reaccion Detectada"
              : "Salida Falsa!"
            }
          </Text>
          {status == 0 && <Text style={styles.taskMsg}>Mueve o toca la pantalla luego de que{"\n"}suene el disparo!</Text>}
          {status == 4 && <Text style={styles.reactionTime}>{reactionTime}ms</Text>}
        </View>
        {isCounting && (
          <Text style={styles.mainText}>
            Tiempo transcurrido: {(elapsedTime / 1000).toFixed(1)}s
          </Text>
        )}
        {!isRacing && status == 0 && (
          <View style={styles.bottomContainer}>
            <Text style={styles.pressToStart}>Pulsa la pantalla para iniciar</Text>
            <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate("PracticeConfigScreen")}>
              <Text style={styles.configBtnText}>CONFIGURACION</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  topContainer: {
    backgroundColor: COLORS.blue_01,
    paddingHorizontal: 32,
    position: "absolute",
    paddingBottom: 32,
    borderBottomRightRadius: 48,
    width: "100%",
    left: 0,
    top: 0,
  },
  statsBtn: {
    backgroundColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    zIndex: 1000,
    height: 48,
    width: 48,
    right: 32,
  },
  title: {
    color: COLORS.black_01,
    fontSize: SIZES.f3,
    fontWeight: "600",
  },
  subTitle: {
    color: COLORS.black_01,
    fontSize: SIZES.f5,
    fontWeight: "500",
  },
  attempsContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    flexDirection: "row",
    paddingLeft: 32,
    marginTop: 32,
  },
  attemps: {
    color: COLORS.black_01,
    fontWeight: "800",
    fontSize: 100,
    margin: 0,
  },
  flag: {
    marginBottom: 22,
  },
  falseStarts: {
    color: COLORS.black_01,
    fontSize: SIZES.f5,
    fontWeight: "500",
  },
  falseStartsBold: {
    fontWeight: "900",
  },
  mainText: {
    color: COLORS.white_01,
    fontSize: SIZES.f1,
    fontWeight: "bold",
  },
  bottomContainer: {
    paddingHorizontal: 32,
    position: "absolute",
    width: "100%",
    bottom: 64,
  },
  pressToStart: {
    color: COLORS.blue_01,
    fontSize: SIZES.f4,
    marginBottom: 8,
  },
  configBtn: {
    borderColor: COLORS.blue_01,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 6,
    borderWidth: 2,
    width: "100%",
  },
  configBtnText: {
    color: COLORS.blue_01,
    fontSize: SIZES.f4,
    fontWeight: "bold",
    margin: 0,
  },
  messagesContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  taskMsg: {
    color: COLORS.gray_01,
    textAlign: "center",
    fontSize: SIZES.f5,
  },
  reactionTime: {
    color: COLORS.blue_01,
    fontWeight: "800",
    fontSize: 56,
    marginTop: -4,
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
    top: 32,
  }
});