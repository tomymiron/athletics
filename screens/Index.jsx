// import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import React, { useState, useEffect, useRef } from "react";
// import defaultConfig from "../assets/defaultSettings.js"
// import { COLORS, SIZES } from "../constants/theme.js";
// import { Accelerometer } from "expo-sensors";
// import * as SQLite from "expo-sqlite";
// import Icon from "../constants/Icon.jsx";
// import { Audio } from "expo-av";


// export default function StartPractice() {
//   const [reactionTime, setReactionTime] = useState(null);
//   const [isCounting, setIsCounting] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [isRacing, setIsRacing] = useState(false);
//   const [isFalse, setIsFalse] = useState(false);
//   const [status, setStatus] = useState(0);
//   const [config, setConfig] = useState({});
//   const db = SQLite.useSQLiteContext();
//   const insets = useSafeAreaInsets();
//   const isFocused = useIsFocused();

//   const intervalIdRef = useRef(null); 
//   const startTimeRef = useRef(null); 

//   const timeoutRaceRef = useRef(null); 
//   const timeoutShotRef = useRef(null);
//   const timeoutSetRef = useRef(null); 
//   const navigation = useNavigation();

//   const [amountAttemps, setAmountAttemps] = useState(0);
//   const [aspectFalseAttemps, setAspectFalseAttemps] = useState(100);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const result = await db.getFirstAsync("SELECT value FROM practice_config WHERE key = 'practiceConfig';");
//         const data = result ? result.value : null;

//         if (data == null) {
//           await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(defaultConfig)]);
//         } else {
//           const parsedConfig = JSON.parse(data);
//           setConfig(parsedConfig);
//         }
//       } catch (e) {
//         console.log("Error al obtener los datos", e);
//         setConfig({
//           voice: {
//             lenguage: 1,
//             variant: 1,
//           },
//           times: {
//             onYourMarksTimeMin: 2,
//             onYourMarksTimeMax: 5,
//             setTimeMin: 1,
//             setTimeMax: 3,
//           },
//         });
//       }
//     };

//     const getStats = async () => {
//       const totalAmountAttemps = await db.getFirstAsync(`SELECT count(id) as "amount" FROM practice_attempts`,);
//       const notFalseAmountAttemps = await db.getFirstAsync(`SELECT COUNT(id) as "notFalseCount" FROM practice_attempts WHERE time != -1`);
//       const percentageValidStarts = totalAmountAttemps.amount > 0 ? (notFalseAmountAttemps.notFalseCount / totalAmountAttemps.amount) * 100 : 0;
//       setAmountAttemps(totalAmountAttemps.amount);
//       setAspectFalseAttemps(parseInt(percentageValidStarts));
//     }

//     fetchData();
//     getStats();
//   }, [isFocused, isRacing]);

//   useEffect(() => {
//     return () => {
//       Accelerometer.removeAllListeners();
//       if (intervalIdRef.current) clearInterval(intervalIdRef.current);
//     };
//   }, []);

//   const playSound = async (soundFile) => {
//     const { sound } = await Audio.Sound.createAsync(soundFile);
//     await sound.playAsync();
//   };

//   const startAccelerometer = () => {
//     Accelerometer.setUpdateInterval(4);
//     Accelerometer.addListener(accelerometerData => {
//       const { x, y, z } = accelerometerData;
//       const movementMagnitude = Math.sqrt(x * x + y * y + z * z);
//       if (movementMagnitude > 1.5 && startTimeRef.current) {
//         handleReaction();
//       } else if (movementMagnitude > 1.5 && !startTimeRef.current) {
//         handleFalseStart();
//       }
//     });
//   };

//   const stopAccelerometer = () => {
//     Accelerometer.removeAllListeners();
//   };

//   const startElapsedTime = () => {
//     setElapsedTime(0);
//     intervalIdRef.current = setInterval(() => {
//       setElapsedTime(prevTime => prevTime + 1);
//     }, 1);
//   };

//   const stopElapsedTime = () => {
//     if (intervalIdRef.current) clearInterval(intervalIdRef.current);
//   };

