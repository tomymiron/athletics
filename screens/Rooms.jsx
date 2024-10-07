import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../constants/theme";
import { makeRequest } from "../constants/axios";
import { useQuery } from "@tanstack/react-query";
import { timeSince } from "../constants/format";
import Icon from "../constants/Icon";

const regularExpression = /^[a-zA-Z0-9_]+$/;

export default function Rooms() {
  const [roomNameStatus, setRoomNameStatus] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState(null);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // --- RoomName Handling ---
  const { isRefetching: roomNameRefetching, isLoading: roomNameLoading, data: roomNameData, refetch: roomNameRefetch } = useQuery({
    queryFn: () => makeRequest.get("/room/name/check?name=" + roomName).then((res) => res.data),
    queryKey: ["roomName_check"],
    enabled: roomName != "" && roomName >= 4,
  });

  useEffect(() => {
    if (!roomNameRefetching && roomName.length >= 4 && regularExpression.test(roomName)) setRoomNameStatus(roomNameData?.inUse ? 2 : 3);
  }, [roomNameRefetching, roomNameLoading]);

  const getRooms = async () => {
    const res = await makeRequest.get("/room"); 
    return res.data;
  }

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["rooms", isFocused],
    queryFn: getRooms,
  });

  useEffect(() => {
    setRoomName("");
  }, [isFocused]);
  useEffect(() => {
    setRooms(data);
  }, [data])
  const handleFilter = (name) => {
    const filtered = data.filter(room => room.name.includes(name));
    setRooms(filtered);
  };

  useEffect(() => {
    if (roomName != "") {
      let timeoutId;
      const checkRoomNameValidity = (value) => {
        setRoomNameStatus(1);
        if (value.length < 4 || !regularExpression.test(value)) {
          setRoomNameStatus(2);
          return;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => roomNameRefetch(), 1000);
        }
      };
      checkRoomNameValidity(roomName);
      return () => clearTimeout(timeoutId);
    }
  }, [roomName]);

  const handleRoomName = async () => {
    if (roomNameStatus == 0) {
    } else if (roomNameStatus == 2 || roomNameStatus == 1) {
      setRoomName("");
      setRoomNameStatus(0);
    } else if (roomNameStatus == 3) {
        navigation.navigate("NewRoomScreen", {name: roomName});
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView style={[styles.mainContainer, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false} refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black_01} colors={[COLORS.blue_01]} progressBackgroundColor={COLORS.black_01} />}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: COLORS.black_01 }]} onPress={() => navigation.navigate("PracticeScreen")}>
        <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3} />
      </TouchableOpacity>

      <Text style={styles.subTitle}>Partidas Multijugador</Text>
      <Text style={styles.title}>Salas de Reaccion</Text>

      <View style={styles.roomNameContainer}>
        <TextInput style={styles.roomNameInput} placeholder="Nueva sala" value={roomName} onChangeText={setRoomName} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35} placeholderTextColor={COLORS.gray_01}/>
        <TouchableOpacity onPress={handleRoomName} style={ roomNameStatus == 0 ? styles.roomNameBtn : roomNameStatus == 1 ? styles.checkingRoomNameBtn : roomNameStatus == 2 ? styles.errorRoomNameBtn : styles.changeRoomNameBtn}>
          <Icon name={ roomNameStatus == 3 || roomNameStatus == 0 ? "plus" : roomNameStatus == 1 ? "clock" : "close"} size={SIZES.i3} color={ roomNameStatus == 0 ? COLORS.black_01 : roomNameStatus == 1 ? COLORS.purple_01 : roomNameStatus == 2 ? COLORS.red_01 : COLORS.white_01}/>
        </TouchableOpacity>
      </View>

      <View style={styles.box01Container}>
        <Text style={styles.box01Title}>Salas de Partidas</Text>
        <Text style={styles.box01SubTitle}>Aqui podras encontrar y crear salas a las{"\n"}cuales unirte, jugar con tus amigos y{"\n"}desafiar los limites de tu reaccion!</Text>
      </View>

      <View style={styles.searchInputContainer}>
        <Icon name="search" color={COLORS.black_01} size={SIZES.i3 - 2}/>
        <TextInput placeholder="Buscador" placeholderTextColor={COLORS.black_01} style={styles.searchInput} maxLength={35} onChangeText={(value) => handleFilter(value)} autoCapitalize="none" autoCorrect={false} spellCheck={false}/>
      </View>

      <View style={styles.roomsContainer}>
        {rooms != null && rooms != undefined ? rooms.length > 0 ? rooms.map((item) => {
            return (
              <TouchableWithoutFeedback key={item.id} onPress={() => navigation.navigate("RoomScreen", {room: item })}>
                <View style={styles.roomContainer}>
                  <Text style={styles.roomName}>{item.name}</Text>
                  <Text style={styles.roomPeople}>{item.active_users.toString().padStart(2, "0")}<Text style={styles.roomPeopleMax}>/{item.max.toString().padStart(2, "0")}</Text></Text>
                  <Text style={styles.roomDate}>Creada hace {timeSince(item.created_at)}</Text>
                  <TouchableOpacity style={styles.roomBtn} onPress={() => navigation.navigate("RoomScreen", {room: item })}>
                    <Icon color={COLORS.black_01} name="arrow-right" size={SIZES.i3}/>
                  </TouchableOpacity>
                  <View style={styles.roomCreatorContainer}>
                    <Text style={styles.roomCreatorDescription}>creador</Text>
                    <Text style={styles.roomCreator}>{item.username}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )
          })
          :
          <View style={styles.roomContainer}>
            <Text style={styles.roomName}>Ninguna Sala</Text>
            <Text style={styles.roomDate}>Crea una sala tu mismo!</Text>
          </View>
        :
        <View style={styles.loadContainer}>
          <ActivityIndicator color={COLORS.blue_01} size="large" />
        </View>
        }
      </View>

      <View style={{ height: 200 }} />
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
  title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    lineHeight: SIZES.f1,
    fontSize: SIZES.f1,
  },
  roomNameContainer: {
    flexDirection: "row",
    marginTop: 12,
    height: 54,
    gap: 8,
  },
  roomNameInput: {
    backgroundColor: COLORS.black_01,
    fontFamily: "Inter_semiBold",
    color: COLORS.white_01,
    fontSize: SIZES.f3,
    borderRadius: 27,
    paddingHorizontal: 16,
    height: "100%",
    flex: 1,
  },
  roomNameBtn: {
    borderColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    borderWidth: 3,
    height: "100%",
    width: 54,
  },
  checkingRoomNameBtn: {
    backgroundColor: COLORS.black_01,
    borderColor: COLORS.purple_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    borderWidth: 3,
    height: "100%",
    width: 54,
  },
  errorRoomNameBtn: {
    backgroundColor: COLORS.black_01,
    borderColor: COLORS.red_01,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    height: "100%",
    width: 54,
  },
  changeRoomNameBtn: {
    backgroundColor: COLORS.black_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 27,
    height: "100%",
    width: 54,
  },

  box01Container: {
    backgroundColor: COLORS.black_01_10,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    marginTop: 12,
    gap: 8,
  },
  box01Title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    textAlign: "center",
    fontSize: SIZES.f1,
  },
  box01SubTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.black_02,
    textAlign: "center",
    fontSize: SIZES.f5,
  },
  roomsContainer: {
    marginTop: 12,
    gap: 4,
  },
  roomContainer: {
    backgroundColor: COLORS.black_01,
    borderRadius: 24,
    padding: 24,
  },
  roomName: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  roomPeople: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    marginTop: 4,
    fontSize: 52,
  },
  roomPeopleMax: {
    fontSize: SIZES.f4
  },
  roomDate: {
    fontFamily: "Inter_regular",
    color: COLORS.blue_01,
    fontSize: SIZES.f5,
  },
  roomBtn: {
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
  roomCreatorContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  roomCreatorDescription: {
    fontFamily: "Inter_medium",
    color: COLORS.blue_01,
    fontSize: SIZES.f6,
  },
  roomCreator: {
    fontFamily: "Inter_black",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
    marginTop: -2,
  },
  searchInputContainer: {
    borderColor: COLORS.black_01,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 3,
    marginTop: 12,
    padding: 12,
    gap: 4,
  },
  searchInput: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    fontSize: SIZES.f4,
    width: "90%",
  },
  loadContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
  },
});