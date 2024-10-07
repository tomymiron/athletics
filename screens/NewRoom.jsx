import { Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../constants/theme";
import { makeRequest } from "../constants/axios";
import { useAuth } from "../context/AuthContext";
import { useRoom } from "../context/RoomContext";
import Icon from "../constants/Icon";


export default function NewRoom({route}) {
  const [rounds, setRounds] = useState(3);
  const [times, setTimes] = useState(2);
  const [max, setMax] = useState(2);

  const { socketStart, socket, createRoom, newRoom, setRoomId, setIsJoined } = useRoom();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { name } = route.params;

  useEffect(() => {
    return socketStart();
  }, []);

 useEffect(() => {
    if(socket) newRoom(name);
  }, [socket]);

  const handleNewRoom = async () => {
    createRoom({name, max, times, rounds});
  }

  useEffect(() => {
    if (socket) {
        socket.on("create-room", (response) => {
            console.log("RES: ", response.roomId, "SUCCESS? ", response.success);
            if (response.success) {
                console.log("Nueva sala creada con exito:", response?.roomId);
                setRoomId(response?.roomId);
                setIsJoined(true);
                navigation.navigate("AdminRoomScreen", {room: response.room});
            }else console.log("Ocurrio un error")
        })
        return () => socket.off('create-room');;
    }
  }, [socket]);

  return (
    <>
      <ScrollView style={[styles.mainContainer, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: COLORS.black_01 }]} onPress={() => navigation.navigate("RoomsScreen")}>
          <Icon name="arrow-left" color={COLORS.blue_01} size={SIZES.i3} />
        </TouchableOpacity>

        <Text style={styles.subTitle}>Nueva Sala</Text>
        <Text style={styles.title}>{name}</Text>

        <View style={styles.box01Container}>
          <Text style={styles.box01Title}>Crea tu Sala</Text>
          <Text style={styles.box01SubTitle}>Determina algunos detalles para poder asi{"\n"}invitar a tus amigos y jugar de manera{"\n"}simultanea!</Text>
        </View>

        <View style={styles.box02Container}>
          <Text style={styles.box02Title}>Personaliza tu Sala</Text>
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderContainerLeft}>
              <Text style={styles.timeTitle}>Maximo de personas</Text>
              <Slider
                style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
                onValueChange={(value) => setMax(value)}
                maximumTrackTintColor={COLORS.black_02}
                minimumTrackTintColor={COLORS.blue_01}
                thumbTintColor={COLORS.blue_01}
                maximumValue={10}
                minimumValue={2}
                value={max}
                step={1}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{max}</Text>
            </View>
          </View>


          <View style={styles.sliderContainer}>
            <View style={styles.sliderContainerLeft}>
              <Text style={styles.timeTitle}>Tiempos de partida</Text>
              <Slider
                style={{width: Dimensions.get("screen").width * .55  - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
                onValueChange={(value) => setTimes(value)}
                maximumTrackTintColor={COLORS.black_02}
                minimumTrackTintColor={COLORS.blue_01}
                thumbTintColor={COLORS.blue_01}
                maximumValue={3}
                minimumValue={1}
                value={times}
                step={1}
              />
            </View>
            <View style={[styles.timeContainer, {width: 118}]}>
              <Text style={styles.time}>{times == 1 ? "Lento" : times == 2 ? "Medio" : "Rapido"}</Text>
            </View>
          </View>


          <View style={styles.sliderContainer}>
            <View style={styles.sliderContainerLeft}>
              <Text style={styles.timeTitle}>Cantidad de rondas</Text>
              <Slider
                style={{width: Dimensions.get("screen").width * .7 - 24 * 2, marginLeft: Platform.OS === "ios" ? 0 : -12}}
                onValueChange={(value) => setRounds(value)}
                maximumTrackTintColor={COLORS.black_02}
                minimumTrackTintColor={COLORS.blue_01}
                thumbTintColor={COLORS.blue_01}
                maximumValue={8}
                minimumValue={1}
                value={rounds}
                step={1}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{rounds}</Text>
            </View>
          </View>

        </View>

        <View style={{ height: 350 }} />
      </ScrollView>

      <View style={styles.createBtnContainer}>
        <TouchableWithoutFeedback onPress={handleNewRoom}>
          <View style={styles.createBtn}>
            <Text style={styles.createText}>Crear</Text>
            <TouchableOpacity style={styles.createInnerBtn} onPress={handleNewRoom}>
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
  box02Container: {
    borderColor: COLORS.black_01,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 12,
    borderRadius: 18,
    borderWidth: 3,
  },
  box02Title: {
    fontFamily: "Inter_bold",
    color: COLORS.black_01,
    fontSize: SIZES.f3 - 2,
  },
  inputsContainer: {
    gap: 4,
  },
  sliderContainer: {
    backgroundColor: COLORS.black_01,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    alignItems: "center",
    paddingVertical: 18,
    flexDirection: "row",
    borderRadius: 24,
  },
  sliderContainerLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  timeTitle: {
    fontFamily: "Inter_medium",
    color: COLORS.blue_01,
    lineHeight: SIZES.f6,
    fontSize: SIZES.f6,
  },
  timeContainer: {
    backgroundColor: COLORS.black_02,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    width: 68,
  },
  time: {
    fontFamily: "Inter_bold",
    color: COLORS.blue_01,
    fontSize: SIZES.f3,
  },
  createBtnContainer: {
    paddingHorizontal: 32,
    position: "absolute",
    bottom: 32,
  },
  createBtn: {
    backgroundColor: COLORS.black_01,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 24,
    width: "100%",
    padding: 24,
  },
  createText: {
    fontFamily: "Inter_extraBold",
    color: COLORS.blue_01,
    fontSize: SIZES.f1,
  },
  createInnerBtn: {
    backgroundColor: COLORS.blue_01,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    width: 48,
  },
});