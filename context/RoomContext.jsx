import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import axios from "axios";

const API_URL = Constants.expoConfig.env.api_url;
const RoomContext = createContext();

export const useRoom = () => {
    return useContext(RoomContext);
};

export const RoomProvider = ({children}) => {
    const [isJoined, setIsJoined] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");

    const value = { isJoined, setIsJoined, roomCode, setRoomCode, socket, setSocket, message, setMessage };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    );
}