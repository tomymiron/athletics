import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";
import { useRoom } from "../context/RoomContext";
import React, { useEffect, useState } from "react";
import Icon from "../constants/Icon";

export default function Room({ route }) {
  const [notReadyPlayers, setNotReadyPlayers] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const { socketStart, socket, joinRoom, markReady } = useRoom();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { room } = route.params;
  const roomId = room.id;
  console.log("ROOM: ", room, roomId)

  useEffect(() => {
    return socketStart();
  }, []);

  useEffect(() => {
    if (socket && roomId) {
      joinRoom(roomId);

      socket.on("player-ready", (count) => {
        setNotReadyPlayers(count.notReadyCount);
      });

      socket.on("start-game", () => {
        setGameStarted(true);
        console.log("Todos los jugadores están listos. Comienza el juego.");
      });

      return () => {
        socket.off("player-ready");
        socket.off("all-players-ready");
      }
    }
  }, [socket, roomId, joinRoom]);

  const surrender = () => {
    if (socket) socket.disconnect();
    navigation.navigate("RoomsScreen");
  };

  const ready = () => {
    if (socket) markReady(roomId);
  }

  return (
    <>
      <ScrollView style={[styles.mainContainer, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={surrender}>
          <Text style={styles.backText}>Abandonar</Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>Sala de {room.username}</Text>
        <Text style={styles.title}>{room.name}</Text>

        <View style={styles.box01Container}>
          <Text style={styles.box01Title}>Proxima Ronda</Text>
          <Text style={styles.box01Users}>04<Text style={styles.box01MaxUsers}>/05</Text></Text>
          <Text style={styles.box01SubTitle}>{gameStarted == true ? "Todos listos!" : "Esperando... "}<Text style={styles.box01UsersPending}>{gameStarted == false && notReadyPlayers > 1 ? (notReadyPlayers + " Jugadores") : "1 Jugador"}</Text></Text>
        </View>

        <View style={styles.box02Container}>
          <Text style={styles.box02Title}>Esperando Inicio</Text>
          <Text style={styles.box02SubTitle}>Aqui podras encontrar y crear salas a las{"\n"}cuales unirte, jugar con tus amigos y{"\n"}desafiar los limites de tu reaccion!</Text>
        </View>

        <View style={styles.roundContainer}>
          <View style={styles.roundHeader}>
            {/* {isLoading || isRefetching ? <ActivityIndicator size="large" color={COLORS.blue_01}/> : */}
            <>
              <Text style={styles.roundStatus}>Ronda {"02"}/{"05"}</Text>
              <Text style={styles.roundTitle}>Parcial</Text>
              <Text style={styles.roundSubTitle}>Tabla de ronda</Text>
            </>
            {/* } */}
          </View>

          <View style={styles.roundRanking}>
            {/* { data?.ranking == null ?
              <ActivityIndicator size="large" color={COLORS.black_01} />
              :
              data.ranking.map(item => 
                <View key={item.user_id} style={item.user_id == authState.user.id ? styles.ownRankingItem : styles.rankingItem}>
                  <View style={styles.rankingPosContainer}>
                    <Text style={[styles.rankingPos, {color: item.user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01}]}>{item.ranking}</Text>
                    <View style={styles.rankingPosIcon}>
                      <Icon name="pos" color={item.user_id == authState.user.id ? COLORS.blue_01 : COLORS.black_01} size={SIZES.i4}/>
                    </View>
                  </View>
                  <View style={item.user_id == authState.user.id ? styles.ownRankingItemInner : styles.rankingItemInner}>
                    <Text style={[styles.rankingUsername, {color: item.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{item.username.length > 18 ? item.username.slice(0,18) + "..." : item.username}</Text>
                    <Text style={[styles.rankingTime, {color: item.user_id == authState.user.id ? COLORS.black_01 : COLORS.blue_01}]}>{parseInt(item.avg_time)}ms</Text>
                  </View>
                </View>
              )} */}
          </View>
        </View>

        <View style={{height: 200}}/>
      </ScrollView>

      <View style={styles.readyBtnContainer}>
        <TouchableWithoutFeedback onPress={ready}>
          <View style={styles.readyBtn}>
            <Text style={styles.readyText}>Listo</Text>
            <TouchableOpacity style={styles.readyInnerBtn} onPress={ready}>
              <Icon name="check" color={COLORS.black_01} size={SIZES.i3}/>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.blue_01,
    paddingHorizontal: 24,
    flex: 1,
  },
  backButton: {
    backgroundColor: COLORS.black_01,
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    alignItems: "center",
    borderRadius: 24,
    padding: 14,
    height: 48,
  },
  backText: {
    fontFamily: "Inter_black",
    color: COLORS.white_01,
    lineHeight: SIZES.f4,
    fontSize: SIZES.f5,
  },
  subTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.black_01,
    lineHeight: SIZES.f3,
    fontSize: SIZES.f3,
    marginBottom: 4,
    marginTop: 24,
  },
  title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },
  box01Container: {
    backgroundColor: COLORS.black_01,
    borderRadius: 24,
    marginTop: 12,
    padding: 24,
  },
  box01Title: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  box01Users: {
    fontFamily: "Inter_black",
    color: COLORS.white_01,
    fontSize: 52,
  },
  box01MaxUsers: {
    fontFamily: "Inter_black",
    color: COLORS.white_01,
    fontSize: SIZES.f4,
  },
  box01SubTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  box01UsersPending: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  box02Container: {
    backgroundColor: COLORS.black_01_10,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    marginTop: 12,
    gap: 8,
  },
  box02Title: {
      fontFamily: "Inter_bold",
      color: COLORS.black_01,
      textAlign: "center",
      fontSize: SIZES.f1,
      marginBottom: -4,
  },
  box02SubTitle: {
      fontFamily: "Inter_medium",
      color: COLORS.black_02,
      textAlign: "center",
      fontSize: SIZES.f5,
  },
  readyBtnContainer: {
    paddingHorizontal: 32,
    position: "absolute",
    bottom: 32,
  },
  readyBtn: {
    backgroundColor: COLORS.black_01,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 24,
    width: "100%",
    padding: 24,
  },
  readyText: {
    fontFamily: "Inter_extraBold",
    color: COLORS.blue_01,
    fontSize: SIZES.f1,
  },
  readyInnerBtn: {
    backgroundColor: COLORS.blue_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    width: 48,
  },


  roundContainer: {
    borderColor: COLORS.black_01,
    borderRadius: 24,
    borderWidth: 2,
    marginTop: 12,
  },
  roundHeader: {
    backgroundColor: COLORS.black_01,
    paddingBottom: 20,
    borderRadius: 20,
    padding: 24,
  },
  roundBtn: {
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
  roundTime: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    position: "absolute",
    fontSize: SIZES.f3,
    bottom: 20,
    right: 24,
  },
  roundStatus: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
    marginBottom: -8,
  },
  roundTitle: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    fontSize: 52,
  },
  roundSubTitle: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  roundPosContainer: {
    flexDirection: "row",
  },
  roundPos: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    lineHeight: 58,
    fontSize: 52,
  },
  roundPosIcon: {
    marginLeft: -2,
    marginTop: 1,
  },
  roundDate: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
    marginTop: -2,
  },
  roundRanking: {
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
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
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
})