//   const startRace = async () => {
//     setStatus(1);
//     setIsFalse(false);
//     setIsRacing(true);
//     const files1 = [
//       require("../assets/sounds/English1_01.mp3"),
//       require("../assets/sounds/English1_02.mp3"),
//       require("../assets/sounds/English1_03.mp3"),
//       require("../assets/sounds/English1_04.mp3"),
//       require("../assets/sounds/Spanish1_01.mp3"),
//       require("../assets/sounds/Spanish1_02.mp3"),
//       require("../assets/sounds/Spanish1_03.mp3"),
//     ];
//     const files2 = [
//       require("../assets/sounds/English2_01.mp3"),
//       require("../assets/sounds/English2_02.mp3"),
//       require("../assets/sounds/English2_03.mp3"),
//       require("../assets/sounds/English2_04.mp3"),
//       require("../assets/sounds/Spanish2_01.mp3"),
//       require("../assets/sounds/Spanish2_02.mp3"),
//       require("../assets/sounds/Spanish2_03.mp3"),
//     ];

//     await playSound(files1[(config.voice.lenguage == 1 ? 0 : 4) + config.voice.variant - 1]);
//     const onYourMarksRandomTime = Math.random() * (config.times.onYourMarksTimeMax * 1000 - config.times.onYourMarksTimeMin * 1000) + config.times.onYourMarksTimeMin * 1000;

//     timeoutRaceRef.current = setTimeout(async () => {
//       setStatus(2);
//       await playSound(files2[(config.voice.lenguage == 1 ? 0 : 4) + config.voice.variant - 1]);
//       startAccelerometer();
//       setRandomTime = Math.random() * (config.times.setTimeMax * 1000 - config.times.setTimeMin * 1000) + config.times.setTimeMin * 1000;

//       timeoutSetRef.current = setTimeout(async () => {
//         await playSound(require('../assets/sounds/shot.mp3'));

//         timeoutShotRef.current = setTimeout(() => {
//           setStatus(3);
//           setIsCounting(true);
//           startTimeRef.current = Date.now(); 
//           startElapsedTime();
//         }, 40);
//       }, setRandomTime); 
//     }, onYourMarksRandomTime);
//   };

//   const handleReaction = async () => {
//     if (startTimeRef.current) {
//       const reactionDuration = Date.now() - startTimeRef.current;
//       setReactionTime(reactionDuration);
//       setIsCounting(false);
//       stopAccelerometer();
//       setStatus(4);
//       setIsRacing(false);
//       stopElapsedTime();
//       startTimeRef.current = null;
//       const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
//       await db.runAsync("INSERT INTO practice_attempts (time, date) VALUES (?,?)", [reactionDuration, currDateTime])
//     }
//   };

//   const handleFalseStart = async () => {
//     startTimeRef.current = null;  
//     setStatus(5);
//     setIsCounting(false);
//     stopAccelerometer();
//     setIsRacing(false);
//     stopElapsedTime();
//     setIsFalse(true);

//     if (timeoutRaceRef.current) clearTimeout(timeoutRaceRef.current);
//     if (timeoutShotRef.current) clearTimeout(timeoutShotRef.current);
//     if (timeoutSetRef.current) clearTimeout(timeoutSetRef.current);

//     const currDateTime = new Date().toISOString().split("T")[0] + " " + new Date().toISOString().split("T")[1].slice(0, 8);
//     await db.runAsync("INSERT INTO practice_attempts (time, date) VALUES (?,?)", [-1, currDateTime])
//   };

//   const handleBackToStart = () => {
//     setReactionTime(null);
//     setIsFalse(false);
//     setStatus(0);
//   };

//   useEffect(() => {
//     if(status == 0) setIsFalse(false);
//   }, [status])
 
//   return (
//     <TouchableWithoutFeedback onPress={() => { if (isRacing) { if (status === 3) handleReaction(); else handleFalseStart(); } else startRace(); }}>
//       <View style={[styles.container, { backgroundColor: isFalse ? COLORS.red_01 : isCounting ? COLORS.blue_01 : COLORS.black_02, }, ]}>

//         {status == 0 && (<View style={[styles.topContainer, {paddingTop: insets.top + 18}]}>
//             <TouchableOpacity style={[styles.statsBtn, {top: insets.top + 8}]} onPress={() => navigation.navigate("PracticeStatsScreen")}>
//                 <View style={{transform: "rotate(-45deg)"}}>
//                     <Icon name="arrow-right" size={SIZES.i3}/>
//                 </View>
//             </TouchableOpacity>
//             <View>
//                 <Text style={styles.title}>Pruebas Realizadas</Text>
//                 <Text style={styles.subTitle}>/athletic's app</Text>
//             </View>
//             <View style={styles.attempsContainer}>
//                 <Text style={styles.attemps}>{amountAttemps}</Text>
//                 <View style={styles.flag}>
//                     <Icon name="flag" color={COLORS.black_01} size={SIZES.i1}/>
//                 </View>
//             </View>
//             <Text style={styles.falseStarts}>El <Text style={styles.falseStartsBold}>{aspectFalseAttemps}%</Text> de las pruebas fueron validas</Text>
//         </View>)}

