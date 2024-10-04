// import { StyleSheet, View, Text, Button, TextInput, Alert } from 'react-native';
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";

// const SERVER_URL = 'https://api.athleticslabs.site'; 

// export default function Rooms() {
//   const [isJoined, setIsJoined] = useState(false);
//   const [roomCode, setRoomCode] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     // Conéctate al servidor
//     const newSocket = io(SERVER_URL, { transports: ["websocket"] });
//     setSocket(newSocket);

//     return () => newSocket.disconnect();
//   }, []);

//   // Unirse a la sala
//   const joinRoom = () => {
//     if (roomCode.trim()) {
//       socket.emit("join-room", roomCode); // Envía el código de sala al servidor
//       setIsJoined(true);
//     } else {
//       Alert.alert("Por favor, ingresa un código de sala");
//     }
//   };

//   useEffect(() => {
//     if (socket) {
//       // Escuchar cuando el juego empieza
//       socket.on("start-game", (msg) => {
//         setMessage(msg); // Muestra el mensaje cuando ambos jugadores están conectados
//       });

//       // Escuchar cuando la sala está llena
//       socket.on("room-full", (msg) => {
//         Alert.alert("Error", msg);
//         setIsJoined(false);
//       });
//     }
//   }, [socket]);

//   return (
//     <View style={styles.container}>
//       {!isJoined ? (
//         <View>
//           <TextInput
//             placeholder="Código de sala"
//             value={roomCode}
//             onChangeText={setRoomCode}
//             style={{
//               borderColor: "gray",
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 10,
//               width: 200,
//               textAlign: "center",
//             }}
//           />
//           <Button title="Unirse a la sala" onPress={joinRoom} />
//         </View>
//       ) : (
//         <Text>
//           {message || `Esperando más jugadores en la sala: ${roomCode}`}
//         </Text>
//       )}
//     </View>
//   );
// };
  
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//   });


import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../constants/theme";
import { makeRequest } from "../constants/axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import Icon from "../constants/Icon";

const regularExpression = /^[a-zA-Z0-9_]+$/;

export default function Rooms() {
  const [roomNameStatus, setRoomNameStatus] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [roomName, setRoomName] = useState("");

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { authState } = useAuth();

  //   const getRooms = async () => {
  //     const res = await makeRequest.get("/rooms", { headers: { authorization: authState.token }});
  //     return res.data;
  //   }

  //   const { data: rooms, isLoading, isRefetching, refetch } = useQuery({
  //     queryKey: ["rooms"],
  //     queryFn: getRooms,
  //   });

  // --- RoomName Handling ---
  const { isRefetching: roomNameRefetching, data: roomNameData, refetch: roomNameRefetch } = useQuery({
    queryFn: () => makeRequest.get("/room/name/check?name=" + roomName).then((res) => res.data),
    queryKey: ["roomName_check"],
    enabled: roomName != "" && roomName >= 4,
  });

  useEffect(() => {
    if (!roomNameRefetching && roomName.length >= 4 && regularExpression.test(roomName)) setRoomNameStatus(roomNameData?.inUse ? 2 : 3);
  }, [roomNameRefetching]);

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
  // --- RoomName Handling ---

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
        <TextInput style={styles.roomNameInput} placeholder="Nueva sala" value={roomName} onChangeText={setRoomName} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35}/>
        <TouchableOpacity onPress={handleRoomName} style={ roomNameStatus == 0 ? styles.roomNameBtn : roomNameStatus == 1 ? styles.checkingRoomNameBtn : roomNameStatus == 2 ? styles.errorRoomNameBtn : styles.changeRoomNameBtn}>
          <Icon name={ roomNameStatus == 3 || roomNameStatus == 0 ? "plus" : roomNameStatus == 1 ? "clock" : "close"} size={SIZES.i3} color={ roomNameStatus == 0 ? COLORS.black_01 : roomNameStatus == 1 ? COLORS.purple_01 : roomNameStatus == 2 ? COLORS.red_01 : COLORS.white_01}/>
        </TouchableOpacity>
      </View>

      <View style={styles.box01Container}>
        <Text style={styles.box01Title}>Salas de Partidas</Text>
        <Text style={styles.box01SubTitle}>Aqui podras encontrar y crear salas a las{"\n"}cuales unirte, jugar con tus amigos y{"\n"}desafiar los limites de tu reaccion!</Text>
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
});