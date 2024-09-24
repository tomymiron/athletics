import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme.js";
import { useAuth } from "../context/AuthContext.jsx";
import React, { useState } from "react";

export default function Login() {
    const [statusMessage, setStatusMessage] = useState("");
    const [userError, setUserError] = useState(false);
    const [passError, setPassError] = useState(false);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { login } = useAuth();

    const handleLogin = () => {
        let isValid = true;

        if (user.trim().length < 5) {
            setUserError(true);
            isValid = false;
        } else setUserError(false);

        if (pass.length < 6) {
            setPassError(true);
            isValid = false;
        } else setPassError(false);

        if (isValid) login({ user, pass }).then((data) => {setStatusMessage(data.data)})
    };

    return (
        <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
            <Text style={styles.title}>Athletics Labs</Text>
            <Text style={styles.subtitle}>Login</Text>

            <View style={styles.inputContainer}>
                <Text>{statusMessage}</Text>
                <TextInput style={[styles.input, userError && styles.errorInput]} value={user} onChangeText={setUser} placeholder="Usuario" autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={360}/>
                <TextInput style={[styles.input, passError && styles.errorInput]} value={pass} onChangeText={setPass} placeholder="Password" autoCapitalize="none" autoCorrect={false} spellCheck={false} maxLength={35}/>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                    <Text style={styles.loginBtnText}>Ingresar</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("Register")}>
                <Text style={styles.loginBtnText}>Crear Cuenta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: COLORS.blue_01,
        paddingHorizontal: 24,
        flex: 1,
    },
    title: {
        fontFamily: "Inter_black",
        fontSize: SIZES.f1,
        color: COLORS.white_01,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: "Inter_medium",
        fontSize: SIZES.f3,
        color: COLORS.white_01,
        textAlign: "center",
        marginBottom: 24,
    },
    inputContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 4,
    },
    input: {
        backgroundColor: COLORS.black_01,
        fontFamily: "Inter_medium",
        color: COLORS.white_01,
        fontSize: SIZES.f3,
        borderRadius: 12,
        width: "80%",
        padding: 12,
        borderColor: "transparent",
        borderWidth: 2,
    },
    errorInput: {
        borderColor: COLORS.red_01,
    },
    errorText: {
        color: COLORS.red,
        fontSize: SIZES.f4,
        marginBottom: 8,
        textAlign: "left",
        width: "80%",
    },
    errorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.red_01,
        position: "absolute",
        right: -15,
    },
    loginBtn: {
        backgroundColor: COLORS.white_01,
        borderRadius: 12,
        width: "80%",
        padding: 12,
        marginTop: 12,
    },
    registerBtn: {
        backgroundColor: COLORS.white_01,
        marginLeft: "10%",
        marginBottom: 24,
        borderRadius: 12,
        width: "80%",
        padding: 12,
    },
    loginBtnText: {
        fontFamily: "Inter_black",
        color: COLORS.black_01,
        textAlign: "center",
        fontSize: SIZES.f3,
    },
});