//         {(status == 4 || status == 5) && (
//           <TouchableOpacity style={[styles.backButton, {backgroundColor: isFalse ? COLORS.white_01 : COLORS.purple_01,top: insets.top}]} onPress={handleBackToStart}>
//             <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3}/>
//           </TouchableOpacity>
//         )}

//         <View style={styles.messagesContainer}>
//           <Text style={styles.mainText}>
//             {status == 0
//               ? "Esperando inicio..."
//               : status == 1
//               ? "¡En sus marcas!"
//               : status == 2
//               ? "¡Listos!"
//               : status == 3
//               ? "¡Disparo!"
//               : status == 4
//               ? "Reaccion Detectada"
//               : "Salida Falsa!"
//             }
//           </Text>
//           {status == 0 && <Text style={styles.taskMsg}>Mueve o toca la pantalla luego de que{"\n"}suene el disparo!</Text>}
//           {status == 4 && <Text style={styles.reactionTime}>{reactionTime}ms</Text>}
//         </View>
//         {isCounting && (
//           <Text style={styles.mainText}>
//             Tiempo transcurrido: {(elapsedTime / 1000).toFixed(1)}s
//           </Text>
//         )}
//         {!isRacing && status == 0 && (
//           <View style={styles.bottomContainer}>
//             <Text style={styles.pressToStart}>Pulsa la pantalla para iniciar</Text>
//             <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate("PracticeConfigScreen")}>
//               <Text style={styles.configBtnText}>CONFIGURACION</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.black_01,
//     justifyContent: "center",
//     alignItems: "center",
//     flex: 1,
//   },

//   topContainer: {
//     backgroundColor: COLORS.blue_01,
//     paddingHorizontal: 32,
//     position: "absolute",
//     paddingBottom: 32,
//     borderBottomRightRadius: 48,
//     width: "100%",
//     left: 0,
//     top: 0,
//   },
//   statsBtn: {
//     backgroundColor: COLORS.black_01,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     borderRadius: 24,
//     zIndex: 1000,
//     height: 48,
//     width: 48,
//     right: 32,
//   },
//   title: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f3,
//     fontWeight: "600",
//   },
//   subTitle: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f5,
//     fontWeight: "500",
//   },
//   attempsContainer: {
//     justifyContent: "center",
//     alignItems: "flex-end",
//     flexDirection: "row",
//     paddingLeft: 32,
//     marginTop: 32,
//   },
//   attemps: {
//     color: COLORS.black_01,
//     fontWeight: "800",
//     fontSize: 100,
//     margin: 0,
//   },
//   flag: {
//     marginBottom: 22,
//   },
//   falseStarts: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f5,
//     fontWeight: "500",
//   },
//   falseStartsBold: {
//     fontWeight: "900",
//   },
//   mainText: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f1,
//     fontWeight: "bold",
//   },
//   bottomContainer: {
//     paddingHorizontal: 32,
//     position: "absolute",
//     width: "100%",
//     bottom: 64,
//   },
//   pressToStart: {
//     color: COLORS.blue_01,
//     fontSize: SIZES.f4,
//     marginBottom: 8,
//   },
//   configBtn: {
//     borderColor: COLORS.blue_01,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 16,
//     borderRadius: 6,
//     borderWidth: 2,
//     width: "100%",
//   },
//   configBtnText: {
//     color: COLORS.blue_01,
//     fontSize: SIZES.f4,
//     fontWeight: "bold",
//     margin: 0,
//   },
//   messagesContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   taskMsg: {
//     color: COLORS.gray_01,
//     textAlign: "center",
//     fontSize: SIZES.f5,
//   },
//   reactionTime: {
//     color: COLORS.blue_01,
//     fontWeight: "800",
//     fontSize: 56,
//     marginTop: -4,
//   },
//   backButton: {
//     backgroundColor: COLORS.purple_01,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     borderRadius: 24,
//     height: 48,
//     width: 48,
//     left: 32,
//     top: 32,
//   }
// });


