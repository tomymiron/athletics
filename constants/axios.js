import Constants from "expo-constants";
import axios from "axios";

export const makeRequest = axios.create({
    baseURL: Constants.expoConfig.env.api_url,
    withCredentials: true,
})