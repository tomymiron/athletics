import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH, COLORS, SIZES } from "../constants/theme.js";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext.jsx";
import { makeRequest } from "../constants/axios.js";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Icon from "../constants/Icon.jsx";
import { Image } from "expo-image";

import background03 from "../assets/images/background03.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const passRegex = /^\S{6,}$/;

export default function Register() {
    const [usernameStatus, setUsernameStatus] = useState(0);
    const [passVisible, setPassVisible] = useState(true);
    const [emailStatus, setEmailStatus] = useState(0);
    const [passStatus, setPassStatus] = useState(0);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [creating, setCreating] = useState(false);
    const [errMsg, setErrMsg] = useState("Ingresa los datos solicitados");

    const { register, login, authState } = useAuth();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const handleRegister = () => {
        if(creating == false){
            setCreating(true);
            try {
                if(usernameStatus == 3 && emailStatus == 3 && passStatus == 3){
                    setErrMsg("Creando usuario...");
                    register({ username, email, pass })
                    .then(() => { login({user: email, pass}) })
                    .catch((error) => { Alert.alert("Ocurrio un error, reintentalo nuevamente"); });
                } else {
                    if (usernameStatus != 3) {
                        setErrMsg("Username no valido")
                    } else if (emailStatus != 3) {
                        setErrMsg("Email no valido")
                    } else if (passStatus != 3) {
                        setErrMsg("Contraseña no valida")
                    }
                }
            } finally {
                setCreating(false);
            }
        } 
    };


    const { isRefetching: usernameRefetching, data: usernameData, refetch: usernameRefetch } = useQuery({
        queryFn: () => makeRequest.get("/user/username/check?username=" + username).then((res) => res.data),
        enabled: username != "" && username.length >= 4,
        queryKey: ["username_check"],
    });
    useEffect(() => {
        if(!usernameRefetching && username.length >= 4 && usernameRegex.test(username)) setUsernameStatus(usernameData.inUse ? 2 : 3);
    }, [usernameRefetching]);
    useEffect(() => {
        if(username != "") {
            let timeoutId;
            const checkUsernameValidity = (value) => {
            setUsernameStatus(1);
            if (value.length < 4 || !usernameRegex.test(value)) { setUsernameStatus(2); return; }
            else { clearTimeout(timeoutId); timeoutId = setTimeout(() => { usernameRefetch(); }, 1000);}
            };
            checkUsernameValidity(username);
            return () => { clearTimeout(timeoutId); };
        }
    }, [username]);
    const { isRefetching: emailRefetching, data: emailData, refetch: emailRefetch } = useQuery({
        queryFn: () => makeRequest.get("/user/email/check?email=" + email).then((res) => res.data),
        queryKey: ["email_check"],
        enabled: email != "",
    });
    useEffect(() => {
        if (!emailRefetching && emailRegex.test(email)) { setEmailStatus(emailData.inUse ? 2 : 3); }
    }, [emailRefetching, emailData]);
    useEffect(() => {
        if (email != "") {
            let timeoutId2;
            const checkEmailValidity = (value) => {
                setEmailStatus(1);
                if (!emailRegex.test(value)) { setEmailStatus(2); return; }
                else { clearTimeout(timeoutId2); timeoutId2 = setTimeout(() => {emailRefetch(); }, 1000);}
            };
            checkEmailValidity(email);
            return () => { clearTimeout(timeoutId2); };
        }
    }, [email]);
    const handlePassChange = (value) => {
        setPass(value);
        setPassStatus(passRegex.test(value) ? 3 : 2);
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.backgroundContainer}>
                <View style={styles.backgroundImage}><Image cachePolicy="memory" style={{width: "100%", height: "100%"}} source={background03} transition={250} placeholder={BLURHASH.black_01}/></View>
                <LinearGradient style={styles.backgroundGradientEffect} colors={[COLORS.blue_01, "#000A"]} start={[0, 1]} end={[1, 0]} />
            </View>


            <View style={[styles.container, {paddingTop: insets.top + 24, paddingBottom: 32}]}>
                <Text style={styles.title}>Nuevo en{"\n"}Athletics Labs!</Text>

                <View style={styles.body}>
                    <View style={styles.statusContainer}>
                        <Text style={styles.status}>{errMsg}</Text>
                    </View>

                    <View style={styles.registerContainer}>
                        <View>
                            <TextInput readOnly={creating} style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={COLORS.white_02} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35}/>
                            <View style={styles.inputStatus}>
                                <Icon name={usernameStatus == 3 || usernameStatus == 0 ? "check" : usernameStatus == 1 ? "clock" : "close"} size={SIZES.i3} color={usernameStatus == 0 ? COLORS.black_01 : usernameStatus == 1 ? COLORS.white_01 : usernameStatus == 2 ? COLORS.red_01 : COLORS.blue_01}/>
                            </View>
                        </View>
                        <View>
                            <TextInput readOnly={creating} style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={COLORS.white_02} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={360} />
                            <View style={styles.inputStatus}>
                                <Icon name={emailStatus == 3 || emailStatus == 0 ? "check" : emailStatus == 1 ? "clock" : "close"} size={SIZES.i3} color={emailStatus == 0 ? COLORS.black_01 : emailStatus == 1 ? COLORS.white_01 : emailStatus == 2 ? COLORS.red_01 : COLORS.blue_01} />
                            </View>
                        </View>

                        <View style={styles.passwordContainer}>

                            <View style={{flex: 1}}>
                                <TextInput readOnly={creating} style={[styles.input, {flex: 1,}]} value={pass} onChangeText={handlePassChange} placeholder="Contraseña" placeholderTextColor={COLORS.white_02} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35} secureTextEntry={passVisible}/>
                                <View style={styles.inputStatus}>
                                    <Icon
                                        name={passStatus == 3 ? "check" : "close"}
                                        size={SIZES.i3}
                                        color={passStatus == 0 ? COLORS.black_01 : passStatus == 2 ? COLORS.red_01 : COLORS.blue_01}
                                    />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.passwordBtn} onPress={() => setPassVisible(!passVisible)}>
                                <Icon name={passVisible ? "close-eye" : "open-eye"} color={COLORS.white_01} size={SIZES.i3}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableWithoutFeedback onPress={() => handleRegister()}>
                            <View style={styles.registerBtn}>
                                <Text style={styles.register}>Crear Cuenta</Text>
                                <TouchableOpacity style={styles.registerIcon} onPress={() => handleRegister()}>
                                    <Icon name="arrow-right" color={COLORS.blue_01} size={SIZES.i3}/>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    <View style={styles.registerIndicator}>
                        <Icon name="user-circle" color={COLORS.black_01} size={SIZES.i3}/>
                        <Text style={styles.registerIndicatorText}>Registro</Text>
                    </View>

                </View>

                <TouchableWithoutFeedback onPress={() => navigation.navigate("Login")}>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Login")}>
                            <Icon name="arrow-left" size={SIZES.i3} color={COLORS.black_01}/>
                        </TouchableOpacity>
                        <Text style={styles.footerSubTitle}>Ya eres athletic?</Text>
                        <Text style={styles.footerTitle}>Inicia Sesion</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.blue_01,
        flex: 1,
    },
    backgroundContainer: {
       position: "absolute",
       height: "100%",
       width: "100%",
       zIndex: -1,
       left: 0,
       top: 0,
    },
    backgroundImage: {
        flex: 1,
    },
    backgroundGradientEffect: {
        position: "absolute",
        height: "100%",
        width: "100%",
    },

    container: {
        justifyContent: "space-between",
        flexDirection: "column",
        paddingHorizontal: 20,
        height: "100%",
        width: "100%",
    },
    title: {
        fontFamily: "Inter_bold",
        color: COLORS.white_01,
        textAlign: "center",
        fontSize: 38,
    },

    body: {
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        marginTop: -32,
        flex: 1,
    },
    statusContainer: {
        backgroundColor: COLORS.black_01_50,
        borderRadius: 4,
        padding: 8,
    },
    status: {
        fontFamily: "Inter_semiBold",
        color: COLORS.white_01,
        fontSize: SIZES.f6,
    },
    registerContainer: {
        backgroundColor: COLORS.black_01_10,
        borderRadius: 12,
        width: "100%",
        padding: 12,
        gap: 4,
    },
    input: {
        backgroundColor: COLORS.black_01,
        fontFamily: "Inter_regular",
        color: COLORS.white_01,
        paddingHorizontal: 14,
        alignItems: "center",
        fontSize: SIZES.f4,
        borderRadius: 12,
        height: 54,
    },
    inputStatus: {
        position: "absolute",
        borderRadius: 6,
        height: 12,
        width: 12,
        right: 24,
        top: 15,
    },

    // errInput: {},
    passwordContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 8,
    },
    passwordBtn: {
        backgroundColor: COLORS.black_01,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 27,
        height: 54,
        width: 54,
    },
    registerBtn: {
        backgroundColor: COLORS.blue_01,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 24,
        width: "100%",
        marginTop: 4,
        padding: 24,

        shadowOffset: { width: -4, height: 4 },
        shadowOpacity: 0.25,
        shadowColor: "#000",
        shadowRadius: 8,
        elevation: 8,
    },
    register: {
        fontFamily: "Inter_extraBold",
        color: COLORS.black_01,
        fontSize: SIZES.f1,
    },
    registerIcon: {
        backgroundColor: COLORS.black_01,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        height: 48,
        width: 48,
    },
    registerIndicator: {
        backgroundColor: COLORS.blue_01_50,
        flexDirection: "row",
        borderRadius: 12,
        padding: 8,
        gap: 8,
    },
    registerIndicatorText: {
        fontFamily: "Inter_medium",
        color: COLORS.black_01,
        fontSize: SIZES.f4,
        marginRight: 4,
    },
    footer: {
        backgroundColor: COLORS.black_01,
        alignItems: "flex-end",
        paddingHorizontal: 24,
        marginHorizontal: 4,
        paddingVertical: 32,
        borderRadius: 24,
    },
    footerBtn: {
        backgroundColor: COLORS.blue_01,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        borderRadius: 24,
        zIndex: 100,
        height: 48,
        width: 48,
        left: 12,
        top: 12,
    },
    footerSubTitle: {
        fontFamily: "Inter_bold",
        color: COLORS.blue_01,
        lineHeight: SIZES.f3,
        fontSize: SIZES.f3,
    },
    footerTitle: {
        fontFamily: "Inter_black",
        color: COLORS.blue_01,
        marginBottom: -4,
        lineHeight: 48,
        fontSize: 42,
    },
});