// import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useNavigation } from "@react-navigation/native";
// import SelectInput from "../components/SelectInput";
// import Slider from '@react-native-community/slider';
// import React, { useState, useEffect } from "react";
// import { COLORS, SIZES } from "../constants/theme";
// import * as SQLite from "expo-sqlite";
// import Icon from "../constants/Icon";

// const defaultConfig = {
//   voice: {
//     lenguage: 1,
//     variant: 1,
//   },
//   times: {
//     onYourMarksTimeMin: 2,
//     onYourMarksTimeMax: 5,
//     setTimeMin: 1,
//     setTimeMax: 3,
//   },
// };

// export default function StartPracticeConfig() {
//   const [onYourMarksTimeMin, setOnYourMarksTimeMin] = useState(defaultConfig.times.onYourMarksTimeMin);
//   const [onYourMarksTimeMax, setOnYourMarksTimeMax] = useState(defaultConfig.times.onYourMarksTimeMax);
//   const [setTimeMin, setSetTimeMin] = useState(defaultConfig.times.setTimeMin);
//   const [setTimeMax, setSetTimeMax] = useState(defaultConfig.times.setTimeMax);
//   const [lenguage, setLenguage] = useState(defaultConfig.voice.lenguage);
//   const [variant, setVariant] = useState(defaultConfig.voice.variant);
//   const db = SQLite.useSQLiteContext();
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   useEffect(() => {
//     if (onYourMarksTimeMax < onYourMarksTimeMin) {
//       setOnYourMarksTimeMax(onYourMarksTimeMin);
//     }
//   }, [onYourMarksTimeMax, onYourMarksTimeMin]);

//   useEffect(() => {
//     if (setTimeMax < setTimeMin) {
//       setSetTimeMax(setTimeMin);
//     }
//   }, [setTimeMin, setTimeMax]);

//   const lenguageOptions = [
//     { label: "English", value: 1 },
//     { label: "Español", value: 2 },
//   ];
//   const englishVoiceVariant = [
//     { label: "Voice 01", value: 1 },
//     { label: "Voice 02", value: 2 },
//     { label: "Voice 03", value: 3 },
//     { label: "Voice 04", value: 4 },
//   ];
//   const spanishVoiceVariant = [
//     { label: "Voz 01", value: 1 },
//     { label: "Voz 02", value: 2 },
//     { label: "Voz 03", value: 3 },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const result = await db.getFirstAsync("SELECT value FROM practice_config WHERE key = 'practiceConfig';");
//         const data = result ? result.value : null;

//         if (data == null) {
//           await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(defaultConfig)]);
//         } else {
//           const parsedConfig = JSON.parse(data);
//           updateConfig(parsedConfig);
//         }
//       } catch (e) {
//         console.log("Error al obtener los datos", e);
//       }
//     };

//     const updateConfig = (config) => {
//       setOnYourMarksTimeMax(config?.times.onYourMarksTimeMax);
//       setOnYourMarksTimeMin(config?.times.onYourMarksTimeMin);
//       setSetTimeMin(config?.times.setTimeMin);
//       setSetTimeMax(config?.times.setTimeMax);
//       setLenguage(config?.voice.lenguage);
//       setVariant(config?.voice.variant);
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     const saveConfig = async () => {
//       const config = {
//         voice: {
//           lenguage: lenguage,
//           variant: variant,
//         },
//         times: {
//           onYourMarksTimeMin: onYourMarksTimeMin,
//           onYourMarksTimeMax: onYourMarksTimeMax,
//           setTimeMin: setTimeMin,
//           setTimeMax: setTimeMax,
//         },
//       };
//       await db.runAsync("UPDATE practice_config SET value = ? WHERE key = 'practiceConfig';", [JSON.stringify(config)]);
//     };

//     saveConfig();
//   }, [onYourMarksTimeMax, onYourMarksTimeMin, setTimeMax, setTimeMin, lenguage, variant]);

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={() => navigation.navigate("PracticeScreen")} >
//         <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3} />
//       </TouchableOpacity>

//       <Text style={[styles.screenTitle, {marginTop: insets.top + 72}]}>Configuracion</Text>

//       <View style={[styles.boxContainer, {zIndex: 1000}]}>
//         <Text style={styles.boxTitle}>Voz de partida</Text>
//         <View style={{ zIndex: 1000 }}>
//           <SelectInput
//             onSelectItem={() => setVariant(1)}
//             itemsUsed={lenguageOptions}
//             setValue={setLenguage}
//             placeholder="Lenguaje"
//             value={lenguage}
//             lightTheme
//           />
//         </View>
//         <View style={{ zIndex: -1 }}>
//           <SelectInput
//             itemsUsed={lenguage == 1 ? englishVoiceVariant : spanishVoiceVariant}
//             style={{ marginTop: 4 }}
//             setValue={setVariant}
//             placeholder="Variante"
//             value={variant}
//             lightTheme
//           />
//         </View>
//       </View>

//       <View style={styles.boxContainer}>
//         <Text style={styles.boxTitle}>Tiempo en Preparacion</Text>
//         <View style={styles.subBoxContainer}>
//           <View>
//             <Slider
//               style={{width: Dimensions.get("screen").width * .8, height: 40}}
//               onValueChange={(value) => setOnYourMarksTimeMin(value)}
//               maximumTrackTintColor={COLORS.black_01}
//               minimumTrackTintColor={COLORS.blue_01}
//               value={onYourMarksTimeMin}
//               maximumValue={10}
//               minimumValue={1}
//               step={0.5}
//             />
//             <View style={styles.timeContainer}>
//               <Text style={styles.time}>1s</Text>
//               <Text style={styles.time}>10s</Text>
//             </View>
//             <Text style={styles.min}>MINIMO <Text style={styles.bold}>{onYourMarksTimeMin}s</Text>
//             </Text>
//           </View>
//         </View>

//         <View style={styles.subBoxContainer}>
//           <View>
//             <View style={styles.timeContainer2}>
//               <Text style={styles.time}>{onYourMarksTimeMin}s</Text>
//               <Text style={styles.time}>15s</Text>
//             </View>
//             <Text style={styles.max}>MAXIMO <Text style={styles.bold}>{onYourMarksTimeMax}s</Text></Text>
//             <Slider
//               style={{width: Dimensions.get("screen").width * .8, height: 40}}
//               onValueChange={(value) => setOnYourMarksTimeMax(value)}
//               maximumTrackTintColor={COLORS.black_01}
//               minimumTrackTintColor={COLORS.blue_01}
//               minimumValue={onYourMarksTimeMin}
//               value={onYourMarksTimeMax}
//               maximumValue={15}
//               step={0.5}
//             />
//           </View>
//         </View>
//       </View>

//       <View style={styles.boxContainer}>
//         <Text style={styles.boxTitle}>Tiempo en Listos</Text>
//         <View style={styles.subBoxContainer}>
//           <View>
//             <Slider
//               style={{width: Dimensions.get("screen").width * .8, height: 40}}
//               onValueChange={(value) => setSetTimeMin(value)}
//               maximumTrackTintColor={COLORS.black_01}
//               minimumTrackTintColor={COLORS.blue_01}
//               value={setTimeMin}
//               maximumValue={3}
//               minimumValue={1}
//               step={0.5}
//             />
//             <View style={styles.timeContainer}>
//               <Text style={styles.time}>1s</Text>
//               <Text style={styles.time}>3s</Text>
//             </View>
//             <Text style={styles.min}>MINIMO <Text style={styles.bold}>{setTimeMin}s</Text>
//             </Text>
//           </View>
//         </View>

//         <View style={styles.subBoxContainer}>
//           <View>
//             <View style={styles.timeContainer2}>
//               <Text style={styles.time}>{setTimeMin}s</Text>
//               <Text style={styles.time}>5s</Text>
//             </View>
//             <Text style={styles.max}>MAXIMO <Text style={styles.bold}>{setTimeMax}s</Text></Text>
//             <Slider
//               style={{width: Dimensions.get("screen").width * .8, height: 40}}
//               onValueChange={(value) => setSetTimeMax(value)}
//               maximumTrackTintColor={COLORS.black_01}
//               minimumTrackTintColor={COLORS.blue_01}
//               minimumValue={setTimeMin}
//               value={setTimeMax}
//               maximumValue={5}
//               step={0.5}
//             />
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.black_01,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     flex: 1,
//   },
//   backButton: {
//     backgroundColor: COLORS.purple_01,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     borderRadius: 24,
//     height: 48,
//     width: 48,
//     left: 32,
//   },
//   screenTitle: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f2,
//     fontWeight: "700",
//     paddingLeft: 24,
//     width: "100%",
//   },
//   boxContainer: {
//     backgroundColor: COLORS.black_02,
//     borderRadius: 12,
//     marginTop: 6,
//     width: "90%",
//     padding: 24,
//     zIndex: 100,
//   },
//   boxTitle: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f4,
//     fontWeight: "500",
//     marginBottom: 8,
//     width: "100%",
//   },
//   subBoxContainer: {
//     justifyContent: "flex-start",
//     alignItems: "center",
//     width: "100%",
//   },
//   timeContainer: {
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     alignItems: "flex-end",
//     flexDirection: "row",
//     marginTop: 8,
//   },
//   timeContainer2: {
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     alignItems: "flex-end",
//     flexDirection: "row",
//     marginBottom: 8,
//   },
//   time: {
//     color: COLORS.white_01,
//   },
//   min: {
//     color: COLORS.white_01,
//     maxHeight: SIZES.f6,
//     textAlign: "center",
//     fontSize: SIZES.f7,
//     fontWeight: "400",
//     marginTop: -14,
//     flex: 1,
//   },
//   max: {
//     color: COLORS.white_01,
//     maxHeight: SIZES.f6,
//     textAlign: "center",
//     fontSize: SIZES.f7,
//     fontWeight: "400",
//     marginBottom: 8,
//     marginTop: -22,
//     flex: 1,
//   },
//   bold: {
//     fontWeight: "700"
//   },
// });


// import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { COLORS, SIZES } from "../constants/theme.js";
// import React, { useEffect, useState } from "react";
// import { useSQLiteContext } from "expo-sqlite";
// import Icon from "../constants/Icon.jsx";

// export default function StartPracticeStats() {
//   const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [averageAttemps, setAverageAttemps] = useState(0);
//   const [amountAttemps, setAmountAttemps] = useState(0);
//   const [bestAttemp, setBestAttemp] = useState(0);
//   const [attemps, setAttemps] = useState([]);
//   const insets = useSafeAreaInsets();
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const db = useSQLiteContext();

//   const getStats = async () => {
//     const monthlyAttemps = await db.getAllAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? order by date DESC`, [month.toString().padStart(2, '0'), year.toString()]);
//     const monthlyBestAttemp = await db.getFirstAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time > 100 order by time ASC`, [month.toString().padStart(2, '0'), year.toString()]);
//     const monthlyAmountAttemps = await db.getAllAsync(`SELECT count(id) as "amount" FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?`, [month.toString().padStart(2, '0'), year.toString()]);

//     setAttemps(monthlyAttemps);
//     if(monthlyBestAttemp != null){
//       const formattedDate = (() => { const d = new Date(monthlyBestAttemp.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} -- ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`; })();
//       setBestAttemp({time: monthlyBestAttemp.time, date: formattedDate})
//     }else setBestAttemp(-1);
//     setAmountAttemps(monthlyAmountAttemps[0].amount)

//     const totalTimeResult = await db.getFirstAsync(`SELECT SUM(time) as total_time FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time >= 100`, [month.toString().padStart(2, '0'), year.toString()]);
//     const countResult = await db.getFirstAsync(`SELECT COUNT(id) as count FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time >= 100`, [month.toString().padStart(2, '0'), year.toString()]);
      
//     const averageTime = countResult.count > 0 ? totalTimeResult.total_time / countResult.count : 0;
//     setAverageAttemps(parseInt(averageTime));
//   }

//   useEffect(() => {
//     getStats();
//   }, [month, year, isFocused]);

//   return (
//     <View style={styles.container}>
//       <ScrollView style={{width: "100%"}}>
//         <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={() => navigation.navigate("PracticeScreen")} >
//           <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3} />
//         </TouchableOpacity>

//         <Text style={[styles.screenSubTitle, {marginTop: insets.top + 72}]}>Reaccion</Text>
//         <Text style={[styles.screenTitle]}>Analiticas</Text>

//         <View style={styles.smallBoxContainer}>
//           <View style={styles.smallBoxTop}>
//             <TouchableOpacity onPress={() => {if(month == 1){setMonth(12);setYear(year - 1)}else{setMonth(month - 1)}}}>
//               <Icon name="arrow-left" size={SIZES.i3} color={COLORS.black_01}/>
//             </TouchableOpacity>
//             <Text style={styles.smallBoxMonth}>{months[month - 1] + " " + year.toString().slice(2)}</Text>
//             <TouchableOpacity onPress={() => {if(month == 12){setMonth(1);setYear(year + 1)}else{setMonth(month + 1)}}} disabled={month == new Date().getMonth() + 1 && year == new Date().getFullYear()} style={{opacity: (month == new Date().getMonth() + 1 && year == new Date().getFullYear()) ? .5 : 1 }}>
//               <Icon name="arrow-right" size={SIZES.i3} color={COLORS.black_01}/>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.smallBoxBottom}>
//             <View style={styles.smallBoxBottomInner}>
//               <View style={styles.smallBoxBottomLeft}>
//                 <Text style={styles.smallBoxTitle}>Intentos</Text>
//                 <Text style={styles.smallBoxAttemps}>{amountAttemps}</Text>
//                 <Text style={styles.smallBoxDescription}>Intentos del mes de {months[month - 1]}</Text>
//               </View>
//               <View style={styles.smallBoxBottomRight}>
//                 <Text style={styles.smallBoxSubTitle}>Reaccion media</Text>
//                 <Text style={styles.smallBoxTime}>{averageAttemps}ms</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {bestAttemp != -1 &&
//           <View style={styles.blueBoxContainer}>
//             <View style={styles.blueBoxInnerContainer}>
//               <Text style={styles.blueBoxTitle}>Mejor Reaccion del Mes</Text>
//               <Text style={styles.blueBoxTime}>{bestAttemp.time}ms</Text>
//               <Text style={styles.blueBoxDate}>{bestAttemp.date}</Text>
//             </View>
//           </View>
//         }

//         <View style={styles.boxContainer}>
//           <View style={styles.boxInnerContainer}>
//             <Text style={styles.boxTitle}>Historial de Intentos</Text>

//             {attemps.length > 0 ? attemps.map((item) => {

//               const formattedDate = (() => { const d = new Date(item.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} -- ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`; })();

//               return (
//               <View key={item.id} style={styles.attempContainer}>
//                 <View style={[styles.attempInnerContainer, {backgroundColor: item.time < 0 ? COLORS.red_01 : COLORS.blue_01}]}>
//                   <Text style={styles.attempTime}>{item.time < 0 ? "Falso" : item.time + "ms"}</Text>
//                   <Text style={styles.attempDate}>{formattedDate}</Text>
//                 </View>
//               </View>
//               );
//             })
//           :
//           <Text style={styles.noAttemps}>No hay registros en este periodo</Text>}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: COLORS.black_01,
//     justifyContent: "flex-start",
//     alignItems: "center",
//     flex: 1,
//   },
//   backButton: {
//     backgroundColor: COLORS.purple_01,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     borderRadius: 24,
//     height: 48,
//     width: 48,
//     left: 24,
//   },
//   screenSubTitle: {
//     color: COLORS.gray_01,
//     fontSize: SIZES.f3,
//     fontWeight: "300",
//     paddingLeft: 24,
//     width: "100%",
//   },
//   screenTitle: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f1,
//     fontWeight: "700",
//     paddingLeft: 24,
//     width: "100%",
//   },
//   smallBoxContainer: {
//     paddingHorizontal: 38,
//     marginBottom: 12,
//     width: "100%",
//     marginTop: 8,
//   },
//   smallBoxTop: {
//     backgroundColor: COLORS.blue_01,
//     justifyContent: "space-between",
//     borderTopRightRadius: 12,
//     borderTopLeftRadius: 12,
//     paddingHorizontal: 12,
//     alignItems: "center",
//     flexDirection: "row",
//     paddingVertical: 6,
//   },
//   smallBoxMonth: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f3,
//     fontWeight: "600",
//   },
//   smallBoxBottom: {
//     backgroundColor: COLORS.blue_01,
//     borderBottomRightRadius: 24,
//     borderBottomLeftRadius: 24,
//   },
//   smallBoxBottomInner: {
//     backgroundColor: COLORS.black_02,
//     justifyContent: "space-between",
//     paddingHorizontal: 22,
//     flexDirection: "row",
//     paddingBottom: 18,
//     borderRadius: 12,
//     paddingTop: 32,
//   },
//   smallBoxBottomLeft: {
//     flexDirection: "column",
//   },
//   smallBoxTitle: {
//     color: COLORS.blue_01,
//     fontSize: SIZES.f3,
//     fontWeight: "700",
//   },
//   smallBoxAttemps: {
//     color: COLORS.white_01,
//     fontWeight: "900",
//     lineHeight: 50,
//     fontSize: 50,
//   },
//   smallBoxDescription: {
//     color: COLORS.white_02,
//     fontWeight: "300",
//     fontSize: SIZES.f6,
//     marginTop: -10,
//   },
//   smallBoxBottomRight: {
//     flexDirection: "column",
//     alignItems: "flex-end"
//   },
//   smallBoxSubTitle: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f6,
//     fontWeight: "500",
//   },
//   smallBoxTime: {
//     color: COLORS.blue_01,
//     fontSize: SIZES.f5,
//     fontWeight: "700",
//   },
//   blueBoxContainer: {
//     paddingHorizontal: 24,
//     marginBottom: 12,
//     width: "100%",
//   },
//   blueBoxInnerContainer: {
//     backgroundColor: COLORS.blue_01,
//     paddingBottom: 12,
//     borderRadius: 24,
//     padding: 24,
//   },
//   blueBoxTitle: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f3,
//     fontWeight: "700",
//   },
//   blueBoxTime: {
//     color: COLORS.black_01,
//     fontWeight: "900",
//     lineHeight: 52,
//     fontSize: 50,
//   },
//   blueBoxDate: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f5,
//     fontWeight: "300",
//     marginTop: -6,
//   },
//   boxContainer: {
//     paddingHorizontal: 24,
//     marginBottom: 12,
//     width: "100%",
//   },
//   boxInnerContainer: {
//     backgroundColor: COLORS.black_02,
//     paddingHorizontal: 18,
//     paddingBottom: 24,
//     borderRadius: 24,
//     paddingTop: 32, 
//   },
//   boxTitle: {
//     color: COLORS.white_01,
//     fontSize: SIZES.f3,
//     fontWeight: "600",
//     marginBottom: 18,
//   },
//   attempContainer: {
//     borderColor: COLORS.blue_01_15,
//     borderRadius: 12,
//     borderWidth: 2,
//     padding: 6,
//   },
//   attempInnerContainer: {
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexDirection: "row",
//     borderRadius: 8,
//     paddingRight: 4,
//     paddingLeft: 24,
//     height: 48,
//   },
//   attempTime: {
//     color: COLORS.black_01,
//     fontSize: SIZES.f3,
//     fontWeight: "700",
//   },
//   attempDate: {
//     color: COLORS.black_01,
//     alignSelf: "flex-end",
//     fontSize: SIZES.f5,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   noAttemps: {
//     color: COLORS.gray_01,
//     fontSize: SIZES.f4,
//     fontWeight: "300",
//     marginTop: -12,
//   }
// });


import BackgroundFetch from "react-native-background-fetch";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import axios from "axios";

const API_URL = Constants.expoConfig.env.api_url;

export const SyncService = async () => {

  const db = SQLite.useSQLiteContext();

  try {
    const unsyncedAttempts = await db.getAllAsync("SELECT * FROM practice_attempts WHERE synced = 0");
    if (unsyncedAttempts.length === 0) return;

    console.log("Pending to sync", unsyncedAttempts)

    const response = await axios.post(`${API_URL}/sync`, {unsyncedAttempts});
    if (response.status === 200) {
      const attemptIds = unsyncedAttempts.map(attempt => attempt.id);
      await db.runAsync("UPDATE practice_attempts SET synced = 1 WHERE id IN (?)", [attemptIds.join(',')]);
      console.log("Sincronización completada");
    } else {
      console.error("Error en la sincronización", response.status);
    }
  } catch (error) {
    console.error("Error al sincronizar los intentos:", error);
  }
};

const configureBackgroundSync = () => {
  BackgroundFetch.configure({
      minimumFetchInterval: 15, // Intervalo mínimo en minutos
      stopOnTerminate: false,  // Continuar cuando la app se cierre
      startOnBoot: true,       // Iniciar al reiniciar el dispositivo
    },
    async (taskId) => {
      console.log('[BackgroundFetch] start sync');
      await SyncService();
      BackgroundFetch.finish(taskId); // Notificar que la tarea ha terminado
    },
    (error) => {
      console.log('[BackgroundFetch] failed to start', error);
    }
  );
};

export default configureBackgroundSync;
