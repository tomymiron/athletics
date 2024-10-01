import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import axios from "axios";

const API_URL = Constants.expoConfig.env.api_url;
const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
    const [authState, setAuthState] = useState({
        authenticated: null,
        token: null,
        user: null,
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        const loadTokenUser = async () => {
            const token = await SecureStore.getItemAsync("TOKEN_KEY");
            const user = JSON.parse(await SecureStore.getItemAsync("USER_KEY"));

            if(token && user){
                setAuthState({
                    token: token,
                    user: user,
                    authenticated: true
                });
            }else{
                setAuthState({
                    token: null,
                    user: null,
                    authenticated: false
                });
            }
        };
        loadTokenUser();
    }, []);

    const register = async (user) => {
        try {
            return await axios.post(`${API_URL}/auth/register`, {newUser: user});
        }catch (err){
            if(err){
                const { response } = err;
                const { request, ...errorObject } = response;
                return errorObject.data;
            }
        }
    }

    const login = async (user, pass) => {
        try {
            const result = await axios.post(`${Constants.expoConfig.env.api_url}/auth/login`, {user, pass});

            setAuthState({
                token: result.data.token,
                user: result.data.user,
                authenticated: true
            });
            await SecureStore.setItemAsync("TOKEN_KEY", result.data.token);
            await SecureStore.setItemAsync("USER_KEY", JSON.stringify(result.data.user));
            
            return result.data;
        }catch (err){
            if(err){
                const { response } = err;
                const { request, ...errorObject } = response;
                if(errorObject.status != 500) return errorObject;
                else return {data: "Ocurrio un error en el servidor"};
            }
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync("TOKEN_KEY");
        await SecureStore.deleteItemAsync("USER_KEY");
        await SecureStore.deleteItemAsync("lastSyncedAt");

        queryClient.clear()

        setAuthState({
            token: null,
            user: null,
            authenticated: false
        });
    };

    const editProfile = async (prop, value) => {
        try {
            const aux = { ...authState }
            aux.user[prop] = value;
            setAuthState(aux);
            await SecureStore.setItemAsync("USER_KEY", JSON.stringify(aux.user));
        }catch(err){}
    };

    const value = { register, login, logout, authState, editProfile };
    
    return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>);
}