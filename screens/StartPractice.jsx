import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSyncAttemptsWithServer } from "../services/syncService.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH, COLORS, SIZES } from "../constants/theme.js";
import SwipeButton from "../components/SwipeButton.jsx";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext.jsx";
import { makeRequest } from "../constants/axios.js";
import React, { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import Icon from "../constants/Icon.jsx";
import { Image } from "expo-image";

import background01 from "../assets/images/background01.png";

export default function StartPractice() {
  const [globalRankingPos, setGlobalRankingPos] = useState(null);
  const [amountAttempts, setAmountAttempts] = useState(0);
  const [falseAttempts, setFalseAttempts] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { authState } = useAuth();
  const db = useSQLiteContext();

  useEffect(() => {
    const getStats = async () => {
      const stats01 = await db.getFirstAsync(`SELECT count(id) as "amount" FROM practice_attempts`,);
      const stats02 = await db.getFirstAsync(`SELECT COUNT(id) as "amount" FROM practice_attempts WHERE time != -1`);
      const validStarts = stats01.amount > 0 ? (stats02.amount / stats01.amount) * 100 : 0;
      setAmountAttempts(stats01.amount);
      setFalseAttempts(parseInt(validStarts));
    }
    getStats();

    setTimeout(() => {
      getStats();
    }, 2000);
  }, [isFocused]);


  const getRankingGlobalPos = async () => {
    try {
      useSyncAttemptsWithServer();
      const res = await makeRequest.get("/practice/ranking/global/pos", { headers: { authorization: authState.token }}); 
      setGlobalRankingPos(res.data)
    } catch (err) {
      console.log("Error al obtener")
    }
  }

  useEffect(() => {
    getRankingGlobalPos();
  }, [isFocused])


  return (
    <TouchableWithoutFeedback onPress={() => {if(!isSwiping)navigation.navigate("PracticeProgressScreen");}}>
      <View style={{flex: 1}}>
        <View style={styles.backgroundContainer}>
          <View style={styles.backgroundTop}/>
          <View style={styles.backgroundBottom}/>
          <View style={styles.backgroundImage}><Image cachePolicy="memory" style={{width: "100%", aspectRatio: 9/11}} source={background01} transition={250} placeholder={BLURHASH.black_01}/></View>
          <View style={styles.linesContainer}>
            <View style={{flex: 1}}>
              <View style={[styles.verticalLine, {top: "7%"}]}/>
              <View style={[styles.verticalLine, {top: "24%"}]}/>
              <View style={[styles.verticalLine, {top: "42%"}]}/>

              <View style={[styles.horizontalLine, {left: "15%"}]}/>
              <View style={[styles.horizontalLine, {left: "50%"}]}/>
              <View style={[styles.horizontalLine, {right: "15%"}]}/>
            </View>
          </View>
          <LinearGradient style={styles.backgroundGradientEffect} colors={[COLORS.black_01, COLORS.blue_01_80, "#fff0"]} start={[0, 1]} end={[1, 0]} locations={[0, .4, .8]} />
        </View>

        <View style={[styles.mainContainer, {paddingTop: insets.top + 8}]}>

          <View style={styles.headerContainer}>
            <TouchableWithoutFeedback onPress={() => navigation.navigate("PracticeRankingScreen", { ads: true })}>
              <View style={styles.rankingContainer}>
                <TouchableOpacity style={styles.rankingBtn} onPress={() => navigation.navigate("PracticeRankingScreen", { ads: true })}>
                  <Icon name="world" size={SIZES.i2} color={COLORS.black_01}/>
                </TouchableOpacity>
                <View style={styles.rankingIndicatorContainer}>
                  <Text style={styles.rankingTitle}>Ranking</Text>
                  {globalRankingPos == null ? 
                  <Text style={styles.rankingTop}>-</Text>
                  :
                  <View style={styles.rankingTopContainer}>
                    <Text style={styles.rankingTop}>{globalRankingPos.ranking}</Text>
                    <View style={styles.rankingPos}>
                      <Icon name="pos" size={12}/>
                    </View>
                  </View>}
                </View>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
              <View style={styles.athleticsLabsContainer}>
                <Text style={styles.athleticsLabs}>Athletics <Text style={styles.labBolder}>Labs</Text></Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.indicationsContainer}>
            <Text style={styles.indication}>Presiona la pantalla para comenzar!</Text>
            <Text style={styles.subIndication}>Mueve o toca la pantalla luego de que{"\n"}suene el disparo!</Text>
          </View>

          <View style={{flex: 1}}/>

          <View style={styles.cubesContainer}>
            <View style={styles.cube01}/>
            <View style={styles.cube02}/>
            <View style={styles.cube03}/>
          </View>
          <TouchableWithoutFeedback onPress={() => navigation.navigate("PracticeStatsScreen")}>
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statsBtn} onPress={() => navigation.navigate("PracticeStatsScreen")}>
                <Icon name="arrow-right-m" color={COLORS.black_01} size={SIZES.i3}/>
              </TouchableOpacity>
              <Text style={styles.statsTitle}>Pruebas Realizadas</Text>
              <View style={styles.statsSubContainer}>
                <Text style={styles.stats}>{amountAttempts}</Text>
                <View style={styles.statsIcon}>
                  <Icon name="flag" size={SIZES.i2}/>
                </View>
              </View>
              <Text style={styles.subStats}>El <Text style={styles.subStatsBolder}>{falseAttempts}%</Text> de las pruebas fueron validas</Text>
            </View>
          </TouchableWithoutFeedback>


          <LinearGradient style={styles.configurationContainer} colors={[COLORS.blue_01, COLORS.white_01]} start={[0, 0]} end={[1, 0]}>
            <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate("PracticeConfigScreen")}>
              <View style={{width: 40}}>
                <Icon name="settings" color={COLORS.black_01} size={SIZES.i2}/>
              </View>
              <Text style={styles.configText}>Configuracion</Text>
              <View style={{flexDirection: "row", width: 40, justifyContent: "flex-end"}}>
                <View style={{marginLeft: -12, opacity: .1}}>
                    <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
                </View>
                <View style={{marginLeft: -12, opacity: .5}}>
                    <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
                </View>
                <View style={{marginLeft: -12}}>
                    <Icon name="arrow-right-l" color={COLORS.black_01} size={SIZES.i3}/>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flexDirection: "column",
    flex: 1,
  },
  backgroundTop: {
    backgroundColor: "#52D2FC",
    position: "absolute",
    height: "50%",
    width: "100%",
    left: 0,
    top: 0,
  },
  backgroundBottom: {
    backgroundColor: "#1778FA",
    position: "absolute",
    height: "50%",
    width: "100%",
    bottom: 0,
    left: 0,
  },
  backgroundImage: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "22%",
    flex: 1,
  },
  linesContainer: {
    height: "100%",
    width: "100%",
  },
  verticalLine: {
    backgroundColor: COLORS.black_01_10,
    position: "relative",
    width: "100%",
    height: 2,
  },
  horizontalLine: {
    backgroundColor: COLORS.black_01_10,
    position: "absolute",
    height: "100%",
    width: 2,
  },
  backgroundGradientEffect: {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 1000,
  },
  mainContainer: {
    paddingHorizontal: 24,
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 1000,
    left: 0,
    top: 0,
  },
  headerContainer: {
    flexDirection: "row",
  },
  rankingContainer: {
    backgroundColor: COLORS.black_01,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 32,
    height: 64,
    width: 130,
  },
  rankingBtn: {
    backgroundColor: COLORS.white_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  rankingIndicatorContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 6,
    flex: 1,
  },
  rankingTitle: {
    fontFamily: "Inter_extraBold",
    fontSize: SIZES.f7 - 1,
    color: COLORS.white_01,
  },
  rankingTopContainer: {
    flexDirection: "row",
    marginTop: -2,
  },
  rankingTop: {
    fontFamily: "Inter_black",
    fontSize: SIZES.f3 + 2,
    color: COLORS.white_01,
    lineHeight: 28,
  },
  rankingPos: {
    marginLeft: -2,
    marginTop: 2,
  },
  athleticsLabsContainer: {
    backgroundColor: COLORS.black_01,
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 32,
    marginLeft: 8,
    height: 64,
  },
  athleticsLabs: {
    fontFamily: "Inter_semiBold",
    color: COLORS.white_01,
    fontSize: SIZES.f4,
  },
  labBolder: {
    fontFamily: "Inter_black",
  },
  indicationsContainer: {
    backgroundColor: COLORS.black_01_10,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 24,
    marginTop: 32,
  },
  indication: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    textAlign: "center",
    fontSize: SIZES.f1,
    lineHeight: 32,
  },
  subIndication: {
    fontFamily: "Inter_medium",
    color: COLORS.black_02,
    lineHeight: SIZES.f5,
    textAlign: "center",
    fontSize: SIZES.f5,
    marginTop: 8,
  },
  cubesContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    position: "relative",
    marginBottom: -12,
    width: "100%",
    zIndex: 100,
  },
  cube01: {
    backgroundColor: COLORS.white_01,
    marginBottom: 12,
    borderRadius: 6,
    marginRight: 48,
    height: 48,
    width: 48,
  },
  cube02: {
    backgroundColor: COLORS.black_01,
    marginBottom: 12,
    marginRight: 112,
    borderRadius: 6,
    height: 48,
    width: 48,
  },
  cube03: {
    backgroundColor: COLORS.white_01,
    borderRadius: 6,
    marginRight: 64,
    height: 48,
    width: 48,
  },
  statsContainer: {
    backgroundColor: COLORS.black_01,
    marginBottom: 12,
    borderRadius: 32,
    padding: 24,
  },
  statsBtn: {
    transform: [{ rotate: "-45deg" }],
    backgroundColor: COLORS.blue_01,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    zIndex: 1000,
    height: 48,
    width: 48,
    right: 24,
    top: 24,
  },
  statsTitle: {
    fontFamily: "Inter_semiBold",
    color: COLORS.white_02,
    fontSize: SIZES.f6,
  },
  statsSubContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    flexDirection: "row",
  },
  stats: {
    fontFamily: "Inter_extraBold",
    color: COLORS.white_01,
    lineHeight: 118,
    fontSize: 110,
  },
  statsIcon: {
    marginBottom: 24,
  },
  subStats: {
    fontFamily: "Inter_medium",
    color: COLORS.white_01,
    fontSize: SIZES.f5,
    marginTop: -12,
  },
  subStatsBolder: {
    fontFamily: "Inter_black",
  },
  configurationContainer: {
    backgroundColor: COLORS.white_01,
    justifyContent: "center",
    alignItems: "center",
    bottom: SIZES.bm1,
    borderRadius: 100,
    marginTop: 32,
    width: "100%",
    padding: 6,
  },
  configBtn: {
    borderColor: COLORS.black_01,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 50,
    borderWidth: 3,
    width: "100%",
    padding: 12,
  },
  configText: {
    fontFamily: "Inter_semiBold",
    color: COLORS.black_01,
    alignSelf: "center",
    fontSize: SIZES.f4,
  }
});