import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import Constants from "expo-constants";
import { Alert } from "react-native";
import io from "socket.io-client";

const API_URL = Constants.expoConfig.env.api_url;
const RoomContext = createContext();

export const useRoom = () => {
    return useContext(RoomContext);
};

export const RoomProvider = ({children}) => {
    const { authState } = useAuth();
    const [isJoined, setIsJoined] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [socket, setSocket] = useState(null);

    const socketStart = () => {
        const newSocket = io(API_URL);
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }

    const joinRoom = (newRoomId) => {
        if (!newRoomId) {
            console.error("No se puede unir a la sala: ID de sala no proporcionado");
            return;
        }
    
        socket.emit("join-room", {roomId: newRoomId, token: authState.token}, (response) => {
            if (response.success) {
                console.log("Unido a la sala:", newRoomId);
                setRoomId(newRoomId);
                setIsJoined(true);
            } else {
                console.error("Error al unirse a la sala:", response.message);
            }
        });
    };

    const newRoom = (newName) => {
        if (newName.trim()) {
            socket.emit("new-room", newName);
        } else Alert.alert("Por favor, ingresa un nombre para la sala");
    }

    const createRoom = (newRoom) => {
        if (!newRoom) {
            console.error("Nueva sala no valida");
            return;
        }
    
        socket.emit("create-room", {newRoom: newRoom, token: authState.token});
    }

    const markReady = (roomId) => {
        socket.emit('mark-ready', { roomId: roomId, token: authState.token });
    }

    const value = { markReady, newRoom, createRoom, roomId, socket, socketStart, joinRoom, setIsJoined, isJoined, setRoomId };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
}