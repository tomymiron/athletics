import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSyncAttemptsWithServer } from "../services/syncService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";
import { makeRequest } from "../constants/axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import Icon from "../constants/Icon";

export default function StartPracticeRankingMonthly() {
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { authState } = useAuth();
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
    const res = await makeRequest.get("/practice/ranking/monthly", { headers: { authorization: authState.token }}); 
    return res.data;
  }

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["rankingMonthly"],
    queryFn: getRanking,
  });

  return (
    <ScrollView style={[styles.mainContainer, {paddingTop: insets.top + 12}]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black_01} colors={[COLORS.blue_01]} progressBackgroundColor={COLORS.black_01}/>}>
      
      <TouchableOpacity style={[styles.backButton, {backgroundColor: COLORS.black_01}]} onPress={() => navigation.navigate("PracticeRankingScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3}/>
      </TouchableOpacity>

      <Text style={styles.subTitle}>Athletics <Text style={styles.subTitleBold}>Labs</Text></Text>
      <Text style={styles.title}>Ranking Mensual</Text>

      <View style={styles.box01Container}>
        <View style={styles.box01Header}>
          {isLoading || isRefetching ?
          <ActivityIndicator size="large" color={COLORS.blue_01} />
          :
          <>
            {data?.ownRanking?.bestTime ? <Text style={styles.box01Time}>{data.ownRanking.bestTime}ms</Text> : ""}


            <Text style={styles.box01Title}>Tu Ranking</Text>
            {data?.ownRanking?.ranking ?
            <View style={styles.box01PosContainer}>
              <Text style={styles.box01Pos}>{data.ownRanking.ranking}</Text>
              <View style={styles.box01PosIcon}>
                <Icon name="pos" color={COLORS.blue_01} size={SIZES.i3}/>
              </View>
            </View>
            :
            <Text style={styles.box01Pos}>-</Text>}
            <Text style={styles.box01Date}>Mejor Test del Mes</Text>
          </>}
        </View>

        <View style={styles.box01Ranking}>

          {
            data?.ranking == null ?
            <ActivityIndicator size="large" color={COLORS.black_01} />
            :
            data?.ranking.map(item => 
              <View key={item.user_id} style={item.user_id == authState.user.id ? styles.ownRankingItem : styles.rankingItem}>
                <View style={styles.rankingPosContainer}>
                  <Text style={[styles.rankingPos, {color: item.user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01}]}>{item.ranking}</Text>
                  <View style={styles.rankingPosIcon}>
                    <Icon name="pos" color={item.user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01} size={SIZES.i4}/>
                  </View>
                </View>
                <View style={item.user_id == authState.user.id ? styles.ownRankingItemInner : styles.rankingItemInner}>
                  <Text style={[styles.rankingUsername, {color: item.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{item.username.length > 18 ? item.username.slice(0,18) + "..." : item.username}</Text>
                  <Text style={[styles.rankingTime, {color: item.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{item.bestTime}ms</Text>
                </View>
              </View>
              )
          }
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
  box01Container: {
    borderColor: COLORS.black_01,
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 12,
  },
  box01Header: {
    backgroundColor: COLORS.black_01,
    paddingBottom: 20,
    borderRadius: 20,
    padding: 24,
  },
  box01Btn: {
    backgroundColor: COLORS.white_01,
    transform: [{rotate: "-45deg"}],
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    borderRadius: 24,
    height: 48,
    width: 48,
    right: 24,
    top: 24,
  },
  box01Time: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    position: "absolute",
    fontSize: SIZES.f3,
    bottom: 20,
    right: 24,
  },
  box01Title: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  box01PosContainer: {
    flexDirection: "row",
  },
  box01Pos: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    lineHeight: 58,
    fontSize: 52,
  },
  box01PosIcon: {
    marginLeft: -2,
    marginTop: 1,
  },
  box01Date: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
    marginTop: -2,
  },
  box01Ranking: {
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
  
});