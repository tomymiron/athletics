import { StyleSheet, Text, View, TouchableOpacity, TextInput, TouchableWithoutFeedback } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH, COLORS, SIZES } from "../constants/theme.js";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../constants/Icon.jsx";
import React, { useState } from "react";
import { Image } from "expo-image";

import background02 from "../assets/images/background02.png";

export default function Login() {
    const [errMsg, setErrMsg] = useState("Ingresa con tu cuenta athletics");
    const [passVisible, setPassVisible] = useState(true);
    const [logining, setLogining] = useState(false);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { login } = useAuth();

    const handleLogin = () => {
        if(logining == false){
            setLogining(true);
            try {
                if(user.trim().length >= 4 && pass.length >= 6){
                    setErrMsg("Ingresando...");
                    login({ user, pass })
                    .then((data) => {setErrMsg(data.data)})
                } else {
                    if (user.trim().length < 4) {
                        setErrMsg("Usuario no valido")
                    } else if (pass.length < 6) {
                        setErrMsg("Contraseña no valida")
                    }
                }
            } finally {
                setLogining(false);
            }
        } 
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.backgroundContainer}>
                <View style={styles.backgroundImage}><Image cachePolicy="memory" style={{width: "100%", height: "100%"}} source={background02} transition={250} placeholder={BLURHASH.black_01}/></View>
                <LinearGradient style={styles.backgroundGradientEffect} colors={[COLORS.blue_01, "#000A"]} start={[0, 1]} end={[1, 0]} />
            </View>


            <View style={[styles.container, {paddingTop: insets.top + 24, paddingBottom: 32}]}>
                <Text style={styles.title}>Bienvenido a{"\n"}Athletics Labs!</Text>

                <View style={styles.body}>
                    <View style={styles.statusContainer}>
                        <Text style={styles.status}>{errMsg}</Text>
                    </View>

                    <View style={styles.loginContainer}>

                        <TextInput readOnly={logining} style={styles.input} value={user} onChangeText={setUser} placeholder="Usuario o email" placeholderTextColor={COLORS.white_02} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={360}/>

                        <View style={styles.passwordContainer}>
                            <TextInput readOnly={logining} style={[styles.input, {flex: 1,}]} value={pass} onChangeText={setPass} placeholder="Contraseña" placeholderTextColor={COLORS.white_02} autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35} secureTextEntry={passVisible}/>
                            <TouchableOpacity style={styles.passwordBtn} onPress={() => setPassVisible(!passVisible)}>
                                <Icon name={passVisible ? "close-eye" : "open-eye"} color={COLORS.white_01} size={SIZES.i3}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableWithoutFeedback onPress={() => handleLogin()}>
                            <View style={styles.loginBtn}>
                                <Text style={styles.login}>Ingresar</Text>
                                <TouchableOpacity style={styles.loginIcon} onPress={() => handleLogin()}>
                                    <Icon name="arrow-right" color={COLORS.blue_01} size={SIZES.i3}/>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    <View style={styles.loginIndicator}>
                        <Icon name="user-circle" color={COLORS.black_01} size={SIZES.i3}/>
                        <Text style={styles.loginIndicatorText}>Ingreso</Text>
                    </View>

                </View>

                <TouchableWithoutFeedback onPress={() => navigation.navigate("Register")}>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Register")}>
                            <Icon name="arrow-right" size={SIZES.i3} color={COLORS.black_01}/>
                        </TouchableOpacity>
                        <Text style={styles.footerSubTitle}>First Time?</Text>
                        <Text style={styles.footerTitle}>Nueva Cuenta</Text>
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
    loginContainer: {
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
    loginBtn: {
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
    login: {
        fontFamily: "Inter_extraBold",
        color: COLORS.black_01,
        fontSize: SIZES.f1,
    },
    loginIcon: {
        backgroundColor: COLORS.black_01,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        height: 48,
        width: 48,
    },
    loginIndicator: {
        backgroundColor: COLORS.blue_01_50,
        flexDirection: "row",
        borderRadius: 12,
        padding: 8,
        gap: 8,
    },
    loginIndicatorText: {
        fontFamily: "Inter_medium",
        color: COLORS.black_01,
        fontSize: SIZES.f4,
        marginRight: 4,
    },
    footer: {
        backgroundColor: COLORS.black_01,
        paddingHorizontal: 24,
        marginHorizontal: 4,
        paddingVertical: 32,
        borderRadius: 24,
    },
    footerBtn: {
        backgroundColor: COLORS.blue_01,
        transform: [{rotate: "-45deg"}],
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        borderRadius: 24,
        zIndex: 100,
        height: 48,
        width: 48,
        right: 12,
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
