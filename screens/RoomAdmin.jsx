import { StyleSheet, Text, View, Button } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useRoom } from "../context/RoomContext";

export default function RoomAdmin({ route }) {
  const { socketStart, socket, joinRoom } = useRoom();
  const navigation = useNavigation();
  const { room } = route.params;
  const roomId = room.roomId;

  const handleDisconnectAndGoBack = () => {
    if (socket) socket.disconnect();
    navigation.navigate("RoomsScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomText}>Room ID: {roomId}</Text>
      <Button title="Salir y desconectar" onPress={handleDisconnectAndGoBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  roomText: {
    fontSize: 24,
    marginBottom: 20,
  },
});
