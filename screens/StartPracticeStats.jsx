import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme.js";
import Icon from "../constants/Icon.jsx";
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";

export default function StartPracticeStats() {
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [averageAttemps, setAverageAttemps] = useState(0);
  const [amountAttemps, setAmountAttemps] = useState(0);
  const [bestAttemp, setBestAttemp] = useState(0);
  const [attemps, setAttemps] = useState([]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();

  const getStats = async () => {
    const monthlyAttemps = await db.getAllAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? order by date DESC`, [month.toString().padStart(2, '0')],);
    const monthlyBestAttemp = await db.getFirstAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? AND time > 100 order by time ASC`, [month.toString().padStart(2, '0')],);
    const monthlyAmountAttemps = await db.getAllAsync(`SELECT count(id) as "amount" FROM practice_attempts WHERE strftime('%m', date) = ?`, [month.toString().padStart(2, '0')],);
    setAttemps(monthlyAttemps);
    if(monthlyBestAttemp != null){
      const formattedDate = (() => { const d = new Date(monthlyBestAttemp.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} -- ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`; })();
      setBestAttemp({time: monthlyBestAttemp.time, date: formattedDate})
    }else {
      setBestAttemp(-1);
    }
    setAmountAttemps(monthlyAmountAttemps[0].amount)
    console.log(monthlyAttemps)
    console.log("BEST: ", monthlyBestAttemp)
    console.log(monthlyAmountAttemps[0].amount)

    const totalTimeResult = await db.getFirstAsync(`SELECT SUM(time) as total_time FROM practice_attempts WHERE strftime('%m', date) = ? and time >= 100`, [month.toString().padStart(2, '0')]);
    const countResult = await db.getFirstAsync(`SELECT COUNT(id) as count FROM practice_attempts WHERE strftime('%m', date) = ? AND time >= 100`, [month.toString().padStart(2, '0')]);
    
    const averageTime = countResult.count > 0 ? totalTimeResult.total_time / countResult.count : 0;
    setAverageAttemps(parseInt(averageTime));
    console.log(averageTime)

  }

  useEffect(() => {
    getStats();
  }, [month, year, isFocused]);

  return (
    <View style={styles.container}>
      <ScrollView style={{width: "100%"}}>
        <TouchableOpacity style={[styles.backButton, { top: insets.top }]} onPress={() => navigation.navigate("PracticeScreen")} >
          <Icon name="arrow-left" color={COLORS.black_01} size={SIZES.i3} />
        </TouchableOpacity>

        <Text style={[styles.screenSubTitle, {marginTop: insets.top + 72}]}>Reaccion</Text>
        <Text style={[styles.screenTitle]}>Analiticas</Text>

        <View style={styles.smallBoxContainer}>
          <View style={styles.smallBoxTop}>
            <TouchableOpacity onPress={() => {if(month == 1){setMonth(12);setYear(year - 1)}else{setMonth(month - 1)}}}>
              <Icon name="arrow-left" size={SIZES.i3} color={COLORS.black_01}/>
            </TouchableOpacity>
            <Text style={styles.smallBoxMonth}>{months[month - 1] + " " + year.toString().slice(2)}</Text>
            <TouchableOpacity onPress={() => {if(month == 12){setMonth(1);setYear(year + 1)}else{setMonth(month + 1)}}} disabled={month == new Date().getMonth() + 1 && year == new Date().getFullYear()} style={{opacity: (month == new Date().getMonth() + 1 && year == new Date().getFullYear()) ? .5 : 1 }}>
              <Icon name="arrow-right" size={SIZES.i3} color={COLORS.black_01}/>
            </TouchableOpacity>
          </View>
          <View style={styles.smallBoxBottom}>
            <View style={styles.smallBoxBottomInner}>
              <View style={styles.smallBoxBottomLeft}>
                <Text style={styles.smallBoxTitle}>Intentos</Text>
                <Text style={styles.smallBoxAttemps}>{amountAttemps}</Text>
                <Text style={styles.smallBoxDescription}>Intentos del mes de {months[month - 1]}</Text>
              </View>
              <View style={styles.smallBoxBottomRight}>
                <Text style={styles.smallBoxSubTitle}>Reaccion media</Text>
                <Text style={styles.smallBoxTime}>{averageAttemps}ms</Text>
              </View>
            </View>
          </View>
        </View>

        {bestAttemp != -1 &&
          <View style={styles.blueBoxContainer}>
            <View style={styles.blueBoxInnerContainer}>
              <Text style={styles.blueBoxTitle}>Mejor Reaccion del Mes</Text>
              <Text style={styles.blueBoxTime}>{bestAttemp.time}ms</Text>
              <Text style={styles.blueBoxDate}>{bestAttemp.date}</Text>
            </View>
          </View>
        }

        <View style={styles.boxContainer}>
          <View style={styles.boxInnerContainer}>
            <Text style={styles.boxTitle}>Historial de Intentos</Text>

            {attemps.length > 0 ? attemps.map((item) => {

              const formattedDate = (() => { const d = new Date(item.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} -- ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`; })();

              return (
              <View key={item.id} style={styles.attempContainer}>
                <View style={[styles.attempInnerContainer, {backgroundColor: item.time < 0 ? COLORS.red_01 : COLORS.blue_01}]}>
                  <Text style={styles.attempTime}>{item.time < 0 ? "Falso" : item.time + "ms"}</Text>
                  <Text style={styles.attempDate}>{formattedDate}</Text>
                </View>
              </View>
              );
            })
          :
          <Text style={styles.noAttemps}>No hay registros en este periodo</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  )
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
    left: 24,
  },
  screenSubTitle: {
    color: COLORS.gray_01,
    fontSize: SIZES.f3,
    fontWeight: "300",
    paddingLeft: 24,
    width: "100%",
  },
  screenTitle: {
    color: COLORS.white_01,
    fontSize: SIZES.f1,
    fontWeight: "700",
    paddingLeft: 24,
    width: "100%",
  },
  smallBoxContainer: {
    paddingHorizontal: 38,
    marginBottom: 12,
    width: "100%",
    marginTop: 8,
  },
  smallBoxTop: {
    backgroundColor: COLORS.blue_01,
    justifyContent: "space-between",
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 6,
  },
  smallBoxMonth: {
    color: COLORS.black_01,
    fontSize: SIZES.f3,
    fontWeight: "600",
  },
  smallBoxBottom: {
    backgroundColor: COLORS.blue_01,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  smallBoxBottomInner: {
    backgroundColor: COLORS.black_02,
    justifyContent: "space-between",
    paddingHorizontal: 22,
    flexDirection: "row",
    paddingBottom: 18,
    borderRadius: 12,
    paddingTop: 32,
  },
  smallBoxBottomLeft: {
    flexDirection: "column",
  },
  smallBoxTitle: {
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
    fontWeight: "700",
  },
  smallBoxAttemps: {
    color: COLORS.white_01,
    fontWeight: "900",
    lineHeight: 50,
    fontSize: 50,
  },
  smallBoxDescription: {
    color: COLORS.white_02,
    fontWeight: "300",
    fontSize: SIZES.f6,
    marginTop: -10,
  },
  smallBoxBottomRight: {
    flexDirection: "column",
    alignItems: "flex-end"
  },
  smallBoxSubTitle: {
    color: COLORS.white_01,
    fontSize: SIZES.f6,
    fontWeight: "500",
  },
  smallBoxTime: {
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
    fontWeight: "700",
  },
  blueBoxContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
    width: "100%",
  },
  blueBoxInnerContainer: {
    backgroundColor: COLORS.blue_01,
    paddingBottom: 12,
    borderRadius: 24,
    padding: 24,
  },
  blueBoxTitle: {
    color: COLORS.black_01,
    fontSize: SIZES.f3,
    fontWeight: "700",
  },
  blueBoxTime: {
    color: COLORS.black_01,
    fontWeight: "900",
    lineHeight: 52,
    fontSize: 50,
  },
  blueBoxDate: {
    color: COLORS.black_01,
    fontSize: SIZES.f5,
    fontWeight: "300",
    marginTop: -6,
  },
  boxContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
    width: "100%",
  },
  boxInnerContainer: {
    backgroundColor: COLORS.black_02,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderRadius: 24,
    paddingTop: 32, 
  },
  boxTitle: {
    color: COLORS.white_01,
    fontSize: SIZES.f3,
    fontWeight: "600",
    marginBottom: 18,
  },
  attempContainer: {
    borderColor: COLORS.blue_01_15,
    borderRadius: 12,
    borderWidth: 2,
    padding: 6,
  },
  attempInnerContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    paddingRight: 4,
    paddingLeft: 24,
    height: 48,
  },
  attempTime: {
    color: COLORS.black_01,
    fontSize: SIZES.f3,
    fontWeight: "700",
  },
  attempDate: {
    color: COLORS.black_01,
    alignSelf: "flex-end",
    fontSize: SIZES.f5,
    fontWeight: "700",
    marginBottom: 4,
  },
  noAttemps: {
    color: COLORS.gray_01,
    fontSize: SIZES.f4,
    fontWeight: "300",
    marginTop: -12,
  }
});