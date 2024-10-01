import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSyncAttemptsWithServer } from "../services/syncService.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme.js";
import { useAuth } from "../context/AuthContext.jsx";
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import Icon from "../constants/Icon.jsx";

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function StartPracticeStats() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [averageAttempts, setAverageAttempts] = useState(0);
  const [amountAttempts, setAmountAttempts] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [bestAttempt, setBestAttempt] = useState(0);
  const [attempts, setAttempts] = useState([]);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { authState } = useAuth();
  const db = useSQLiteContext();

  useEffect(() => {
    useSyncAttemptsWithServer(db, authState);
  }, [isFocused]);


  useEffect(() => {
    getStats();
  }, [month, year, isFocused]);

  const getStats = async () => {
    setLoadingAttempts(true);

    const stats01 = db.getFirstAsync(`SELECT count(id) as "amount" FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?`, [month.toString().padStart(2, '0'), year.toString()]);
    const stats02 = db.getFirstAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time >= 100 order by time ASC`, [month.toString().padStart(2, '0'), year.toString()]);
    const stats03A = db.getFirstAsync(`SELECT SUM(time) as total_time FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time >= 100`, [month.toString().padStart(2, '0'), year.toString()]);
    const stats03B = db.getFirstAsync(`SELECT COUNT(id) as count FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? AND time >= 100`, [month.toString().padStart(2, '0'), year.toString()]);

    const [attemptCount, bestAttemptResult, totalTime, count] = await Promise.all([stats01, stats02, stats03A, stats03B]);

    setAmountAttempts(attemptCount.amount);
    setBestAttempt(bestAttemptResult ? {time: bestAttemptResult.time, date: formatDate(bestAttemptResult.date)} : -1);
    setAverageAttempts(count.count > 0 ? parseInt(totalTime.total_time / count.count) : 0);

    loadAttempts();
  };

  const loadAttempts = async () => {
    const attemptsResult = await db.getAllAsync(`SELECT * FROM practice_attempts WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? order by date DESC`, [month.toString().padStart(2, '0'), year.toString()]);
    setAttempts(attemptsResult);
    setLoadingAttempts(false);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    d.setHours(d.getHours() - 3);
    return d.toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false}).replace(",", "");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      useSyncAttemptsWithServer(db, authState);
      getStats();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView style={[styles.mainContainer, {paddingTop: insets.top + 12}]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black_01} colors={[COLORS.blue_01]} progressBackgroundColor={COLORS.black_01}/>}>
      
      <TouchableOpacity style={[styles.backButton, {backgroundColor: COLORS.black_01}]} onPress={() => navigation.navigate("PracticeScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3}/>
      </TouchableOpacity>

      <Text style={styles.subTitle}>Reaccion</Text>
      <Text style={styles.title}>Analiticas</Text>

      <View style={styles.box01Container}>
        <View style={styles.box01Header}>
          <TouchableOpacity onPress={() => {if(month == 1){setMonth(12);setYear(year - 1)}else{setMonth(month - 1)}}}>
            <Icon name="arrow-left-sm" size={SIZES.i3} color={COLORS.black_01}/>
          </TouchableOpacity>
          <Text style={styles.box01Date}>{months[month - 1] + " " + year.toString().slice(2)}</Text>
          <TouchableOpacity onPress={() => {if(month == 12){setMonth(1);setYear(year + 1)}else{setMonth(month + 1)}}} disabled={month == new Date().getMonth() + 1 && year == new Date().getFullYear()} style={{opacity: (month == new Date().getMonth() + 1 && year == new Date().getFullYear()) ? .5 : 1 }}>
            <Icon name="arrow-right-sm" size={SIZES.i3} color={COLORS.black_01}/>
          </TouchableOpacity>
        </View>
        <View style={styles.box01Body}>
          <View style={styles.box01InnerBody}>
            <View>
              <Text style={styles.box01Title}>Intentos</Text>
              <Text style={styles.box01Attempts}>{amountAttempts}</Text>
            </View>
            <View style={styles.box01Right}>
              <Text style={styles.box01SubTitle}>Reaccion media</Text>
              <Text style={styles.box01Average}>{averageAttempts != 0 ? averageAttempts + "ms" : "-"}</Text>
            </View>
          </View>
          <Text style={styles.box01Description}>Intentos del mes de {months[month - 1]}</Text>
        </View>
      </View>

      {bestAttempt != -1 &&
        <View style={styles.box02Container}>
          <Text style={styles.box02Title}>Mejor Reaccion del Mes</Text>
          <Text style={styles.box02Time}>{bestAttempt.time}ms</Text>
          <Text style={styles.box02Date}>{bestAttempt.date}</Text>
        </View>
      }

      <View style={styles.box03Container}>
        <View style={styles.box03Header}>
          <Text style={styles.box03Title}>Historial de Intentos</Text>
        </View>
        <View style={styles.box03AttemptsContainer}>
          {loadingAttempts ? (<ActivityIndicator size="large" color={COLORS.black_01} />) 
          :
          (attempts.length > 0 ? attempts.map((item) =>
            <View key={item.id} style={[styles.attemptItem, {backgroundColor: item.time < 0 ? COLORS.red_01 : COLORS.blue_01, opacity: (item.time >= 0 && item.time < 100) ? .45 : 1}]}>
              <Text style={styles.attemptTime}>{item.time < 0 ? "Falso" : item.time + "ms"}</Text>
              <View style={styles.attemptDateContainer}>
                <Text style={styles.attemptDQ}>{(item.time >= 0 && item.time < 100) && "DQ"}</Text>
                <Text style={[styles.attemptDate, {color: item.time < 0 ? COLORS.red_01 : COLORS.blue_01}]}>{formatDate(item.date)}</Text>
              </View>
            </View>
          ) 
          :
          <Text style={styles.noAttempts}>No hay registros en este periodo</Text>
          )}      
        </View>
      </View>

      <View style={{height: 200}}/>

    </ScrollView>
  )
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
  subTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.black_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
    marginBottom: 4,
    marginTop: 32,
  },
  title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },
  box01Container: {
    borderColor: COLORS.black_01,
    borderRadius: 24,
    borderWidth: 2,
  },
  box01Header: {
    justifyContent: "space-between",
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 4,
    paddingTop: 8,
  },
  box01Date: {
    fontFamily: "Inter_semiBold",
    color: COLORS.black_01,
    fontSize: SIZES.f5 + 2,
  },
  box01Body: {
    backgroundColor: COLORS.black_01,
    borderRadius: 20,
    padding: 24,
  },
  box01InnerBody: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  box01Title: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.i3,
  },
  box01Attempts: {
    fontFamily: "Inter_black",
    color: COLORS.white_01,
    lineHeight: 52,
    marginTop: 4,
    fontSize: 52,
  },
  box01Right: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  box01SubTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.blue_01,
    lineHeight: SIZES.f6,
    fontSize: SIZES.f6,
  },
  box01Average: {
    fontFamily: "Inter_extraBold",
    color: COLORS.white_01,
    lineHeight: SIZES.f6,
    fontSize: SIZES.f6,
    marginTop: 4,
  },
  box01Description: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    lineHeight: SIZES.f5,
    fontSize: SIZES.f5,
  },
  box02Container: {
    backgroundColor: COLORS.black_01_10,
    paddingBottom: 20,
    borderRadius: 24,
    marginTop: 12,
    padding: 24,
  },
  box02Title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
    marginBottom: 8,
  },
  box02Time: {
    fontFamily: "Inter_black",
    color: COLORS.black_01,
    lineHeight: 52,
    fontSize: 52,
  },
  box02Date: {
    fontFamily: "Inter_regular",
    color: COLORS.black_01,
    lineHeight: SIZES.f5,
    fontSize: SIZES.f5,
    marginLeft: 2,
    marginTop: -4,
  },
  box03Container: {
    borderColor: COLORS.black_01,
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 24,
  },
  box03Header: {
    backgroundColor: COLORS.black_01,
    borderRadius: 20,
    padding: 24,
  },
  box03Title: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  box03AttemptsContainer: {
    padding: 12,
    gap: 4,
  },
  attemptItem: {
    borderColor: COLORS.black_01,
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 2,
    height: 46,
    alignItems: "center",
  },
  attemptTime: {
    fontFamily: "Inter_extraBold",
    color: COLORS.black_01,
    textAlign: "center",
    fontSize: SIZES.f4,
    width: 100,
  },
  attemptDateContainer: {
    backgroundColor: COLORS.black_01,
    justifyContent: "space-between",
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    height: "100%",
    flex: 1,
  },
  attemptDate: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  attemptDQ: {
    fontFamily: "Inter_extraBold",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  noAttempts: {
    fontFamily: "Inter_medium",
    color: COLORS.black_01,
    lineHeight: SIZES.f5,
    fontSize: SIZES.f5,
    textAlign: "center",
  }
});