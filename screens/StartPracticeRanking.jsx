import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AdEventType, InterstitialAd, TestIds } from "react-native-google-mobile-ads";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSyncAttemptsWithServer } from "../services/syncService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import React, { useEffect, useState } from "react";
import { AdComponent01 } from "../components/Ads";
import * as SecureStore from "expo-secure-store";
import { makeRequest } from "../constants/axios";
import { formatDate } from "../constants/format";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useSQLiteContext } from "expo-sqlite";
import Icon from "../constants/Icon";

const regularExpression = /^[a-zA-Z0-9_]+$/;

const manageCounter = async () => {
  let counter = parseInt(await SecureStore.getItemAsync("rankingCounter")) || 1;
  counter += 1;
  await SecureStore.setItemAsync("rankingCounter", counter.toString());
  return counter;
};

export default function StartPracticeRanking({ route }) {
  const [usernameStatus, setUsernameStatus] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState("");

  const { authState, editProfile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const getRanking = async () => {
    useSyncAttemptsWithServer(db, authState);
    const res = await makeRequest.get("/practice/ranking", { headers: { authorization: authState.token }}); 
    return res.data;
  }

  const { data: ranking, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
  });

  // --- Username Handling ---
  useEffect(() => {
    setUsername(authState.user.username);
  }, []);
  const { isRefetching: usernameRefetching, data: usernameData, refetch: usernameRefetch } = useQuery({
    queryFn: () => makeRequest.get("/user/username/check?username=" + username).then((res) => res.data),
    queryKey: ["username_check"],
    enabled: username != authState.user.username && username != ""
  });
  useEffect(() => {
    if(!usernameRefetching && username.length >= 4 && regularExpression.test(username)) setUsernameStatus(usernameData?.inUse ? 2 : 3);
  }, [usernameRefetching]);
  useEffect(() => {
    if(username != "" && username != authState.user.username) {
      let timeoutId;
      const checkUsernameValidity = (value) => {
        setUsernameStatus(1);
        if (value.length < 4 || !regularExpression.test(value)) { setUsernameStatus(2); return; }
        else { clearTimeout(timeoutId); timeoutId = setTimeout(() => { usernameRefetch(); }, 1000);}
      };
      checkUsernameValidity(username);
      return () => { clearTimeout(timeoutId); };
    }
  }, [username]);
  const handleUsername = async () => {
    if(usernameStatus == 0){
    } else if (usernameStatus == 2 || usernameStatus == 1){
      setUsername(authState.user.username)
      setUsernameStatus(0);
    } else if (usernameStatus == 3){
      const res = await makeRequest.post("/user/username", {username: username}, { headers: { authorization: authState.token }}); 
      if(res.data.success == true){
        editProfile("username", username)
        setUsernameStatus(0);
      } else {
        setUsername(authState.user.username);
        setUsernameStatus(0);
      }
    }
  }
  // --- Username Handling ---

  useEffect(() => {
    const handleAdDisplay = async () => {
      if (route?.params?.ads && isFocused) {
        const counter = await manageCounter();
        if (counter % 3 === 0) AdComponent01();
      }
    };
    handleAdDisplay();
  }, [isFocused]);

  return (
    <ScrollView style={[styles.mainContainer, {paddingTop: insets.top + 12}]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black_01} colors={[COLORS.blue_01]} progressBackgroundColor={COLORS.black_01}/>}>
      
      <TouchableOpacity style={[styles.backButton, {backgroundColor: COLORS.black_01}]} onPress={() => navigation.navigate("PracticeScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3}/>
      </TouchableOpacity>

      <Text style={styles.subTitle}>Athletics <Text style={styles.subTitleBold}>Labs</Text></Text>
      <Text style={styles.title}>Ranking</Text>

      <View style={styles.usernameContainer}>
        <TextInput style={styles.usernameInput} placeholder="username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35}/>
        <TouchableOpacity onPress={handleUsername} style={usernameStatus == 0 ? styles.usernameBtn : usernameStatus == 1 ? styles.checkingUsernameBtn : usernameStatus == 2 ? styles.errorUsernameBtn : styles.changeUsernameBtn}>
          <Icon name={usernameStatus == 3 || usernameStatus == 0 ? "check" : usernameStatus == 1 ? "clock" : "close"} size={SIZES.i3} color={usernameStatus == 0 ? COLORS.black_01 : usernameStatus == 1 ? COLORS.purple_01 : usernameStatus == 2 ? COLORS.red_01 : COLORS.white_01}/>
        </TouchableOpacity>
      </View>

      <View style={styles.box01Container}>
        {isLoading || isRefetching ?
        <ActivityIndicator size="large" color={COLORS.blue_01} />
        :
        <>
          <TouchableOpacity style={styles.box01Btn} onPress={() => navigation.navigate("PracticeRankingGlobalScreen")}>
            <Icon name="arrow-right" color={COLORS.black_01} size={SIZES.i3}/>
          </TouchableOpacity>
          <Text style={styles.box01Title}>Tu Ranking Actual</Text>
            {
              ranking?.ownGlobal != undefined ? 
              <View style={styles.box01PosContainer}>
                <Text style={styles.box01Pos}>{ranking?.ownGlobal?.ranking}</Text>
                <View style={styles.box01PosIcon}>
                  <Icon name="pos" color={COLORS.white_01} size={SIZES.i1}/>
                </View>
              </View>
              :
              <Text style={styles.box01Pos}>-</Text>
            }
          
          {
            ranking?.ownGlobal != undefined ? 
            <Text style={styles.box01SubTitle}>Tu promedio es de <Text style={styles.box01SubTitleBold}>{parseInt(ranking?.ownGlobal?.avg_time) + "ms"}</Text></Text>
            :
            <Text style={styles.box01SubTitle}>Aun no tienes promedio</Text>
          }
        </>
        }
      </View>

      <View style={styles.box02Container}>
        <Text style={styles.box02Title}>Ranking Basado en Promedio</Text>
        <Text style={styles.box02SubTitle}>El promedio es obteniedo mediante todas las proeubas realizadas que sean validas.</Text>
      </View>

      <View style={styles.box03Container}>
        <View style={styles.box03Header}>
        {isLoading || isRefetching ?
        <ActivityIndicator size="large" color={COLORS.blue_01} />
        :
        <>
          <TouchableOpacity style={styles.box03Btn} onPress={() => navigation.navigate("PracticeRankingMonthlyScreen")}>
            <Icon name="arrow-right" color={COLORS.black_01} size={SIZES.i3}/>
          </TouchableOpacity>
          {
            ranking?.ownMonthly?.best_time != undefined && <Text style={styles.box03Time}>{ranking?.ownMonthly?.best_time}ms</Text>
          }


          <Text style={styles.box03Title}>Ranking mensual</Text>
            {
              ranking?.ownMonthly?.best_time != undefined && ranking?.ownMonthly?.best_time != null ? 
              <View style={styles.box03PosContainer}>
                <Text style={styles.box03Pos}>{ranking?.ownMonthly?.ranking}</Text>
                <View style={styles.box03PosIcon}>
                  <Icon name="pos" color={COLORS.blue_01} size={SIZES.i3}/>
                </View>
              </View>
              :
              <Text style={styles.box03Pos}>-</Text>
            }
          {
            ranking?.ownMonthly?.date != undefined ? <Text style={styles.box03Date}>{formatDate(ranking?.ownMonthly?.date)}</Text>
            :
            <Text style={styles.box03Date}>Aun no tienes ninguna practica</Text>

          }
        </>
        }
        </View>

        {ranking?.monthlyBattle?.length > 1 &&
        <View style={styles.box03Ranking}>
          <View key={ranking.monthlyBattle[0].user_id} style={ranking.monthlyBattle[0].user_id == authState.user.id ? styles.ownRankingItem : styles.rankingItem}>
            <View style={styles.rankingPosContainer}>
              <Text style={[styles.rankingPos, {color: ranking.monthlyBattle[0].user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01}]}>{ranking.monthlyBattle[0].ranking}</Text>
              <View style={styles.rankingPosIcon}>
                <Icon name="pos" color={ranking.monthlyBattle[0].user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01} size={SIZES.i4}/>
              </View>
            </View>
            <View style={ranking.monthlyBattle[0].user_id == authState.user.id ? styles.ownRankingItemInner : styles.rankingItemInner}>
              <Text style={[styles.rankingUsername, {color: ranking.monthlyBattle[0].user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{ranking.monthlyBattle[0].username.length > 18 ? ranking.monthlyBattle[0].username.slice(0,18) + "..." : ranking.monthlyBattle[0].username}</Text>
              <Text style={[styles.rankingTime, {color: ranking.monthlyBattle[0].user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{parseInt(ranking.monthlyBattle[0].best_time)}ms</Text>
            </View>
          </View>

          <Text style={styles.battleText}>Batalla Actual</Text>

          <View key={ranking.monthlyBattle[1].user_id} style={ranking.monthlyBattle[1].user_id == authState.user.id ? styles.ownRankingItem : styles.rankingItem}>
            <View style={styles.rankingPosContainer}>
              <Text style={[styles.rankingPos, {color: ranking.monthlyBattle[1].user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01}]}>{ranking.monthlyBattle[1].ranking}</Text>
              <View style={styles.rankingPosIcon}>
                <Icon name="pos" color={ranking.monthlyBattle[1].user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01} size={SIZES.i4}/>
              </View>
            </View>
            <View style={ranking?.monthlyBattle[1].user_id == authState.user.id ? styles.ownRankingItemInner : styles.rankingItemInner}>
              <Text style={[styles.rankingUsername, {color: ranking?.monthlyBattle[1]?.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{ranking.monthlyBattle[1].username.length > 18 ? ranking.monthlyBattle[1].username.slice(0,18) + "..." : ranking.monthlyBattle[1].username}</Text>
              <Text style={[styles.rankingTime, {color: ranking?.monthlyBattle[1]?.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{parseInt(ranking.monthlyBattle[1].best_time)}ms</Text>
            </View>
          </View>
        </View>
        }
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
  subTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.black_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
    marginBottom: 4,
    marginTop: 32,
  },
  subTitleBold: {
    fontFamily: "Inter_bold",
  },
  title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },

  usernameContainer: {
    flexDirection: "row",
    marginVertical: 12,
    height: 54,
    gap: 8,
  },
  usernameInput: {
    backgroundColor: COLORS.black_01,
    fontFamily: "Inter_semiBold",
    color: COLORS.white_01,
    fontSize: SIZES.f3,
    borderRadius: 27,
    paddingHorizontal: 16,
    height: "100%",
    flex: 1,
  },
  usernameBtn: {
    borderColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    borderWidth: 3,
    height: "100%",
    width: 54,
  },
  checkingUsernameBtn: {
    backgroundColor: COLORS.black_01,
    borderColor: COLORS.purple_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    borderWidth: 3,
    height: "100%",
    width: 54,
  },
  errorUsernameBtn: {
    backgroundColor: COLORS.black_01,
    borderColor: COLORS.red_01,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    height: "100%",
    width: 54,
  },
  changeUsernameBtn: {
    backgroundColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    height: "100%",
    width: 54,
  },
  box01Container: {
    backgroundColor: COLORS.black_01,
    borderRadius: 24,
    padding: 24,
  },
  box01Btn: {
    transform: [{ rotate: "-45deg"}],
    backgroundColor: COLORS.blue_01,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    zIndex: 100,
    height: 48,
    width: 48,
    right: 24,
    top: 24,
  },
  box01Title: {
    fontFamily: "Inter_semiBold",
    color: COLORS.white_02,
    fontSize: SIZES.f6,
    marginBottom: 8,
  },
  box01PosContainer: {
    flexDirection: "row",
  },
  box01Pos: {
    fontFamily: "Inter_extraBold",
    color: COLORS.white_01,
    lineHeight: 114,
    fontSize: 110,
  },
  box01PosIcon: {
    marginLeft: -8,
    marginTop: -8,
  },
  box01SubTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.white_01,
    fontSize: SIZES.f5,
    marginTop: -16,
  },
  box01SubTitleBold: {
    fontFamily: "Inter_black",
  },

  box02Container: {
    backgroundColor: COLORS.black_01_10,
    paddingBottom: 20,
    borderRadius: 24,
    marginTop: 12,
    padding: 24,
    gap: 12,
  },
  box02Title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    textAlign: "center",
    fontSize: SIZES.f1,
  },
  box02SubTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.black_02,
    lineHeight: SIZES.f5,
    textAlign: "center",
    fontSize: SIZES.f5,
  },
  box03Container: {
    borderColor: COLORS.black_01,
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 12,
  },
  box03Header: {
    backgroundColor: COLORS.black_01,
    paddingBottom: 20,
    borderRadius: 20,
    padding: 24,
  },
  box03Btn: {
    backgroundColor: COLORS.white_01,
    transform: [{rotate: "-45deg"}],
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    zIndex: 100,
    height: 48,
    width: 48,
    right: 24,
    top: 24,
  },
  box03Time: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    position: "absolute",
    fontSize: SIZES.f3,
    bottom: 20,
    right: 24,
  },
  box03Title: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  box03PosContainer: {
    flexDirection: "row",
  },
  box03Pos: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    lineHeight: 58,
    fontSize: 52,
  },
  box03PosIcon: {
    marginLeft: -2,
    marginTop: 1,
  },
  box03Date: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
    marginTop: -2,
  },
  box03Ranking: {
    padding: 12,
    gap: 4,
  },
  ownRankingItem: {
    backgroundColor: COLORS.black_01,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 2,
    height: 46,
  },
  rankingItem: {
    borderColor: COLORS.black_01,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 2,
    height: 46,
  },
  rankingPosContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 8,
    width: 80,
  },
  rankingPosIcon: {
    marginLeft: -4,
    marginTop: -6,
  },
  rankingPos: {
    fontFamily: "Inter_extraBold",
    color: COLORS.black_01,
    textAlign: "center",
    fontSize: SIZES.f4,
  },
  ownRankingItemInner: {
    backgroundColor: COLORS.blue_01,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 6,
    height: "100%",
    flex: 1,
  },
  rankingItemInner: {
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
  rankingUsername: {
    fontFamily: "Inter_extraBold",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  rankingTime: {
    fontFamily: "Inter_extraBold",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  battleText: {
    fontFamily: "Inter_extraBold",
    color: COLORS.black_01,
    fontSize: SIZES.f4,
    marginVertical: 4,
  }
});